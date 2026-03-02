// app/api/ai/query/route.ts
export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { queryBrain } from '@/lib/ai'
import { getSession } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { question } = await request.json()

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    // Get session to find user's items
    const session = await getSession()

    let items
    if (session?.userId) {
      // Logged in - get user's own items
      items = await prisma.knowledgeItem.findMany({
        where: { userId: session.userId },
        select: { title: true, content: true, summary: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
      })
    }

    // Fallback - get all items if no user items found
    if (!items || items.length === 0) {
      items = await prisma.knowledgeItem.findMany({
        select: { title: true, content: true, summary: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
      })
    }

    if (items.length === 0) {
      return NextResponse.json({
        answer: 'Your knowledge base is empty. Add some notes first!',
      })
    }

    const answer = await queryBrain(question, items)
    return NextResponse.json({ answer })
  } catch (e) {
    console.error('AI query error:', e)
    return NextResponse.json({ 
      answer: 'Something went wrong. Please try again.' 
    }, { status: 500 })
  }
}
