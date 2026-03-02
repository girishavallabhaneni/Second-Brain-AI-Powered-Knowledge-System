// app/api/search/route.ts
export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateEmbedding } from '@/lib/ai'

// Semantic vector search using pgvector cosine similarity
export async function POST(request: Request) {
  const { query, limit = 5 } = await request.json()

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 })
  }

  try {
    // Generate embedding for the search query
    const queryEmbedding = await generateEmbedding(query)
    const embeddingStr = `[${queryEmbedding.join(',')}]`

    // Use pgvector cosine similarity to find closest items
    // 1 - (embedding <=> query) gives cosine similarity (higher = more similar)
    const results = await prisma.$queryRaw<
      Array<{
        id: string
        title: string
        content: string
        type: string
        tags: string[]
        summary: string | null
        file_url: string | null
        file_name: string | null
        created_at: Date
        similarity: number
      }>
    >`
      SELECT
        id,
        title,
        content,
        type,
        tags,
        summary,
        file_url as "fileUrl",
        file_name as "fileName",
        created_at as "createdAt",
        1 - (embedding <=> ${embeddingStr}::vector) AS similarity
      FROM knowledge_items
      WHERE embedding IS NOT NULL
      ORDER BY embedding <=> ${embeddingStr}::vector
      LIMIT ${limit}
    `

    return NextResponse.json({
      query,
      results: results.map((r) => ({
        ...r,
        similarity: Math.round(Number(r.similarity) * 100) / 100,
      })),
    })
  } catch (error) {
    console.error('Vector search error:', error)
    // Fallback to keyword search if vector search fails
    const items = await prisma.knowledgeItem.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      select: {
        id: true, title: true, content: true, type: true,
        tags: true, summary: true, fileUrl: true, fileName: true, createdAt: true,
      }
    })
    return NextResponse.json({
      query,
      results: items.map((r) => ({ ...r, similarity: null })),
      fallback: true,
    })
  }
}
