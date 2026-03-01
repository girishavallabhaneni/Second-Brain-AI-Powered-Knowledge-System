'use client'
// components/Providers.tsx
import { useState, useEffect } from 'react'
import CommandPalette from './CommandPalette'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [cmdOpen, setCmdOpen] = useState(false)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <>
      {/* Skip navigation - Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-amber-600 focus:text-ink-950 focus:rounded-lg focus:font-medium focus:text-sm"
      >
        Skip to main content
      </a>

      <div id="main-content">
        {children}
      </div>

      {/* Global Command Palette — Cmd+K / Ctrl+K */}
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />

      {/* Keyboard hint */}
      <div
        className="fixed bottom-5 right-5 z-40 flex items-center gap-1.5 px-3 py-1.5 bg-ink-900/80 border border-ink-800 rounded-xl text-ink-600 text-xs font-mono backdrop-blur-sm pointer-events-none"
        aria-hidden="true"
      >
        <kbd className="text-ink-500">⌘K</kbd>
        <span>commands</span>
      </div>
    </>
  )
}
