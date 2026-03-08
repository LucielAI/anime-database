import { useState, useCallback, useRef, useEffect } from 'react'
import StandardCardsExplorer from './StandardCardsExplorer'
import DangerBar from '../components/DangerBar'
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
  successor: '#38bdf8',
}

const EDGE_LABELS = {
  ally: 'ALLY',
  enemy: 'ENEMY',
  rival: 'RIVAL',
  mentor: 'MENTOR',
  betrayal: 'BETRAYAL',
  dependent: 'DEPENDENT',
  counter: 'COUNTER',
  mirror: 'MIRROR',
  successor: 'SUCCESSOR',
}

const NODE_R = 32
const PORTRAIT_R = 28
const VB_W = 700
const VB_H = 560
const LABEL_OFFSET = 46
const TITLE_OFFSET = 58
const BOUNDS_PAD = 60

const MIN_NODE_DIST = 130

function forceLayout(characters, relationships, iterations = 150) {
  const cx = VB_W / 2, cy = VB_H / 2, spread = 220
  const nodes = characters.map((char, i) => {
    const angle = (2 * Math.PI * i) / characters.length - Math.PI / 2
    return { ...char, x: cx + spread * Math.cos(angle), y: cy + spread * Math.sin(angle) }
  })

  const nameMap = {}
  nodes.forEach((n, i) => { nameMap[n.name] = i })

  for (let iter = 0; iter < iterations; iter++) {
    const force = nodes.map(() => ({ fx: 0, fy: 0 }))

    // Very strong repulsion — prevents clustering
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x
        const dy = nodes[j].y - nodes[i].y
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1)
        const rep = 55000 / (dist * dist)
        force[i].fx -= (dx / dist) * rep
        force[i].fy -= (dy / dist) * rep
        force[j].fx += (dx / dist) * rep
        force[j].fy += (dy / dist) * rep
      }
    }

    // Weak spring attraction along edges
    relationships.forEach(rel => {
      const si = nameMap[rel.source]
      const ti = nameMap[rel.target]
      if (si === undefined || ti === undefined) return
      const dx = nodes[ti].x - nodes[si].x
      const dy = nodes[ti].y - nodes[si].y
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1)
      const idealDist = 200
      const att = 0.015 * (dist - idealDist)
      force[si].fx += (dx / dist) * att
      force[si].fy += (dy / dist) * att
      force[ti].fx -= (dx / dist) * att
      force[ti].fy -= (dy / dist) * att
    })

    // Gentle center gravity
    nodes.forEach((n, i) => {
      force[i].fx += (cx - n.x) * 0.004
      force[i].fy += (cy - n.y) * 0.004
    })

    const damping = 0.22
    nodes.forEach((n, i) => {
      n.x += force[i].fx * damping
      n.y += force[i].fy * damping
      n.x = Math.max(BOUNDS_PAD, Math.min(VB_W - BOUNDS_PAD, n.x))
      n.y = Math.max(BOUNDS_PAD, Math.min(VB_H - BOUNDS_PAD, n.y))
    })

    // Hard minimum distance constraint — push apart any overlapping pair
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x
        const dy = nodes[j].y - nodes[i].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < MIN_NODE_DIST && dist > 0.1) {
          const overlap = (MIN_NODE_DIST - dist) / 2
          const ux = dx / dist, uy = dy / dist
          nodes[i].x -= ux * overlap
          nodes[i].y -= uy * overlap
          nodes[j].x += ux * overlap
          nodes[j].y += uy * overlap
        }
      }
    }
  }
  return nodes
}

function getConnectedRelationships(name, relationships) {
  return relationships.filter(r => r.source === name || r.target === name)
}

function EdgeLabel({ x, y, type, color }) {
  const label = EDGE_LABELS[type] || type?.toUpperCase() || ''
  const w = label.length * 6.4 + 10
  return (
    <g>
      <rect x={x - w / 2} y={y - 8} width={w} height={16} rx={3}
        fill="#0a0a14" fillOpacity={0.92} stroke={color} strokeWidth={0.5} />
      <text x={x} y={y + 3.5} textAnchor="middle" fill={color}
        fontSize={9} fontFamily="monospace" fontWeight="bold">
        {label}
      </text>
    </g>
  )
}

function getEdgeLabelPos(sx, sy, tx, ty) {
  // Place label at 35% from source to reduce center congestion
  const t = 0.35
  const mx = sx + (tx - sx) * t
  const my = sy + (ty - sy) * t
  // Offset perpendicular to edge to avoid overlapping the line
  const dx = tx - sx, dy = ty - sy
  const dist = Math.sqrt(dx * dx + dy * dy) || 1
  const perpX = -dy / dist * 12
  const perpY = dx / dist * 12
  return { x: mx + perpX, y: my + perpY }
}

