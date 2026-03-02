// app/api/ai/query/route.ts
export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { queryBrain } from '@/lib/ai'

export async function POST(request: Request) {
  const { question } = await request.json()

  if (!question) {
    return NextResponse.json({ error: 'Question is required' }, { status: 400 })
  }

  const items = await prisma.knowledgeItem.findMany({
    select: { title: true, content: true, summary: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  if (items.length === 0) {
    return NextResponse.json({
      answer: 'Your knowledge base is empty. Add some notes first!',
    })
  }

  const answer = await queryBrain(question, items)
  return NextResponse.json({ answer })
}
