import { useState, useCallback, useRef, useEffect } from 'react'
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

export default function NodeGraph({ relationships = [], characters = [] }) {
  const svgRef = useRef(null)
  const [nodes, setNodes] = useState([])
  const [selected, setSelected] = useState(null)
  const [dragging, setDragging] = useState(null)
  const dragOffset = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const cx = 300
    const cy = 250
    const radius = 160
    const arranged = characters.map((char, i) => {
      const angle = (2 * Math.PI * i) / characters.length - Math.PI / 2
      return {
        ...char,
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      }
    })
    setNodes(arranged)
  }, [characters])

  const nodeMap = {}
  nodes.forEach((n) => { nodeMap[n.name] = n })

  const handleMouseDown = useCallback((e, name) => {
    e.stopPropagation()
    const node = nodeMap[name]
    if (!node) return
    const svg = svgRef.current
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse())
    dragOffset.current = { x: svgP.x - node.x, y: svgP.y - node.y }
    setDragging(name)
  }, [nodeMap])

  const handleMouseMove = useCallback((e) => {
    if (!dragging) return
    const svg = svgRef.current
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse())
    setNodes((prev) =>
      prev.map((n) =>
        n.name === dragging
          ? { ...n, x: svgP.x - dragOffset.current.x, y: svgP.y - dragOffset.current.y }
          : n
      )
    )
  }, [dragging])

  const handleMouseUp = useCallback(() => {
    setDragging(null)
  }, [])

  const handleNodeClick = useCallback((name) => {
    setSelected((prev) => (prev === name ? null : name))
  }, [])

  const selectedEdges = relationships.filter(
    (r) => r.source === selected || r.target === selected
  )

  const tooltip = selected
    ? selectedEdges.map((e) => e.loreDesc).filter(Boolean).join(' | ')
    : null

  return (
    <div className="relative w-full font-mono">
      <svg
        ref={svgRef}
        viewBox="0 0 600 500"
        className="w-full h-auto bg-[#0a0a14] rounded-lg border border-white/10"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {relationships.map((rel, i) => {
          const s = nodeMap[rel.source]
          const t = nodeMap[rel.target]
          if (!s || !t) return null
          const isHighlighted = rel.source === selected || rel.target === selected
          return (
            <line
              key={i}
              x1={s.x}
              y1={s.y}
              x2={t.x}
              y2={t.y}
              stroke={EDGE_COLORS[rel.type] || '#555'}
              strokeWidth={Math.max(1, (rel.weight || 1) * 0.6)}
              opacity={selected ? (isHighlighted ? 1 : 0.15) : 0.6}
              className="transition-opacity duration-300"
            />
          )
        })}

        {nodes.map((node) => (
          <g
            key={node.name}
            onMouseDown={(e) => handleMouseDown(e, node.name)}
            onClick={() => handleNodeClick(node.name)}
            className="cursor-pointer"
          >
            <circle
              cx={node.x}
              cy={node.y}
              r={20}
              fill={selected === node.name ? resolveColor(node.accentColor, '#22d3ee') : '#1a1a2e'}
              stroke={resolveColor(node.accentColor, '#22d3ee')}
              strokeWidth={selected === node.name ? 3 : 1.5}
              className="transition-all duration-200"
            />
            <text
              x={node.x}
              y={node.y + 32}
              textAnchor="middle"
              className="fill-gray-400 text-[9px] font-mono pointer-events-none"
            >
              {node.name}
            </text>
          </g>
        ))}
      </svg>

      {tooltip && (
        <div className="absolute bottom-2 left-2 right-2 bg-black/80 border border-cyan-800 rounded px-3 py-2 text-xs text-cyan-300 font-mono">
          {tooltip}
        </div>
      )}
    </div>
  )
}
