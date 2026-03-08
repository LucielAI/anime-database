import { useState, useCallback, useRef, useEffect } from 'react'
import StandardCardsExplorer from './StandardCardsExplorer'
import { resolveColor } from '../utils/resolveColor'

const EDGE_COLORS = {
  ally: '#22d3ee',
  enemy: '#ef4444',
  rival: '#f59e0b',
  mentor: '#a855f7',
  betrayal: '#ec4899',
  dependent: '#6b7280',
  counter: '#10b981',
  mirror: '#8b5cf6',
}

function forceLayout(characters, relationships, iterations = 50) {
  const cx = 300, cy = 250, radius = 160
  const nodes = characters.map((char, i) => {
    const angle = (2 * Math.PI * i) / characters.length - Math.PI / 2
    return { ...char, x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) }
  })

  const nameMap = {}
  nodes.forEach((n, i) => { nameMap[n.name] = i })

  for (let iter = 0; iter < iterations; iter++) {
    const force = nodes.map(() => ({ fx: 0, fy: 0 }))
    // Repulsion between all nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x
        const dy = nodes[j].y - nodes[i].y
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1)
        const rep = 5000 / (dist * dist)
        force[i].fx -= (dx / dist) * rep
        force[i].fy -= (dy / dist) * rep
        force[j].fx += (dx / dist) * rep
        force[j].fy += (dy / dist) * rep
      }
    }
    // Attraction along edges
    relationships.forEach(rel => {
      const si = nameMap[rel.source]
      const ti = nameMap[rel.target]
      if (si === undefined || ti === undefined) return
      const dx = nodes[ti].x - nodes[si].x
      const dy = nodes[ti].y - nodes[si].y
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1)
      const pull = rel.type === 'enemy' ? -0.02 : 0.05
      const att = pull * dist
      force[si].fx += (dx / dist) * att
      force[si].fy += (dy / dist) * att
      force[ti].fx -= (dx / dist) * att
      force[ti].fy -= (dy / dist) * att
    })
    // Center gravity
    nodes.forEach((n, i) => {
      force[i].fx += (cx - n.x) * 0.01
      force[i].fy += (cy - n.y) * 0.01
    })
    // Apply
    const damping = 0.3
    nodes.forEach((n, i) => {
      n.x += force[i].fx * damping
      n.y += force[i].fy * damping
      n.x = Math.max(50, Math.min(550, n.x))
      n.y = Math.max(50, Math.min(450, n.y))
    })
  }
  return nodes
}

