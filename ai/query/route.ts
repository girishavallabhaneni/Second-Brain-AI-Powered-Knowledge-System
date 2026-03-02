// app/api/ai/query/route.ts
export const dynamic = 'force-dynamic'
export const maxDuration = 30

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: Request) {
  try {
    const { question } = await request.json()

    if (!question?.trim()) {
      return NextResponse.json({ answer: 'Please enter a question.' })
    }

    // Check Gemini API key
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ answer: 'Gemini API key is missing. Check Vercel environment variables.' })
    }

    // Get ALL items from database (no auth filter — works for everyone)
    const items = await prisma.knowledgeItem.findMany({
      select: { title: true, content: true, summary: true },
      orderBy: { createdAt: 'desc' },
      take: 15,
    })

    if (!items || items.length === 0) {
      return NextResponse.json({
        answer: 'Your knowledge base is empty. Please add some notes first using the Capture button!',
      })
    }

    // Build context from items
    const context = items
      .map((item, i) => `[${i + 1}] Title: ${item.title}\nContent: ${item.summary || item.content.slice(0, 300)}`)
      .join('\n\n---\n\n')

    const prompt = `You are a helpful second brain assistant. Answer the user's question using ONLY the knowledge notes provided below. Be helpful and concise. If the notes contain relevant information, use it. If not, say you don't have information about that topic yet.

KNOWLEDGE NOTES:
${context}

USER QUESTION: ${question}

ANSWER:`

    // Call Gemini
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent(prompt)
    const answer = result.response.text().trim()

    return NextResponse.json({ answer })

  } catch (e: any) {
    console.error('AI query error:', e)
    return NextResponse.json({
      answer: `AI Error: ${e?.message || 'Unknown error. Check Vercel logs.'}`
    })
  }
}
