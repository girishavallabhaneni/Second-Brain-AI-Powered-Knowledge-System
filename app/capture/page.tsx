'use client'
// app/capture/page.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Brain, ArrowLeft, Sparkles, Check } from 'lucide-react'

type ItemType = 'NOTE' | 'LINK' | 'INSIGHT'

export default function CapturePage() {
  const router = useRouter()
  const [form, setForm] = useState({
    title: '',
    content: '',
    type: 'NOTE' as ItemType,
    sourceUrl: '',
    tags: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError('')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) {
      setError('Title and content are required.')
      return
    }

    setLoading(true)
    const tags = form.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)

    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        content: form.content,
        type: form.type,
        sourceUrl: form.sourceUrl || undefined,
        tags,
      }),
    })

    if (res.ok) {
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 1500)
    } else {
      setError('Failed to save. Try again.')
    }
    setLoading(false)
  }

  const TYPE_OPTIONS: { value: ItemType; label: string; desc: string }[] = [
    { value: 'NOTE', label: 'Note', desc: 'Thoughts and observations' },
    { value: 'LINK', label: 'Link', desc: 'Articles and resources' },
    { value: 'INSIGHT', label: 'Insight', desc: 'Key learnings and "aha" moments' },
  ]

  return (
    <main className="min-h-screen bg-ink-950">
      {/* Nav */}
      <nav className="sticky top-0 z-40 flex items-center justify-between px-8 py-4 border-b border-ink-800/50 backdrop-blur-md bg-ink-950/80">
        <Link href="/" className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-amber-500" />
          <span className="font-display text-lg text-ink-100">Second Brain</span>
        </Link>
        <Link href="/dashboard" className="flex items-center gap-2 text-ink-400 hover:text-ink-200 text-sm transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-amber-500 text-xs font-mono tracking-widest uppercase mb-3">
            <Sparkles className="w-3 h-3" />
            AI will auto-summarize & tag
          </div>
          <h1 className="font-display text-5xl text-ink-50">Capture a thought</h1>
        </div>

        {/* Success */}
        {success && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">Saved! AI is processing your entry... Redirecting.</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-6">
          {/* Type selector */}
          <div>
            <label className="text-ink-400 text-xs font-mono tracking-wider uppercase mb-3 block">Type</label>
            <div className="grid grid-cols-3 gap-3">
              {TYPE_OPTIONS.map(({ value, label, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => update('type', value)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    form.type === value
                      ? 'border-amber-600 bg-amber-600/10'
                      : 'border-ink-800 bg-ink-900 hover:border-ink-600'
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${form.type === value ? 'text-amber-400' : 'text-ink-300'}`}>
                    {label}
                  </div>
                  <div className="text-ink-600 text-xs">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-ink-400 text-xs font-mono tracking-wider uppercase mb-2 block">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="Give it a clear, descriptive title"
              className="w-full px-4 py-3 bg-ink-900 border border-ink-800 focus:border-amber-600/50 rounded-xl text-ink-100 placeholder-ink-600 focus:outline-none transition-colors"
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-ink-400 text-xs font-mono tracking-wider uppercase mb-2 block">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.content}
              onChange={(e) => update('content', e.target.value)}
              placeholder="Write your full thoughts, paste an article excerpt, or describe your insight..."
              rows={8}
              className="w-full px-4 py-3 bg-ink-900 border border-ink-800 focus:border-amber-600/50 rounded-xl text-ink-100 placeholder-ink-600 focus:outline-none transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Source URL */}
          <div>
            <label className="text-ink-400 text-xs font-mono tracking-wider uppercase mb-2 block">
              Source URL <span className="text-ink-700">(optional)</span>
            </label>
            <input
              type="url"
              value={form.sourceUrl}
              onChange={(e) => update('sourceUrl', e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3 bg-ink-900 border border-ink-800 focus:border-amber-600/50 rounded-xl text-ink-100 placeholder-ink-600 focus:outline-none transition-colors font-mono text-sm"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-ink-400 text-xs font-mono tracking-wider uppercase mb-2 block">
              Tags <span className="text-ink-700">(optional — AI will also add tags)</span>
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => update('tags', e.target.value)}
              placeholder="ai, productivity, learning (comma-separated)"
              className="w-full px-4 py-3 bg-ink-900 border border-ink-800 focus:border-amber-600/50 rounded-xl text-ink-100 placeholder-ink-600 focus:outline-none transition-colors font-mono text-sm"
            />
          </div>

          {/* Note about AI */}
          <div className="flex items-start gap-2 p-4 bg-amber-600/5 border border-amber-600/20 rounded-xl">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-ink-500 text-xs leading-relaxed">
              After saving, AI will automatically generate a summary and suggest tags.
              This happens in the background — your note is saved instantly.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-ink-950 font-semibold rounded-xl transition-all duration-200 text-sm"
          >
            {loading ? 'Saving...' : success ? 'Saved!' : 'Save to Brain'}
          </button>
        </form>
      </div>
    </main>
  )
}