export default function NodeGraphExplorer({ characters = [], relationships = [], isSystemMode, theme }) {
  const svgRef = useRef(null)
  const [nodes, setNodes] = useState([])
  const [selected, setSelected] = useState(null)
  const [dragging, setDragging] = useState(null)
  const [hoveredEdge, setHoveredEdge] = useState(null)
  const dragOffset = useRef({ x: 0, y: 0 })

  const resetLayout = useCallback(() => {
    setNodes(forceLayout(characters, relationships))
  }, [characters, relationships])

  useEffect(() => { resetLayout() }, [resetLayout])

  if (characters.length === 0) {
    return <StandardCardsExplorer characters={characters} isSystemMode={isSystemMode} theme={theme} />
  }

  const nodeMap = {}
  nodes.forEach(n => { nodeMap[n.name] = n })

  const accent = theme?.accent || '#22d3ee'

  const handleMouseDown = (e, name) => {
    e.stopPropagation()
    const node = nodeMap[name]
    if (!node || !svgRef.current) return
    const svg = svgRef.current
    const pt = svg.createSVGPoint()
    pt.x = e.clientX; pt.y = e.clientY
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse())
    dragOffset.current = { x: svgP.x - node.x, y: svgP.y - node.y }
    setDragging(name)
  }

  const handleMouseMove = (e) => {
    if (!dragging || !svgRef.current) return
    const svg = svgRef.current
    const pt = svg.createSVGPoint()
    pt.x = e.clientX; pt.y = e.clientY
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse())
    setNodes(prev => prev.map(n =>
      n.name === dragging
        ? { ...n, x: svgP.x - dragOffset.current.x, y: svgP.y - dragOffset.current.y }
        : n
    ))
  }

  const selectedChar = selected ? characters.find(c => c.name === selected) : null

  return (
    <div className="space-y-4 font-mono">
      <div className="flex items-center justify-between">
        <h3 className="text-xs tracking-widest text-gray-500">// RELATIONSHIP GRAPH</h3>
        <button onClick={resetLayout} className="text-[10px] text-gray-500 border border-gray-700 rounded px-2 py-1 hover:text-cyan-400 hover:border-cyan-700 transition-colors">
          RESET LAYOUT
        </button>
      </div>
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox="0 0 600 500"
          className="w-full h-auto rounded-lg border border-white/10"
          style={{ backgroundColor: '#050508', minHeight: 400 }}
          onMouseMove={handleMouseMove}
          onMouseUp={() => setDragging(null)}
          onMouseLeave={() => setDragging(null)}
        >
          {relationships.map((rel, i) => {
            const s = nodeMap[rel.source]
            const t = nodeMap[rel.target]
            if (!s || !t) return null
            const isHighlighted = rel.source === selected || rel.target === selected
            const mx = (s.x + t.x) / 2
            const my = (s.y + t.y) / 2
            return (
              <g key={i}
                onMouseEnter={() => setHoveredEdge(i)}
                onMouseLeave={() => setHoveredEdge(null)}
              >
                <line
                  x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                  stroke={EDGE_COLORS[rel.type] || '#555'}
                  strokeWidth={Math.max(1, (rel.weight || 1) * 0.6)}
                  opacity={selected ? (isHighlighted ? 1 : 0.1) : 0.5}
                  className="transition-opacity duration-300"
                />
                {hoveredEdge === i && (
                  <text x={mx} y={my - 6} textAnchor="middle" className="fill-gray-400 text-[8px] font-mono">
                    {rel.type}
                  </text>
                )}
              </g>
            )
          })}

          {nodes.map(node => (
            <g key={node.name}
              onMouseDown={e => handleMouseDown(e, node.name)}
              onClick={() => setSelected(prev => prev === node.name ? null : node.name)}
              className="cursor-pointer"
            >
              <circle cx={node.x} cy={node.y} r={20}
                fill={selected === node.name ? resolveColor(node.accentColor, accent) : '#1a1a2e'}
                stroke={resolveColor(node.accentColor, accent)}
                strokeWidth={selected === node.name ? 3 : 1.5}
                className="transition-all duration-200"
              />
              <text x={node.x} y={node.y + 4} textAnchor="middle"
                className="text-[10px] font-mono pointer-events-none"
                fill={selected === node.name ? '#050508' : resolveColor(node.accentColor, accent)}
              >
                {node.name.charAt(0)}
              </text>
              <text x={node.x} y={node.y + 34} textAnchor="middle"
                className="fill-gray-400 text-[9px] font-mono pointer-events-none"
              >
                {node.name}
              </text>
            </g>
          ))}
        </svg>

        {hoveredEdge !== null && relationships[hoveredEdge]?.loreDesc && (
          <div className="absolute bottom-2 left-2 right-2 bg-black/90 border rounded px-3 py-2 text-[10px] text-cyan-300 z-10" style={{ borderColor: accent }}>
            {relationships[hoveredEdge].loreDesc}
          </div>
        )}
      </div>

      {selectedChar && (
        <div className="bg-[#0a0a14] border border-white/10 rounded-lg p-4">
          <h4 className="text-sm font-bold mb-1" style={{ color: resolveColor(selectedChar.accentColor, accent) }}>{selectedChar.name}</h4>
          <p className="text-[10px] text-gray-500 mb-2">{selectedChar.title} — RANK: {selectedChar.rank}</p>
          <p className="text-xs text-gray-400 leading-relaxed">
            {isSystemMode ? selectedChar.systemBio : selectedChar.loreBio}
          </p>
        </div>
      )}
    </div>
  )
}
