// app/api/items/route.ts
export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { summarizeContent, generateTags, generateEmbedding } from '@/lib/ai'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const type = searchParams.get('type') || ''
  const tag = searchParams.get('tag') || ''
  const sort = searchParams.get('sort') || 'createdAt'

  const where: any = {}

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (type) where.type = type
  if (tag) where.tags = { has: tag }

  const items = await prisma.knowledgeItem.findMany({
    where,
    orderBy: { [sort]: 'desc' },
    select: {
      id: true, title: true, content: true, type: true,
      sourceUrl: true, tags: true, summary: true,
      fileUrl: true, fileName: true, fileType: true,
      createdAt: true, updatedAt: true,
    }
  })

  return NextResponse.json(items)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { title, content, type, sourceUrl, tags } = body

  if (!title || !content) {
    return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
  }

  const item = await prisma.knowledgeItem.create({
    data: {
      title,
      content,
      type: type || 'NOTE',
      sourceUrl: sourceUrl || null,
      tags: tags || [],
    },
  })

  // Run AI enrichment + embedding generation in background
  runAIEnrichment(item.id, title, content)

  return NextResponse.json(item, { status: 201 })
}

async function runAIEnrichment(id: string, title: string, content: string) {
  try {
    const [summary, aiTags, embedding] = await Promise.all([
      summarizeContent(title, content),
      generateTags(title, content),
      generateEmbedding(`${title}\n\n${content}`),
    ])

    // Use raw SQL to store vector since Prisma doesn't natively support it
    await prisma.$executeRaw`
      UPDATE knowledge_items
      SET summary = ${summary},
          tags = ${aiTags},
          embedding = ${`[${embedding.join(',')}]`}::vector
      WHERE id = ${id}
    `
  } catch (e) {
    console.error('AI enrichment failed:', e)
    // Still try to save summary/tags without embedding
    try {
      const [summary, aiTags] = await Promise.all([
        summarizeContent(title, content),
        generateTags(title, content),
      ])
      await prisma.knowledgeItem.update({
        where: { id },
        data: { summary, tags: aiTags },
      })
    } catch (e2) {
      console.error('Fallback enrichment also failed:', e2)
    }
  }
}
