'use client'
// app/dashboard/page.tsx
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Brain, Plus, Search, Trash2, Sparkles, MessageSquare, X, ExternalLink, Zap, Upload, GitBranch } from 'lucide-react'
import SemanticSearch from '@/components/SemanticSearch'

type ItemType = 'NOTE' | 'LINK' | 'INSIGHT'

interface KnowledgeItem {
  id: string
  title: string
  content: string
  type: ItemType
  sourceUrl?: string
  tags: string[]
  summary?: string
  fileName?: string
  createdAt: string
}

function SkeletonCard() {
  return (
    <div className="p-6 rounded-2xl border border-ink-800 bg-ink-900/50" aria-hidden="true">
      <div className="skeleton h-4 w-3/4 rounded mb-3" />
      <div className="skeleton h-3 w-full rounded mb-2" />
      <div className="skeleton h-3 w-2/3 rounded mb-4" />
      <div className="flex gap-2">
        <div className="skeleton h-5 w-14 rounded-full" />
        <div className="skeleton h-5 w-20 rounded-full" />
      </div>
    </div>
  )
}

const TYPE_COLORS: Record<ItemType, string> = {
  NOTE: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  LINK: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  INSIGHT: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
}

export default function DashboardPage() {
  const [items, setItems] = useState<KnowledgeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiAnswer, setAiAnswer] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [showAi, setShowAi] = useState(false)
  const [showSemanticSearch, setShowSemanticSearch] = useState(false)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (typeFilter) params.set('type', typeFilter)
    const res = await fetch(`/api/items?${params}`)
    const data = await res.json()
    setItems(data)
    setLoading(false)
  }, [search, typeFilter])

  useEffect(() => {
    const timer = setTimeout(fetchItems, 300)
    return () => clearTimeout(timer)
  }, [fetchItems])

  async function deleteItem(id: string) {
    await fetch(`/api/items/${id}`, { method: 'DELETE' })
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  async function askAI() {
    if (!aiQuestion.trim()) return
    setAiLoading(true)
    setAiAnswer('')
    const res = await fetch('/api/ai/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: aiQuestion }),
    })
    const data = await res.json()
    setAiAnswer(data.answer)
    setAiLoading(false)
  }

  return (
    <main className="min-h-screen bg-ink-950" id="main-content">
      {/* Nav */}
      <nav className="sticky top-0 z-40 flex items-center justify-between px-8 py-4 border-b border-ink-800/50 backdrop-blur-md bg-ink-950/80" role="navigation" aria-label="Main navigation">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2" aria-label="Second Brain home">
            <Brain className="w-5 h-5 text-amber-500" aria-hidden="true" />
            <span className="font-display text-lg text-ink-100">Second Brain</span>
          </Link>
          <span className="text-ink-700" aria-hidden="true">/</span>
          <span className="text-ink-400 text-sm">Dashboard</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            onClick={() => setShowSemanticSearch(true)}
            className="flex items-center gap-2 px-3 py-2 border border-ink-700 hover:border-ink-500 bg-ink-900 hover:bg-ink-800 text-ink-400 hover:text-ink-200 rounded-xl transition-all text-xs"
            aria-label="Open semantic search"
          >
            <Zap className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Vector Search</span>
          </button>
          <button
            onClick={() => setShowAi(true)}
            className="flex items-center gap-2 px-3 py-2 border border-amber-600/30 bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 rounded-xl transition-all text-xs"
            aria-label="Ask AI a question"
          >
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
          <Link
            href="/graph"
            className="flex items-center gap-2 px-3 py-2 border border-ink-700 hover:border-ink-500 bg-ink-900 text-ink-400 hover:text-ink-200 rounded-xl transition-all text-xs"
            aria-label="View knowledge graph"
          >
            <GitBranch className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Graph</span>
          </Link>
          <Link
            href="/upload"
            className="flex items-center gap-2 px-3 py-2 border border-ink-700 hover:border-ink-500 bg-ink-900 text-ink-400 hover:text-ink-200 rounded-xl transition-all text-xs"
            aria-label="Upload a document"
          >
            <Upload className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Upload</span>
          </Link>
          <Link
            href="/capture"
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-ink-950 font-medium rounded-xl transition-all text-xs"
            aria-label="Capture a new knowledge item"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            Capture
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl text-ink-50 mb-1">Knowledge Base</h1>
          <p className="text-ink-500 text-sm" aria-live="polite">{items.length} items in your brain</p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8" role="search" aria-label="Filter knowledge items">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-600" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search your knowledge..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-ink-900 border border-ink-800 rounded-xl text-ink-200 placeholder-ink-600 focus:outline-none focus:border-amber-600/50 focus:ring-2 focus:ring-amber-600/20 transition-colors text-sm"
              aria-label="Search knowledge items"
            />
          </div>
          <div className="flex gap-2" role="group" aria-label="Filter by type">
            {['', 'NOTE', 'LINK', 'INSIGHT'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                  typeFilter === t
                    ? 'border-amber-600 bg-amber-600/20 text-amber-400'
                    : 'border-ink-800 bg-ink-900 text-ink-500 hover:text-ink-300'
                }`}
                aria-pressed={typeFilter === t}
                aria-label={`Filter by ${t || 'all types'}`}
              >
                {t || 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4" aria-busy="true" aria-label="Loading knowledge items">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24">
            <Brain className="w-10 h-10 text-ink-700 mx-auto mb-4" aria-hidden="true" />
            <p className="text-ink-500 mb-4">Your brain is empty.</p>
            <Link href="/capture" className="text-amber-500 hover:text-amber-400 text-sm underline underline-offset-4">
              Add your first note →
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4" role="list" aria-label="Knowledge items">
            {items.map((item) => (
              <article
                key={item.id}
                role="listitem"
                className="group relative p-5 rounded-2xl border border-ink-800 bg-ink-900/60 hover:border-ink-700 hover:bg-ink-900 transition-all duration-200"
                aria-label={`${item.type}: ${item.title}`}
              >
                <button
                  onClick={() => deleteItem(item.id)}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-ink-600 hover:text-red-400 transition-all focus:opacity-100"
                  aria-label={`Delete "${item.title}"`}
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                </button>

                <div className="flex items-center gap-2 mb-3">
                  <span className={`inline-flex text-xs px-2 py-0.5 rounded-full border ${TYPE_COLORS[item.type]}`}>
                    {item.type}
                  </span>
                  {item.fileName && (
                    <span className="text-xs text-ink-600 font-mono" title={`From file: ${item.fileName}`}>
                      📄 {item.fileName.slice(0, 20)}
                    </span>
                  )}
                </div>

                <h2 className="font-display text-ink-100 text-lg leading-snug mb-2 pr-6">{item.title}</h2>

                {item.summary ? (
                  <div className="flex items-start gap-1.5 mb-3">
                    <Sparkles className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <p className="text-ink-400 text-xs leading-relaxed">{item.summary}</p>
                  </div>
                ) : (
                  <p className="text-ink-500 text-xs leading-relaxed mb-3 line-clamp-3">{item.content}</p>
                )}

                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3" aria-label="Tags">
                    {item.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-ink-800 text-ink-500 font-mono">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-ink-700 text-xs font-mono">
                  <time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleDateString()}</time>
                  {item.sourceUrl && (
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-ink-400 transition-colors"
                      aria-label={`Open source URL for ${item.title}`}
                    >
                      <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* AI Query Modal */}
      {showAi && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-ink-950/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Ask AI"
        >
          <div className="w-full max-w-lg bg-ink-900 border border-ink-700 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" aria-hidden="true" />
                <h2 className="font-display text-xl text-ink-100">Ask Your Brain</h2>
              </div>
              <button
                onClick={() => { setShowAi(false); setAiAnswer(''); setAiQuestion('') }}
                className="p-1 text-ink-600 hover:text-ink-300 transition-colors"
                aria-label="Close AI query dialog"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <textarea
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), askAI())}
              placeholder="What do I know about machine learning?"
              rows={3}
              className="w-full px-4 py-3 bg-ink-800 border border-ink-700 rounded-xl text-ink-200 placeholder-ink-600 focus:outline-none focus:border-amber-600/50 text-sm resize-none mb-3"
              aria-label="Question for AI"
            />
            <button
              onClick={askAI}
              disabled={aiLoading}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-ink-950 font-medium rounded-xl transition-all text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-busy={aiLoading}
            >
              {aiLoading ? 'Thinking...' : 'Ask'}
            </button>

            {aiAnswer && (
              <div className="mt-4 p-4 bg-ink-800/50 rounded-xl border border-ink-700" aria-live="polite">
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <p className="text-ink-300 text-sm leading-relaxed">{aiAnswer}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Semantic Search Modal */}
      <SemanticSearch open={showSemanticSearch} onClose={() => setShowSemanticSearch(false)} />
    </main>
  )
}
