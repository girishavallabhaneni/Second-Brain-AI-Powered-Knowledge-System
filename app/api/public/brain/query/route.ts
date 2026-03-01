// app/api/public/brain/query/route.ts
export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { queryBrain } from '@/lib/ai'

// Public endpoint — no auth required
// GET /api/public/brain/query?q=your+question
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const question = searchParams.get('q')

  if (!question) {
    return NextResponse.json(
      {
        error: 'Missing query param: ?q=your+question',
        usage: 'GET /api/public/brain/query?q=what+do+I+know+about+AI',
      },
      { status: 400 }
    )
  }

  const items = await prisma.knowledgeItem.findMany({
    select: { title: true, content: true, summary: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  const answer = await queryBrain(question, items)

  return NextResponse.json(
    {
      question,
      answer,
      sources: items.slice(0, 5).map((i) => i.title),
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    }
  )
}
