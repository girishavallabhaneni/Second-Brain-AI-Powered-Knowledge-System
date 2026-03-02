// app/api/ai/query/route.ts
export const dynamic = 'force-dynamic'
export const maxDuration = 30

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: Request) {
  try {
    const { question } = await request.json()

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    // Check API key exists
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ answer: 'AI service not configured. Please check GEMINI_API_KEY.' })
    }

    // Get session to find user's items
    const session = await getSession()

    let items
    if (session?.userId) {
      items = await prisma.knowledgeItem.findMany({
        where: { userId: session.userId },
        select: { title: true, content: true, summary: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      })
    }

    // Fallback - get all items
    if (!items || items.length === 0) {
      items = await prisma.knowledgeItem.findMany({
        select: { title: true, content: true, summary: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      })
    }

    if (items.length === 0) {
      return NextResponse.json({
        answer: 'Your knowledge base is empty. Add some notes first!',
      })
    }

    // Call Gemini directly with timeout
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const context = items
      .map((item, i) => `[${i + 1}] ${item.title}: ${item.summary || item.content.slice(0, 200)}`)
      .join('\n\n')

    const prompt = `You are a helpful knowledge assistant. Answer the question using ONLY the notes below. Be concise.

Notes:
${context}

Question: ${question}

Answer:`

    const result = await model.generateContent(prompt)
    const answer = result.response.text().trim()

    return NextResponse.json({ answer })

  } catch (e: any) {
    console.error('AI query error:', e?.message || e)
    return NextResponse.json({ 
      answer: `Error: ${e?.message || 'Something went wrong. Please try again.'}` 
    })
  }
}
