'use client'
// components/CommandPalette.tsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, Plus, LayoutDashboard, BookOpen, FileText, Link2,
  Lightbulb, Brain, X, ArrowRight, Command
} from 'lucide-react'

interface Command {
  id: string
  label: string
  description?: string
  shortcut?: string
  icon: React.ReactNode
  action: () => void
  category: string
}

interface Props {
  open: boolean
  onClose: () => void
}

export default function CommandPalette({ open, onClose }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const commands: Command[] = [
    {
      id: 'dashboard',
      label: 'Go to Dashboard',
      description: 'View all knowledge items',
      icon: <LayoutDashboard className="w-4 h-4" aria-hidden="true" />,
      shortcut: 'G D',
      action: () => { router.push('/dashboard'); onClose() },
      category: 'Navigation',
    },
    {
      id: 'capture',
      label: 'Capture New Note',
      description: 'Add a new knowledge item',
      icon: <Plus className="w-4 h-4" aria-hidden="true" />,
      shortcut: 'G C',
      action: () => { router.push('/capture'); onClose() },
      category: 'Actions',
    },
    {
      id: 'capture-note',
      label: 'New Note',
      icon: <FileText className="w-4 h-4" aria-hidden="true" />,
      action: () => { router.push('/capture?type=NOTE'); onClose() },
      category: 'Actions',
    },
    {
      id: 'capture-link',
      label: 'New Link',
      icon: <Link2 className="w-4 h-4" aria-hidden="true" />,
      action: () => { router.push('/capture?type=LINK'); onClose() },
      category: 'Actions',
    },
    {
      id: 'capture-insight',
      label: 'New Insight',
      icon: <Lightbulb className="w-4 h-4" aria-hidden="true" />,
      action: () => { router.push('/capture?type=INSIGHT'); onClose() },
      category: 'Actions',
    },
    {
      id: 'graph',
      label: 'View Knowledge Graph',
      description: 'Visualize note relationships',
      icon: <Brain className="w-4 h-4" aria-hidden="true" />,
      shortcut: 'G G',
      action: () => { router.push('/graph'); onClose() },
      category: 'Navigation',
    },
    {
      id: 'upload',
      label: 'Upload Document',
      description: 'Upload PDF, DOCX, TXT or MD',
      icon: <Plus className="w-4 h-4" aria-hidden="true" />,
      shortcut: 'G U',
      action: () => { router.push('/upload'); onClose() },
      category: 'Actions',
    },
    {
      id: 'docs',
      label: 'Architecture Docs',
      icon: <BookOpen className="w-4 h-4" aria-hidden="true" />,
      action: () => { router.push('/docs'); onClose() },
      category: 'Navigation',
    },
  ]

  const filtered = query
    ? commands.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.description?.toLowerCase().includes(query.toLowerCase()) ||
          c.category.toLowerCase().includes(query.toLowerCase())
      )
    : commands

  // Group by category
  const grouped = filtered.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = []
    acc[cmd.category].push(cmd)
    return acc
  }, {} as Record<string, Command[]>)

  const flatFiltered = filtered

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelected((s) => Math.min(s + 1, flatFiltered.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelected((s) => Math.max(s - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        flatFiltered[selected]?.action()
      } else if (e.key === 'Escape') {
        onClose()
      }
    },
    [open, flatFiltered, selected, onClose]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!open) return null

  let flatIndex = 0

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-xl bg-ink-900 border border-ink-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-ink-800">
          <Search className="w-4 h-4 text-ink-500 flex-shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(0) }}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-ink-100 placeholder-ink-600 focus:outline-none text-sm"
            aria-label="Search commands"
            aria-autocomplete="list"
            aria-controls="command-list"
            aria-activedescendant={flatFiltered[selected] ? `cmd-${flatFiltered[selected].id}` : undefined}
            role="combobox"
            aria-expanded="true"
          />
          <button
            onClick={onClose}
            className="p-1 text-ink-600 hover:text-ink-400 transition-colors"
            aria-label="Close command palette"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        {/* Commands list */}
        <div
          id="command-list"
          role="listbox"
          aria-label="Commands"
          className="max-h-80 overflow-y-auto py-2"
        >
          {flatFiltered.length === 0 ? (
            <div className="px-4 py-8 text-center text-ink-600 text-sm">
              No commands found for "{query}"
            </div>
          ) : (
            Object.entries(grouped).map(([category, cmds]) => (
              <div key={category}>
                <div className="px-4 py-1.5 text-ink-700 text-xs font-mono tracking-widest uppercase" aria-hidden="true">
                  {category}
                </div>
                {cmds.map((cmd) => {
                  const currentIndex = flatIndex++
                  const isSelected = selected === currentIndex
                  return (
                    <button
                      key={cmd.id}
                      id={`cmd-${cmd.id}`}
                      role="option"
                      aria-selected={isSelected}
                      onClick={cmd.action}
                      onMouseEnter={() => setSelected(currentIndex)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        isSelected ? 'bg-amber-600/10 text-amber-400' : 'text-ink-300 hover:bg-ink-800'
                      }`}
                    >
                      <span className={`flex-shrink-0 ${isSelected ? 'text-amber-500' : 'text-ink-500'}`}>
                        {cmd.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{cmd.label}</div>
                        {cmd.description && (
                          <div className="text-xs text-ink-600 truncate">{cmd.description}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {cmd.shortcut && (
                          <span className="text-xs font-mono text-ink-700 bg-ink-800 px-1.5 py-0.5 rounded">
                            {cmd.shortcut}
                          </span>
                        )}
                        {isSelected && <ArrowRight className="w-3 h-3 text-amber-500" aria-hidden="true" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2.5 border-t border-ink-800 flex items-center gap-4 text-ink-700 text-xs font-mono">
          <span><kbd className="bg-ink-800 px-1 rounded">↑↓</kbd> navigate</span>
          <span><kbd className="bg-ink-800 px-1 rounded">↵</kbd> select</span>
          <span><kbd className="bg-ink-800 px-1 rounded">esc</kbd> close</span>
          <span className="ml-auto flex items-center gap-1">
            <Command className="w-3 h-3" aria-hidden="true" /> K to open
          </span>
        </div>
      </div>
    </div>
  )
}
