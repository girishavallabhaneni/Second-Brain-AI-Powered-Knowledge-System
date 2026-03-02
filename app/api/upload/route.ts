export const dynamic = 'force-dynamic'
export const maxDuration = 30

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { summarizeContent, generateTags, generateEmbedding } from '@/lib/ai'

// Suppress type errors for pdf-parse
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pdfParse: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mammothLib: any = null

async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<string> {
  if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) {
    try {
      if (!pdfParse) pdfParse = (await import('pdf-parse' as any)).default
      const data = await pdfParse(buffer)
      return data.text.slice(0, 10000)
    } catch {
      return `[PDF file: ${fileName} — text extraction failed]`
    }
  }

  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    try {
      if (!mammothLib) mammothLib = await import('mammoth' as any)
      const result = await mammothLib.extractRawText({ buffer })
      return result.value.slice(0, 10000)
    } catch {
      return `[DOCX file: ${fileName} — text extraction failed]`
    }
  }

  if (mimeType.startsWith('text/') || fileName.endsWith('.txt') || fileName.endsWith('.md')) {
    return buffer.toString('utf-8').slice(0, 10000)
  }

  return `[File: ${fileName} — unsupported format]`
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const title = formData.get('title') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 10MB.' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const extractedText = await extractTextFromFile(buffer, file.type, file.name)
    const itemTitle = title?.trim() || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')

    const item = await prisma.knowledgeItem.create({
      data: {
        title: itemTitle,
        content: extractedText,
        type: 'NOTE',
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        tags: [],
      },
    })

    enrichFileItem(item.id, itemTitle, extractedText)

    return NextResponse.json({
      success: true,
      item: { id: item.id, title: item.title, fileName: item.fileName, contentLength: extractedText.length },
    }, { status: 201 })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
  }
}

async function enrichFileItem(id: string, title: string, content: string) {
  try {
    const [summary, aiTags, embedding] = await Promise.all([
      summarizeContent(title, content),
      generateTags(title, content),
      generateEmbedding(`${title}\n\n${content}`),
    ])
    if (embedding && embedding.length > 0) {
      await prisma.$executeRaw`
        UPDATE knowledge_items
        SET summary = ${summary}, tags = ${aiTags}, embedding = ${`[${embedding.join(',')}]`}::vector
        WHERE id = ${id}
      `
    } else {
      await prisma.knowledgeItem.update({ where: { id }, data: { summary, tags: aiTags } })
    }
  } catch (e) {
    console.error('File enrichment failed:', e)
  }
}
