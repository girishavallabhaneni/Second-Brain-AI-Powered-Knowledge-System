'use client'
// app/graph/page.tsx
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Brain, ArrowLeft, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'

interface KnowledgeItem {
  id: string
  title: string
  type: string
  tags: string[]
  createdAt: string
}

const TYPE_COLORS: Record<string, string> = {
  NOTE: '#3b82f6',
  LINK: '#a855f7',
  INSIGHT: '#f59e0b',
}

function buildGraph(items: KnowledgeItem[]): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []
  const tagMap: Record<string, string[]> = {}

  // Create item nodes in a circle layout
  const radius = Math.max(250, items.length * 40)
  items.forEach((item, i) => {
    const angle = (2 * Math.PI * i) / items.length - Math.PI / 2
    const x = radius * Math.cos(angle)
    const y = radius * Math.sin(angle)

    nodes.push({
      id: item.id,
      position: { x: x + radius + 50, y: y + radius + 50 },
      data: {
        label: (
          <div
            className="text-center"
            role="button"
            aria-label={`Knowledge item: ${item.title}, type: ${item.type}`}
          >
            <div
              className="w-2 h-2 rounded-full mx-auto mb-1"
              style={{ backgroundColor: TYPE_COLORS[item.type] }}
              aria-hidden="true"
            />
            <div style={{ fontSize: 10, color: '#e8e4dc', maxWidth: 80, lineHeight: 1.3, fontFamily: 'DM Sans, sans-serif' }}>
              {item.title.length > 30 ? item.title.slice(0, 30) + '…' : item.title}
            </div>
          </div>
        ),
      },
      style: {
        background: '#1a1410',
        border: `1.5px solid ${TYPE_COLORS[item.type]}40`,
        borderRadius: 12,
        padding: '8px 10px',
        width: 110,
        boxShadow: `0 0 12px ${TYPE_COLORS[item.type]}20`,
      },
    })

    // Build tag → items map for edges
    item.tags.forEach((tag) => {
      if (!tagMap[tag]) tagMap[tag] = []
      tagMap[tag].push(item.id)
    })
  })

  // Create tag nodes + edges
  const addedEdges = new Set<string>()
  Object.entries(tagMap).forEach(([tag, itemIds]) => {
    if (itemIds.length < 2) return

    // Add tag node at center
    const tagNodeId = `tag-${tag}`
    const existingTagNode = nodes.find((n) => n.id === tagNodeId)
    if (!existingTagNode) {
      nodes.push({
        id: tagNodeId,
        position: {
          x: radius + 50 + (Math.random() - 0.5) * 200,
          y: radius + 50 + (Math.random() - 0.5) * 200,
        },
        data: {
          label: (
            <span style={{ fontSize: 9, color: '#80705e', fontFamily: 'JetBrains Mono, monospace' }}>
              #{tag}
            </span>
          ),
        },
        style: {
          background: '#0d0a07',
          border: '1px solid #24201a',
          borderRadius: 20,
          padding: '3px 8px',
          fontSize: 9,
        },
      })
    }

    itemIds.forEach((itemId) => {
      const edgeId = `${itemId}-${tagNodeId}`
      if (!addedEdges.has(edgeId)) {
        edges.push({
          id: edgeId,
          source: itemId,
          target: tagNodeId,
          style: { stroke: '#46403a', strokeWidth: 1 },
          markerEnd: { type: MarkerType.Arrow, color: '#46403a', width: 12, height: 12 },
          animated: false,
        })
        addedEdges.add(edgeId)
      }
    })
  })

  return { nodes, edges }
}

export default function GraphPage() {
  const [items, setItems] = useState<KnowledgeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  useEffect(() => {
    fetch('/api/items')
      .then((r) => r.json())
      .then((data) => {
        setItems(data)
        const { nodes: n, edges: e } = buildGraph(data)
        setNodes(n)
        setEdges(e)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen bg-ink-950 flex flex-col" role="main">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-ink-800/50 z-10 bg-ink-950">
        <Link href="/" className="flex items-center gap-2" aria-label="Second Brain home">
          <Brain className="w-5 h-5 text-amber-500" aria-hidden="true" />
          <span className="font-display text-lg text-ink-100">Second Brain</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-xs font-mono text-ink-600" aria-label="Legend">
            {Object.entries(TYPE_COLORS).map(([type, color]) => (
              <span key={type} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
                <span>{type}</span>
              </span>
            ))}
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-ink-400 hover:text-ink-200 text-sm transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div className="px-8 py-6 border-b border-ink-800/30">
        <h1 className="font-display text-3xl text-ink-50 mb-1">Knowledge Graph</h1>
        <p className="text-ink-500 text-sm">
          {items.length} items · nodes connected by shared tags · drag to explore
        </p>
      </div>

      {/* Graph */}
      <div className="flex-1 relative" aria-label="Interactive knowledge graph visualization" role="img">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-ink-600 text-sm font-mono animate-pulse">Building graph...</div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <Brain className="w-10 h-10 text-ink-800" aria-hidden="true" />
            <p className="text-ink-600 text-sm">Add some notes to see the graph</p>
            <Link href="/capture" className="text-amber-500 text-sm hover:underline">
              Capture your first note →
            </Link>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            attributionPosition="bottom-left"
            aria-label="Knowledge graph"
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1}
              color="#24201a"
            />
            <Controls
              aria-label="Graph controls"
              style={{
                background: '#1a1410',
                border: '1px solid #24201a',
                borderRadius: 12,
              }}
            />
            <MiniMap
              style={{
                background: '#0d0a07',
                border: '1px solid #24201a',
                borderRadius: 12,
              }}
              nodeColor={(node) => {
                if (node.id.startsWith('tag-')) return '#24201a'
                return '#46403a'
              }}
              aria-label="Graph minimap"
            />
          </ReactFlow>
        )}
      </div>
    </main>
  )
}
