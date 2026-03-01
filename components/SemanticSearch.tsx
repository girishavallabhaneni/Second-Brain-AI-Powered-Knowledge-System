'use client'
// components/SemanticSearch.tsx
import { useState } from 'react'
import { Sparkles, X, Search, ExternalLink, Zap } from 'lucide-react'

interface SearchResult {
  id: string
  title: string
  content: string
  type: string
  tags: string[]
  summary: string | null
  similarity: number | null
  createdAt: string
}

interface Props {
  open: boolean
  onClose: () => void
}

const TYPE_COLORS: Record<string, string> = {
  NOTE: 'text-blue-400',
  LINK: 'text-purple-400',
  INSIGHT: 'text-amber-400',
}

export default function SemanticSearch({ open, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [isFallback, setIsFallback] = useState(false)

  async function search() {
    if (!query.trim()) return
    setLoading(true)
    setSearched(false)
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, limit: 6 }),
    })
    const data = await res.json()
    setResults(data.results || [])
    setIsFallback(data.fallback || false)
    setLoading(false)
    setSearched(true)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-ink-950/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Semantic search"
    >
      <div className="w-full max-w-2xl bg-ink-900 border border-ink-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-800">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" aria-hidden="true" />
            <h2 className="font-display text-lg text-ink-100">Semantic Search</h2>
            <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full font-mono">
              AI-powered
            </span>
          </div>
          <button
            onClick={() => { onClose(); setQuery(''); setResults([]); setSearched(false) }}
            className="p-1.5 text-ink-600 hover:text-ink-300 transition-colors rounded-lg hover:bg-ink-800"
            aria-label="Close semantic search"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-4 border-b border-ink-800">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-600" aria-hidden="true" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && search()}
                placeholder="Search by meaning, not just keywords... e.g. 'ideas about creativity'"
                className="w-full pl-10 pr-4 py-3 bg-ink-800 border border-ink-700 focus:border-amber-600/50 rounded-xl text-ink-100 placeholder-ink-600 focus:outline-none focus:ring-2 focus:ring-amber-600/20 text-sm transition-all"
                aria-label="Semantic search query"
                autoFocus
              />
            </div>
            <button
              onClick={search}
              disabled={loading || !query.trim()}
              className="px-5 py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-ink-950 font-medium rounded-xl transition-all text-sm flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-busy={loading}
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          <p className="text-ink-700 text-xs mt-2 ml-1">
            Uses OpenAI embeddings to find semantically similar notes — not just exact keyword matches
          </p>
        </div>

        {/* Results */}
        <div
          className="max-h-96 overflow-y-auto p-4 space-y-3"
          role="region"
          aria-label="Search results"
          aria-live="polite"
        >
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-xl border border-ink-800">
                  <div className="skeleton h-3.5 w-2/3 rounded mb-2" />
                  <div className="skeleton h-3 w-full rounded mb-1" />
                  <div className="skeleton h-3 w-4/5 rounded" />
                </div>
              ))}
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="text-center py-10 text-ink-600">
              <Search className="w-8 h-8 mx-auto mb-3 opacity-40" aria-hidden="true" />
              <p className="text-sm">No matching items found.</p>
              <p className="text-xs mt-1">Try different wording or add more notes first.</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <>
              {isFallback && (
                <div className="text-xs text-amber-600/70 bg-amber-600/5 border border-amber-600/10 rounded-lg px-3 py-2 mb-2">
                  ⚡ Showing keyword results (vector search requires notes with embeddings)
                </div>
              )}
              {results.map((item) => (
                <article
                  key={item.id}
                  className="p-4 bg-ink-800/50 border border-ink-700 rounded-xl hover:border-ink-600 transition-all"
                  aria-label={`Search result: ${item.title}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-display text-ink-100 leading-snug">{item.title}</h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.similarity !== null && (
                        <span
                          className="text-xs font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full"
                          aria-label={`Similarity score: ${Math.round(item.similarity * 100)}%`}
                        >
                          {Math.round(item.similarity * 100)}%
                        </span>
                      )}
                      <span className={`text-xs font-mono ${TYPE_COLORS[item.type] || 'text-ink-500'}`}>
                        {item.type}
                      </span>
                    </div>
                  </div>

                  <p className="text-ink-500 text-xs leading-relaxed line-clamp-2 mb-2">
                    {item.summary || item.content.slice(0, 150)}
                  </p>

                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1" aria-label="Tags">
                      {item.tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="text-xs px-1.5 py-0.5 bg-ink-700 text-ink-500 rounded font-mono">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </>
          )}

          {!searched && !loading && (
            <div className="text-center py-8 text-ink-700 text-sm">
              <Zap className="w-8 h-8 mx-auto mb-3 opacity-30" aria-hidden="true" />
              Enter a query to search your knowledge base semantically
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
