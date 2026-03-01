// lib/ai.ts — powered by Google Gemini (FREE)
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// Main model for text tasks
function getModel() {
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
}

// ─── Summarize ───────────────────────────────────────────────────────────────
export async function summarizeContent(title: string, content: string): Promise<string> {
  try {
    const model = getModel()
    const prompt = `You are a knowledge assistant. Generate a concise, insightful summary in 2-3 sentences. Focus on the core ideas and what makes this worth remembering.

Title: ${title}
Content: ${content.slice(0, 5000)}

Provide only the summary, no extra text.`

    const result = await model.generateContent(prompt)
    return result.response.text().trim()
  } catch (e) {
    console.error('Gemini summarize error:', e)
    return ''
  }
}

// ─── Auto-Tag ─────────────────────────────────────────────────────────────────
export async function generateTags(title: string, content: string): Promise<string[]> {
  try {
    const model = getModel()
    const prompt = `You are a knowledge categorization assistant. Return ONLY a JSON array of 3-5 lowercase tags that best categorize this content. No explanation, no markdown, just the raw JSON array.

Example output: ["productivity","learning","ai"]

Title: ${title}
Content: ${content.slice(0, 3000)}`

    const result = await model.generateContent(prompt)
    const raw = result.response.text().trim()
    // Strip any markdown code fences if present
    const clean = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch (e) {
    console.error('Gemini tags error:', e)
    return ['general']
  }
}

// ─── Embeddings ───────────────────────────────────────────────────────────────
// Gemini has an embedding model too — completely free
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' })
    const result = await embeddingModel.embedContent(text.slice(0, 8000))
    return result.embedding.values
  } catch (e) {
    console.error('Gemini embedding error:', e)
    // Return empty array — vector search will gracefully fall back to keyword search
    return []
  }
}

// ─── Query Brain ─────────────────────────────────────────────────────────────
export async function queryBrain(
  question: string,
  items: { title: string; content: string; summary?: string | null }[]
): Promise<string> {
  try {
    const model = getModel()
    const context = items
      .slice(0, 10)
      .map((item, i) => `[${i + 1}] ${item.title}: ${item.summary || item.content.slice(0, 300)}`)
      .join('\n\n')

    const prompt = `You are a second brain assistant. Answer questions using ONLY the knowledge items provided below. If you cannot answer from the provided context, say so clearly. Be concise and reference specific items when possible.

Knowledge Base:
${context}

Question: ${question}

Answer:`

    const result = await model.generateContent(prompt)
    return result.response.text().trim()
  } catch (e) {
    console.error('Gemini query error:', e)
    return 'I could not find relevant information in your knowledge base.'
  }
}

