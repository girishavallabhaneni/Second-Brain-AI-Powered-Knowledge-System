// app/docs/page.tsx
import Link from 'next/link'
import { Brain, ArrowLeft, Layers, Paintbrush, Bot, Globe } from 'lucide-react'

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-ink-950">
      <nav className="sticky top-0 z-40 flex items-center justify-between px-8 py-4 border-b border-ink-800/50 backdrop-blur-md bg-ink-950/80">
        <Link href="/" className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-amber-500" />
          <span className="font-display text-lg text-ink-100">Second Brain</span>
        </Link>
        <Link href="/dashboard" className="flex items-center gap-2 text-ink-400 hover:text-ink-200 text-sm transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Dashboard
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-14 space-y-16">
        <div>
          <p className="text-amber-500 text-xs font-mono tracking-widest uppercase mb-3">Documentation</p>
          <h1 className="font-display text-5xl text-ink-50 mb-4">Architecture</h1>
          <p className="text-ink-400 leading-relaxed">
            Second Brain is a full-stack AI knowledge management system. Below is a technical
            overview of its four core architectural properties.
          </p>
        </div>

        {/* 1. Portable Architecture */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-500" />
            <h2 className="font-display text-2xl text-ink-100">1. Portable Architecture</h2>
          </div>
          <p className="text-ink-400 text-sm leading-relaxed">
            The system is built with strict separation of concerns. Each layer is independently swappable:
          </p>
          <div className="space-y-3">
            {[
              { layer: 'Frontend', current: 'Next.js + Tailwind', swap: 'Any React framework, Vue, Svelte' },
              { layer: 'API', current: 'Next.js API Routes', swap: 'Express, FastAPI, Hono' },
              { layer: 'Database', current: 'PostgreSQL + Prisma', swap: 'MongoDB, SQLite (change 1 line in schema)' },
              { layer: 'AI Provider', current: 'Google Gemini 1.5 Flash (FREE)', swap: 'OpenAI, Claude, Mistral (change lib/ai.ts)' },
              { layer: 'Deployment', current: 'Vercel + Neon', swap: 'Railway, Render, Fly.io, self-hosted' },
            ].map(({ layer, current, swap }) => (
              <div key={layer} className="p-4 bg-ink-900 border border-ink-800 rounded-xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-ink-200 text-sm font-medium mb-0.5">{layer}</div>
                    <div className="text-amber-400 text-xs font-mono">{current}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-ink-600 text-xs">Can swap with</div>
                    <div className="text-ink-400 text-xs">{swap}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. UX Principles */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Paintbrush className="w-5 h-5 text-amber-500" />
            <h2 className="font-display text-2xl text-ink-100">2. Principles-Based UX</h2>
          </div>
          <div className="space-y-3">
            {[
              { n: '01', title: 'Speed First', desc: 'Save instantly; AI runs in the background. Users are never blocked waiting for AI. The form submits in milliseconds, AI enrichment happens asynchronously.' },
              { n: '02', title: 'Skeleton over Spinner', desc: 'Content structure is shown immediately via skeleton loaders, giving users spatial context while data loads. Reduces perceived wait time.' },
              { n: '03', title: 'Progressive Disclosure', desc: 'Only essential fields are required. Source URL, manual tags, and advanced options are secondary — keeping the capture flow frictionless.' },
              { n: '04', title: 'AI as Enhancement, Not Requirement', desc: 'The app works fully without AI. If an API key is missing, summaries are simply not generated. Core functionality never depends on third-party AI availability.' },
              { n: '05', title: 'Ambient Feedback', desc: 'Hover states, type badges, transitions, and glow effects communicate state without cluttering the UI with explicit status messages.' },
            ].map(({ n, title, desc }) => (
              <div key={n} className="p-5 bg-ink-900 border border-ink-800 rounded-xl flex gap-4">
                <span className="text-ink-700 font-mono text-sm flex-shrink-0 mt-0.5">{n}</span>
                <div>
                  <div className="text-ink-100 text-sm font-medium mb-1">{title}</div>
                  <div className="text-ink-500 text-sm leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Agent Thinking */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-amber-500" />
            <h2 className="font-display text-2xl text-ink-100">3. Agent Thinking</h2>
          </div>
          <p className="text-ink-400 text-sm leading-relaxed">
            The system includes automated intelligence that runs independently of user action:
          </p>
          <div className="space-y-3">
            {[
              { title: 'Auto-Enrichment Pipeline', desc: 'Every new knowledge item triggers an async AI pipeline: (1) Summarize content into 2-3 sentences, (2) Generate 3-5 relevant tags. Both are stored back to the database.' },
              { title: 'Contextual Querying', desc: 'The /api/ai/query endpoint fetches the 20 most recent items, builds a context window, and answers user questions sourced directly from their knowledge base.' },
              { title: 'Graceful Degradation', desc: 'If AI enrichment fails (rate limit, API error), the item is still saved clean. The pipeline retries are logged. Core data is never at risk from AI failures.' },
            ].map(({ title, desc }) => (
              <div key={title} className="p-5 bg-ink-900 border border-ink-800 rounded-xl">
                <div className="text-amber-400 text-sm font-medium mb-1">{title}</div>
                <div className="text-ink-500 text-sm leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Infrastructure */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-amber-500" />
            <h2 className="font-display text-2xl text-ink-100">4. Infrastructure Mindset</h2>
          </div>
          <p className="text-ink-400 text-sm leading-relaxed">
            Second Brain exposes a public REST API so external tools can tap into your knowledge.
          </p>
          <div className="p-5 bg-ink-900 border border-ink-800 rounded-xl">
            <div className="text-ink-400 text-xs font-mono mb-4">Public Endpoint</div>
            <code className="block text-amber-400 font-mono text-sm bg-ink-800 px-4 py-3 rounded-lg mb-3">
              GET /api/public/brain/query?q=your+question
            </code>
            <div className="text-ink-600 text-xs font-mono mb-3">Returns JSON:</div>
            <pre className="text-ink-400 text-xs font-mono bg-ink-800 px-4 py-3 rounded-lg overflow-x-auto">{`{
  "question": "What do I know about AI?",
  "answer": "Based on your notes...",
  "sources": ["Note title 1", "Note title 2"],
  "timestamp": "2024-01-01T00:00:00.000Z"
}`}</pre>
            <p className="text-ink-600 text-xs mt-3">
              CORS headers included. Can be called from any external service, browser, or tool.
            </p>
          </div>
        </section>

        {/* Stack Summary */}
        <section className="p-6 border border-amber-600/20 bg-amber-600/5 rounded-2xl">
          <h3 className="font-display text-xl text-ink-100 mb-4">Tech Stack</h3>
          <div className="grid grid-cols-2 gap-2 text-sm font-mono">
            {[
              ['Frontend', 'Next.js 14, React, Tailwind CSS'],
              ['Backend', 'Next.js API Routes (Node.js)'],
              ['Database', 'PostgreSQL + Prisma ORM + pgvector'],
              ['AI', 'Google Gemini 1.5 Flash (FREE)'],
              ['Embeddings', 'Gemini text-embedding-004 (FREE)'],
              ['Auth', 'JWT + bcrypt (jose + bcryptjs)'],
              ['Graph', 'React Flow'],
              ['Deployment', 'Vercel + Neon (serverless Postgres)'],
            ].map(([k, v]) => (
              <div key={k}>
                <span className="text-ink-600">{k}: </span>
                <span className="text-ink-300">{v}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
