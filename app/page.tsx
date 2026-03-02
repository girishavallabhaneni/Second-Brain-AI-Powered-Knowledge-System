'use client'
// app/page.tsx
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Brain, Zap, Search, Globe, ArrowRight, Sparkles } from 'lucide-react'

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <main className="min-h-screen bg-ink-950 overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 border-b border-ink-800/30 backdrop-blur-md bg-ink-950/60">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-amber-500" />
          <span className="font-display text-lg text-ink-100">Second Brain</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-ink-400">
          <Link href="/dashboard" className="hover:text-ink-100 transition-colors">Dashboard</Link>
          <Link href="/capture" className="hover:text-ink-100 transition-colors">Capture</Link>
          <Link href="/docs" className="hover:text-ink-100 transition-colors">Docs</Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-ink-950 font-medium rounded-lg transition-all text-xs"
          >
            Open Brain →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center pt-20"
      >
        {/* Parallax background orbs */}
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-amber-600/5 blur-3xl pointer-events-none"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-amber-500/8 blur-3xl pointer-events-none"
          style={{ transform: `translateY(${scrollY * -0.2}px)` }}
        />
        <div
          className="absolute top-1/2 right-1/3 w-48 h-48 rounded-full bg-ink-700/30 blur-2xl pointer-events-none"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        />

        {/* Badge */}
        <div
          className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-600/30 bg-amber-600/10 text-amber-400 text-xs font-mono tracking-widest uppercase"
          style={{ animationDelay: '0.1s' }}
        >
          <Sparkles className="w-3 h-3" />
          AI-Powered Knowledge System
        </div>

        {/* Heading */}
        <h1 className="font-display text-6xl md:text-8xl text-ink-50 leading-none mb-6 max-w-4xl">
          Your thinking,
          <br />
          <span className="italic text-amber-500">organized.</span>
        </h1>

        <p className="text-ink-400 text-lg md:text-xl max-w-xl mb-10 leading-relaxed font-light">
          Capture notes, articles, and insights. Let AI summarize, tag, and surface
          the right knowledge exactly when you need it.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/capture"
            className="group flex items-center gap-2 px-7 py-3.5 bg-amber-600 hover:bg-amber-500 text-ink-950 font-semibold rounded-xl transition-all duration-200 glow-amber-sm hover:glow-amber"
          >
            Start Capturing
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-7 py-3.5 border border-ink-700 hover:border-ink-500 text-ink-300 hover:text-ink-100 rounded-xl transition-all duration-200"
          >
            View Dashboard
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-ink-600 text-xs tracking-widest uppercase font-mono">
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-ink-600" />
          scroll
        </div>
      </section>

      {/* Features */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-ink-600 text-xs font-mono tracking-widest uppercase mb-16">
            What it does
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Brain, label: 'Capture', desc: 'Notes, links, and insights with rich metadata and flexible tagging' },
              { icon: Zap, label: 'AI Summarize', desc: 'Automatically condense any entry into its essential ideas' },
              { icon: Search, label: 'Smart Query', desc: 'Ask questions. Get answers sourced directly from your knowledge' },
              { icon: Globe, label: 'Public API', desc: 'Expose your brain via API for external tools and integrations' },
            ].map(({ icon: Icon, label, desc }, i) => (
              <div
                key={label}
                className="group p-6 rounded-2xl border border-ink-800 bg-ink-900/50 hover:border-amber-600/30 hover:bg-ink-900 transition-all duration-300"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-10 h-10 rounded-xl bg-amber-600/10 border border-amber-600/20 flex items-center justify-center mb-4 group-hover:bg-amber-600/20 transition-colors">
                  <Icon className="w-4.5 h-4.5 text-amber-500" />
                </div>
                <h3 className="font-display text-lg text-ink-100 mb-2">{label}</h3>
                <p className="text-ink-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 border-t border-ink-800/50">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { num: 'Gemini', label: 'AI Engine' },
            { num: 'REST', label: 'Public API' },
            { num: '< 1s', label: 'Avg Query Time' },
          ].map(({ num, label }) => (
            <div key={label}>
              <div className="font-display text-3xl text-amber-500 mb-1">{num}</div>
              <div className="text-ink-500 text-sm font-mono">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-5xl text-ink-50 mb-6">
            Ready to think
            <br />
            <span className="italic text-amber-500">better?</span>
          </h2>
          <Link
            href="/capture"
            className="inline-flex items-center gap-2 px-8 py-4 bg-ink-800 hover:bg-ink-700 border border-ink-700 hover:border-ink-500 text-ink-100 rounded-xl transition-all duration-200 font-medium"
          >
            Add your first note <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-800/50 px-8 py-8 flex items-center justify-between text-ink-600 text-xs font-mono">
        <span>Second Brain © 2024</span>
        <span>Built for the Altibbe Internship Assessment</span>
      </footer>
    </main>
  )
}