export default function NodeGraphExplorer({ characters = [], relationships = [], isSystemMode, theme }) {
  const svgRef = useRef(null)
  const [nodes, setNodes] = useState([])
  const [selected, setSelected] = useState(null)
  const [dragging, setDragging] = useState(null)
  const [hoveredEdge, setHoveredEdge] = useState(null)
  const [imgFailed, setImgFailed] = useState({})
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

  const getSvgPoint = (e) => {
    const svg = svgRef.current
    if (!svg) return null
    const pt = svg.createSVGPoint()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    pt.x = clientX
    pt.y = clientY
    return pt.matrixTransform(svg.getScreenCTM().inverse())
  }

  const handleStart = (e, name) => {
    e.stopPropagation()
    if (e.cancelable) e.preventDefault()
    const node = nodeMap[name]
    if (!node) return
    const svgP = getSvgPoint(e)
    if (!svgP) return
    dragOffset.current = { x: svgP.x - node.x, y: svgP.y - node.y }
    setDragging(name)
  }

  const handleMove = (e) => {
    if (!dragging) return
    const svgP = getSvgPoint(e)
    if (!svgP) return
    setNodes(prev => prev.map(n =>
      n.name === dragging
        ? { ...n, x: svgP.x - dragOffset.current.x, y: svgP.y - dragOffset.current.y }
        : n
    ))
  }

  const handleEnd = () => setDragging(null)

  const selectedChar = selected ? characters.find(c => c.name === selected) : null
  const selectedRels = selected ? getConnectedRelationships(selected, relationships) : []

  return (
    <div className="space-y-4 font-mono">
      <div className="flex items-center justify-between">
        <h3 className="text-xs tracking-widest text-gray-500">// RELATIONSHIP GRAPH</h3>
        <div className="flex items-center gap-2">
          {selected && (
            <button onClick={() => setSelected(null)}
              className="text-[10px] text-gray-500 border border-gray-700 rounded px-2 py-1 hover:text-red-400 hover:border-red-700 transition-colors">
              DESELECT
            </button>
          )}
          <button onClick={resetLayout}
            className="text-[10px] text-gray-500 border border-gray-700 rounded px-2 py-1 hover:text-cyan-400 hover:border-cyan-700 transition-colors">
            RESET
          </button>
        </div>
      </div>

      {/* Edge legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {[...new Set(relationships.map(r => r.type))].map(type => (
          <span key={type} className="flex items-center gap-1">
            <span className="w-3 h-0.5 inline-block rounded" style={{ backgroundColor: EDGE_COLORS[type] || '#555' }} />
            <span className="text-[9px] text-gray-500 uppercase tracking-wider">{type}</span>
          </span>
        ))}
      </div>

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="w-full h-auto rounded-lg border border-white/10"
          style={{ backgroundColor: '#050508' }}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        >
          <defs>
            {/* Single shared clip at origin — each node group uses transform */}
            <clipPath id="portrait-clip">
              <circle cx="0" cy="0" r={PORTRAIT_R} />
            </clipPath>
            <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Edges — rendered first (below nodes) */}
          {relationships.map((rel, i) => {
            const s = nodeMap[rel.source]
            const t = nodeMap[rel.target]
            if (!s || !t) return null
            const isActive = !selected || rel.source === selected || rel.target === selected
            const edgeColor = EDGE_COLORS[rel.type] || '#555'
            const weight = Math.max(1.5, (rel.weight || 5) * 0.7)
            const dx = t.x - s.x, dy = t.y - s.y
            const dist = Math.sqrt(dx * dx + dy * dy) || 1
            const ux = dx / dist, uy = dy / dist

            // Arrow endpoint just outside target node
            const endX = t.x - ux * (NODE_R + 3)
            const endY = t.y - uy * (NODE_R + 3)
            const arrowSize = 7
            const ax = endX - ux * arrowSize
            const ay = endY - uy * arrowSize
            const px = -uy * arrowSize * 0.45
            const py = ux * arrowSize * 0.45

            const labelPos = getEdgeLabelPos(s.x, s.y, t.x, t.y)
            const showLabel = hoveredEdge === i

            return (
              <g key={i}
                onMouseEnter={() => setHoveredEdge(i)}
                onMouseLeave={() => setHoveredEdge(null)}
              >
                {/* Fat invisible hitbox */}
                <line x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke="transparent" strokeWidth={18} />

                {/* Visible edge */}
                <line
                  x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                  stroke={edgeColor}
                  strokeWidth={selected ? (isActive ? weight : 0.4) : weight}
                  opacity={selected ? (isActive ? 0.85 : 0.06) : 0.4}
                  strokeDasharray={rel.type === 'mirror' || rel.type === 'counter' ? '6 3' : undefined}
                />

                {/* Arrowhead */}
                {isActive && (
                  <polygon
                    points={`${endX},${endY} ${ax + px},${ay + py} ${ax - px},${ay - py}`}
                    fill={edgeColor}
                    opacity={selected ? 0.85 : 0.4}
                  />
                )}

                {/* Edge type label */}
                {showLabel && (
                  <EdgeLabel x={labelPos.x} y={labelPos.y} type={rel.type} color={edgeColor} />
                )}
              </g>
            )
          })}

          {/* Nodes */}
          {nodes.map(node => {
            const isSelected = selected === node.name
            const isConnected = selected && relationships.some(r =>
              (r.source === selected && r.target === node.name) ||
              (r.target === selected && r.source === node.name)
            )
            const isFaded = selected && !isSelected && !isConnected
            const nodeColor = resolveColor(node.accentColor, accent)
            const hasImage = node.imageUrl && !imgFailed[node.name]

            return (
              <g key={node.name}
                onMouseDown={e => handleStart(e, node.name)}
                onTouchStart={e => handleStart(e, node.name)}
                onClick={() => setSelected(prev => prev === node.name ? null : node.name)}
                className="cursor-pointer"
                opacity={isFaded ? 0.35 : 1}
              >
                {/* Glow ring */}
                {isSelected && (
                  <circle cx={node.x} cy={node.y} r={NODE_R + 6}
                    fill="none" stroke={nodeColor} strokeWidth={2}
                    opacity={0.5} filter="url(#node-glow)" />
                )}

                {/* Outer ring */}
                <circle cx={node.x} cy={node.y} r={NODE_R}
                  fill={hasImage ? '#0f0f1a' : '#0f0f1a'}
                  stroke={isSelected || isConnected ? nodeColor : '#444'}
                  strokeWidth={isSelected ? 3 : isConnected ? 2.5 : 1.5}
                />

                {/* Portrait or styled fallback — using transform group for clipPath */}
                <g transform={`translate(${node.x}, ${node.y})`}>
                  {hasImage ? (
                    <image
                      href={node.imageUrl}
                      x={-PORTRAIT_R} y={-PORTRAIT_R}
                      width={PORTRAIT_R * 2} height={PORTRAIT_R * 2}
                      clipPath="url(#portrait-clip)"
                      preserveAspectRatio="xMidYMid slice"
                      onError={() => setImgFailed(prev => ({ ...prev, [node.name]: true }))}
                      style={{ pointerEvents: 'none' }}
                    />
                  ) : (
                    <>
                      {/* Colored gradient circle fallback */}
                      <circle cx="0" cy="0" r={PORTRAIT_R}
                        fill={nodeColor} opacity={0.15} />
                      <text x="0" y="7" textAnchor="middle"
                        fontSize={15} fontFamily="monospace" fontWeight="bold"
                        fill={nodeColor} style={{ pointerEvents: 'none' }}>
                        {node.name.split(' ')[0].slice(0, 3)}
                      </text>
                    </>
                  )}
                </g>

                {/* Name label */}
                <text
                  x={node.x} y={node.y + LABEL_OFFSET}
                  textAnchor="middle" fontSize={12} fontFamily="monospace"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  fill={isSelected || isConnected ? '#e5e7eb' : '#9ca3af'}
                  style={{ pointerEvents: 'none' }}
                >
                  {node.name.split(' ')[0]}
                </text>

                {/* Title on select/connect */}
                {(isSelected || isConnected) && (
                  <text
                    x={node.x} y={node.y + TITLE_OFFSET}
                    textAnchor="middle" fontSize={9} fontFamily="monospace"
                    fill={nodeColor} opacity={0.8}
                    style={{ pointerEvents: 'none' }}
                  >
                    {node.title}
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        {/* Edge hover tooltip */}
        {hoveredEdge !== null && relationships[hoveredEdge] && (
          <div className="absolute bottom-2 left-2 right-2 bg-black/95 border rounded-lg px-3 py-2 z-10"
            style={{ borderColor: EDGE_COLORS[relationships[hoveredEdge].type] || accent }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold tracking-wider"
                style={{ color: EDGE_COLORS[relationships[hoveredEdge].type] }}>
                {relationships[hoveredEdge].source.split(' ')[0]}
              </span>
              <span className="text-[9px] text-gray-500">&rarr;</span>
              <span className="text-[10px] font-bold tracking-wider"
                style={{ color: EDGE_COLORS[relationships[hoveredEdge].type] }}>
                {relationships[hoveredEdge].target.split(' ')[0]}
              </span>
              <span className="text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider"
                style={{
                  color: EDGE_COLORS[relationships[hoveredEdge].type],
                  backgroundColor: `${EDGE_COLORS[relationships[hoveredEdge].type]}20`
                }}>
                {relationships[hoveredEdge].type}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              {isSystemMode
                ? (relationships[hoveredEdge].systemDesc || relationships[hoveredEdge].loreDesc)
                : relationships[hoveredEdge].loreDesc}
            </p>
          </div>
        )}
      </div>

      {/* Selected character detail panel */}
      {selectedChar && (
        <div className="bg-[#0a0a14] border border-white/10 rounded-lg overflow-hidden">
          <div className="flex gap-4 p-4">
            {/* Portrait with proper gradient fallback */}
            <div className="shrink-0 w-20 h-24 rounded-lg overflow-hidden border border-white/10"
              style={{
                background: `linear-gradient(to bottom, ${resolveColor(selectedChar.gradientFrom, '#1a1a2e')}, ${resolveColor(selectedChar.gradientTo, '#0f0f1a')})`
              }}>
              {selectedChar.imageUrl && !imgFailed[selectedChar.name] ? (
                <img
                  src={selectedChar.imageUrl}
                  alt={selectedChar.name}
                  className="w-full h-full object-cover object-top"
                  onError={() => setImgFailed(prev => ({ ...prev, [selectedChar.name]: true }))}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-lg font-bold font-mono"
                    style={{ color: resolveColor(selectedChar.accentColor, accent) }}>
                    {selectedChar.name.split(' ')[0].slice(0, 3)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold truncate"
                style={{ color: resolveColor(selectedChar.accentColor, accent) }}>
                {selectedChar.name}
              </h4>
              <p className="text-[10px] text-gray-500 mb-1">{selectedChar.title}</p>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 uppercase tracking-wider">
                  {selectedChar.rank}
                </span>
                {selectedChar.primaryAbility && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider"
                    style={{
                      color: resolveColor(selectedChar.accentColor, accent),
                      backgroundColor: `${resolveColor(selectedChar.accentColor, accent)}20`
                    }}>
                    {selectedChar.primaryAbility}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-gray-500">THREAT</span>
                <div className="flex-1 max-w-[120px]">
                  <DangerBar level={selectedChar.dangerLevel} />
                </div>
                <span className="text-[10px] font-bold"
                  style={{ color: resolveColor(selectedChar.accentColor, accent) }}>
                  {selectedChar.dangerLevel}/10
                </span>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="px-4 pb-3">
            <p className="text-xs text-gray-400 leading-relaxed">
              {isSystemMode ? selectedChar.systemBio : selectedChar.loreBio}
            </p>
          </div>

          {/* Signature Moment */}
          {selectedChar.signatureMoment && (
            <div className="px-4 pb-3">
              <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">Signature Moment</p>
              <p className="text-[10px] text-gray-400 leading-relaxed italic">
                &ldquo;{selectedChar.signatureMoment}&rdquo;
              </p>
            </div>
          )}

          {/* Connected relationships */}
          {selectedRels.length > 0 && (
            <div className="border-t border-white/5 px-4 py-3">
              <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-2">
                Connections ({selectedRels.length})
              </p>
              <div className="space-y-2">
                {selectedRels.map((rel, i) => {
                  const isSource = rel.source === selected
                  const other = isSource ? rel.target : rel.source
                  const edgeColor = EDGE_COLORS[rel.type] || '#555'
                  return (
                    <div key={i}
                      className="flex items-start gap-2 cursor-pointer hover:bg-white/5 rounded px-1.5 py-1 -mx-1.5 transition-colors"
                      onClick={(e) => { e.stopPropagation(); setSelected(other) }}>
                      <span className="shrink-0 mt-0.5 w-2 h-2 rounded-full"
                        style={{ backgroundColor: edgeColor }} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-gray-300 font-bold">
                            {other.split(' ')[0]}
                          </span>
                          <span className="text-[8px] uppercase tracking-wider" style={{ color: edgeColor }}>
                            {isSource ? `\u2192 ${rel.type}` : `\u2190 ${rel.type}`}
                          </span>
                        </div>
                        <p className="text-[9px] text-gray-500 leading-snug line-clamp-2">
                          {isSystemMode ? (rel.systemDesc || rel.loreDesc) : rel.loreDesc}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
