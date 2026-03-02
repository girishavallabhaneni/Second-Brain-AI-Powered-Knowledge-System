// app/api/ai/query/route.ts
export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { question } = await request.json()
    if (!question?.trim()) {
      return NextResponse.json({ answer: 'Please enter a question.' })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ answer: 'GEMINI_API_KEY not set in Vercel environment variables.' })
    }

    // Get all items from database
    const items = await prisma.knowledgeItem.findMany({
      select: { title: true, content: true, summary: true },
      orderBy: { createdAt: 'desc' },
      take: 15,
    })

    if (!items || items.length === 0) {
      return NextResponse.json({
        answer: 'No notes found. Please add some notes using the Capture button first!'
      })
    }

    // Build context
    const context = items
      .map((item, i) => `[${i + 1}] ${item.title}: ${item.summary || item.content.slice(0, 400)}`)
      .join('\n\n')

    // Call Gemini REST API directly (no SDK - avoids timeout issues)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
    
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a helpful second brain assistant. Answer the question using the knowledge notes below. Be concise and helpful.

NOTES:
${context}

QUESTION: ${question}

ANSWER:`
          }]
        }],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        }
      })
    })

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text()
      console.error('Gemini API error:', errText)
      return NextResponse.json({ 
        answer: `Gemini API error: ${geminiResponse.status}. Check your API key in Vercel.` 
      })
    }

    const geminiData = await geminiResponse.json()
    const answer = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    if (!answer) {
      return NextResponse.json({ answer: 'No response from Gemini. Please try again.' })
    }

    return NextResponse.json({ answer })

  } catch (e: any) {
    console.error('Query error:', e)
    return NextResponse.json({ 
      answer: `Error: ${e?.message || 'Something went wrong'}` 
    })
  }
}
