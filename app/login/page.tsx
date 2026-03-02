'use client'
// app/login/page.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Brain, Eye, EyeOff, LogIn } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) {
      router.push('/dashboard')
    } else {
      setError(data.error)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-ink-950 flex items-center justify-center px-6" role="main">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6" aria-label="Second Brain Home">
            <Brain className="w-6 h-6 text-amber-500" aria-hidden="true" />
            <span className="font-display text-2xl text-ink-100">Second Brain</span>
          </Link>
          <h1 className="font-display text-3xl text-ink-50 mb-2">Welcome back</h1>
          <p className="text-ink-500 text-sm">Sign in to access your knowledge base</p>
        </div>

        {/* Card */}
        <div className="p-8 bg-ink-900 border border-ink-800 rounded-2xl">
          {error && (
            <div role="alert" aria-live="assertive" className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={submit} noValidate>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-ink-400 text-xs font-mono tracking-wider uppercase mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-ink-800 border border-ink-700 focus:border-amber-600/50 rounded-xl text-ink-100 placeholder-ink-600 focus:outline-none focus:ring-2 focus:ring-amber-600/20 transition-all text-sm"
                  placeholder="you@example.com"
                  aria-required="true"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-ink-400 text-xs font-mono tracking-wider uppercase mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    className="w-full px-4 py-3 pr-12 bg-ink-800 border border-ink-700 focus:border-amber-600/50 rounded-xl text-ink-100 placeholder-ink-600 focus:outline-none focus:ring-2 focus:ring-amber-600/20 transition-all text-sm"
                    placeholder="••••••••"
                    aria-required="true"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-600 hover:text-ink-400 transition-colors p-1"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-ink-950 font-semibold rounded-xl transition-all text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-ink-900"
              aria-busy={loading}
            >
              <LogIn className="w-4 h-4" aria-hidden="true" />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-ink-600 text-sm mt-6">
          No account?{' '}
          <Link href="/register" className="text-amber-500 hover:text-amber-400 underline underline-offset-4 transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </main>
  )
}
