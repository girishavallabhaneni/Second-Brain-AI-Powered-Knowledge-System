// app/api/test/route.ts
export const dynamic = 'force-dynamic'
export const maxDuration = 30

import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const results: any = {}

  // Test 1: Check API key
  results.apiKeyExists = !!process.env.GEMINI_API_KEY
  results.apiKeyPrefix = process.env.GEMINI_API_KEY?.slice(0, 8) + '...'

  // Test 2: Check database
  try {
    const count = await prisma.knowledgeItem.count()
    results.dbItemCount = count
    results.dbStatus = 'connected'
  } catch (e: any) {
    results.dbStatus = 'error: ' + e.message
  }

  // Test 3: Test Gemini directly
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent('Say hello in 3 words')
    results.geminiStatus = 'working'
    results.geminiResponse = result.response.text()
  } catch (e: any) {
    results.geminiStatus = 'error: ' + e.message
  }

  return NextResponse.json(results)
}
