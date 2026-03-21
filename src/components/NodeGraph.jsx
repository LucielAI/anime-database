import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { flushSync } from 'react-dom'
import { resolveColor } from '../utils/resolveColor'
import { RELATIONSHIP_COLORS } from '../config/relationshipColors'
import { computeRadialPositions } from '../utils/radialLayout'
import { useAutoHighlight } from '../hooks/useAutoHighlight'

export default function NodeGraph({ relationships = [], characters = [], isRevealing, revealStep }) {
  const svgRef = useRef(null)
  const [nodes, setNodes] = useState([])
  const [selected, setSelected] = useState(null)
  const [dragging, setDragging] = useState(null)
  const dragOffset = useRef({ x: 0, y: 0 })
  const reqRef = useRef()

  const { highlighted, markInteracted } = useAutoHighlight({
    items: characters,
    relationships,
    isRevealing,
    revealStep,
    duration: 1200,
  })

  // Sync auto-highlight into selected state (only when user hasn't manually selected)
  useEffect(() => {
    if (highlighted && !selected) flushSync(() => setSelected(highlighted))
  }, [highlighted, selected])

  useEffect(() => {
    const arranged = computeRadialPositions(characters, 300, 250, 160)
    setTimeout(() => setNodes(arranged), 0)
  }, [characters])

  const nodeMap = useMemo(() => {
    const map = {}
    nodes.forEach((n) => { map[n.name] = n })
    return map
  }, [nodes])

  const handleMouseDown = useCallback((e, name) => {
    if (e.stopPropagation) e.stopPropagation()
    const node = nodeMap[name]
    if (!node) return
    const svg = svgRef.current
    if (!svg) return
    const pt = svg.createSVGPoint()
    
    // Support both mouse and touch
    pt.x = e.touches ? e.touches[0].clientX : e.clientX
    pt.y = e.touches ? e.touches[0].clientY : e.clientY
    
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse())
    dragOffset.current = { x: svgP.x - node.x, y: svgP.y - node.y }
    setDragging(name)
  }, [nodeMap])

  const handleMouseMove = useCallback((e) => {
    if (!dragging) return
    if (e.touches && e.cancelable) e.preventDefault() // Only prevent scroll when actively dragging a node
    
    if (reqRef.current) cancelAnimationFrame(reqRef.current)
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    reqRef.current = requestAnimationFrame(() => {
      const svg = svgRef.current
      if (!svg) return
      const pt = svg.createSVGPoint()
      pt.x = clientX
      pt.y = clientY
      const svgP = pt.matrixTransform(svg.getScreenCTM().inverse())
      setNodes((prev) =>
        prev.map((n) =>
          n.name === dragging
            ? { ...n, x: svgP.x - dragOffset.current.x, y: svgP.y - dragOffset.current.y }
            : n
        )
      )
    })
  }, [dragging])

  const handleMouseUp = useCallback(() => {
    setDragging(null)
  }, [])

  const handleNodeClick = useCallback((name) => {
    markInteracted()
    setSelected((prev) => (prev === name ? null : name))
  }, [markInteracted])

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
        role="img"
        aria-label="Character relationship graph — click nodes to see connections"
        className="w-full h-auto bg-[#0a0a14] rounded-lg border border-white/10"
        onMouseMove={handleMouseMove}
        onTouchMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchCancel={handleMouseUp}
        style={{ touchAction: 'pan-y' }} // Allow vertical scrolling on the SVG background, but allow dragging horizontally/vertically if hitting a node
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
              stroke={RELATIONSHIP_COLORS[rel.type] || '#555'}
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
            onTouchStart={(e) => handleMouseDown(e, node.name)}
            onClick={() => handleNodeClick(node.name)}
            className="cursor-pointer"
            style={{ touchAction: 'none' }} // Prevent scrolling when touching a node
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
        <div className="absolute bottom-3 left-3 right-3 bg-black/90 backdrop-blur-md border border-cyan-800/60 rounded-lg px-4 py-3 text-xs text-cyan-300 font-mono shadow-xl pointer-events-none transition-all duration-300">
          {tooltip}
        </div>
      )}
    </div>
  )
}
