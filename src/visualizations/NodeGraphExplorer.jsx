import { useState, useCallback, useRef, useEffect } from 'react'
import StandardCardsExplorer from './StandardCardsExplorer'
import ImageWithFallback from '../components/ImageWithFallback'
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

const NODE_RADIUS = 30
const PORTRAIT_RADIUS = 26
const VIEWBOX_W = 700
const VIEWBOX_H = 580

function forceLayout(characters, relationships, iterations = 80) {
  const cx = VIEWBOX_W / 2, cy = VIEWBOX_H / 2, radius = 190
  const nodes = characters.map((char, i) => {
    const angle = (2 * Math.PI * i) / characters.length - Math.PI / 2
    return { ...char, x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) }
  })

  const nameMap = {}
  nodes.forEach((n, i) => { nameMap[n.name] = i })

  for (let iter = 0; iter < iterations; iter++) {
    const force = nodes.map(() => ({ fx: 0, fy: 0 }))
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x
        const dy = nodes[j].y - nodes[i].y
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1)
        const rep = 8000 / (dist * dist)
        force[i].fx -= (dx / dist) * rep
        force[i].fy -= (dy / dist) * rep
        force[j].fx += (dx / dist) * rep
        force[j].fy += (dy / dist) * rep
      }
    }
    relationships.forEach(rel => {
      const si = nameMap[rel.source]
      const ti = nameMap[rel.target]
      if (si === undefined || ti === undefined) return
      const dx = nodes[ti].x - nodes[si].x
      const dy = nodes[ti].y - nodes[si].y
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1)
      const idealDist = 160
      const att = 0.04 * (dist - idealDist)
      force[si].fx += (dx / dist) * att
      force[si].fy += (dy / dist) * att
      force[ti].fx -= (dx / dist) * att
      force[ti].fy -= (dy / dist) * att
    })
    nodes.forEach((n, i) => {
      force[i].fx += (cx - n.x) * 0.008
      force[i].fy += (cy - n.y) * 0.008
    })
    const damping = 0.3
    nodes.forEach((n, i) => {
      n.x += force[i].fx * damping
      n.y += force[i].fy * damping
      n.x = Math.max(NODE_RADIUS + 10, Math.min(VIEWBOX_W - NODE_RADIUS - 10, n.x))
      n.y = Math.max(NODE_RADIUS + 10, Math.min(VIEWBOX_H - NODE_RADIUS - 10, n.y))
    })
  }
  return nodes
}

function getConnectedRelationships(name, relationships) {
  return relationships.filter(r => r.source === name || r.target === name)
}

function EdgeLabel({ x, y, type, color }) {
  const label = EDGE_LABELS[type] || type?.toUpperCase() || ''
  return (
    <g>
      <rect
        x={x - label.length * 3.2 - 4}
        y={y - 7}
        width={label.length * 6.4 + 8}
        height={14}
        rx={3}
        fill="#0a0a14"
        fillOpacity={0.9}
        stroke={color}
        strokeWidth={0.5}
      />
      <text
        x={x}
        y={y + 3}
        textAnchor="middle"
        fill={color}
        fontSize={9}
        fontFamily="monospace"
        fontWeight="bold"
      >
        {label}
      </text>
    </g>
  )
}

function EdgeArrow({ sx, sy, tx, ty, color, strokeWidth }) {
  const dx = tx - sx
  const dy = ty - sy
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (dist < 1) return null
  const ux = dx / dist
  const uy = dy / dist
  const endX = tx - ux * (NODE_RADIUS + 4)
  const endY = ty - uy * (NODE_RADIUS + 4)
  const arrowSize = Math.max(6, strokeWidth * 3)
  const ax = endX - ux * arrowSize
  const ay = endY - uy * arrowSize
  const perpX = -uy * arrowSize * 0.5
  const perpY = ux * arrowSize * 0.5
  return (
    <polygon
      points={`${endX},${endY} ${ax + perpX},${ay + perpY} ${ax - perpX},${ay - perpY}`}
      fill={color}
      opacity={0.8}
    />
  )
}

export default function NodeGraphExplorer({ characters = [], relationships = [], isSystemMode, theme }) {
  const svgRef = useRef(null)
  const [nodes, setNodes] = useState([])
  const [selected, setSelected] = useState(null)
  const [dragging, setDragging] = useState(null)
  const [hoveredEdge, setHoveredEdge] = useState(null)
  const [imgErrors, setImgErrors] = useState({})
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
            <button
              onClick={() => setSelected(null)}
              className="text-[10px] text-gray-500 border border-gray-700 rounded px-2 py-1 hover:text-red-400 hover:border-red-700 transition-colors"
            >
              DESELECT
            </button>
          )}
          <button
            onClick={resetLayout}
            className="text-[10px] text-gray-500 border border-gray-700 rounded px-2 py-1 hover:text-cyan-400 hover:border-cyan-700 transition-colors"
          >
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
          viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
          className="w-full h-auto rounded-lg border border-white/10"
          style={{ backgroundColor: '#050508', minHeight: 460 }}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        >
          <defs>
            {nodes.map(node => (
              <clipPath key={`clip-${node.name}`} id={`clip-${node.name.replace(/\s+/g, '-')}`}>
                <circle cx={node.x} cy={node.y} r={PORTRAIT_RADIUS} />
              </clipPath>
            ))}
            {/* Glow filter for selected node */}
            <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Edges */}
          {relationships.map((rel, i) => {
            const s = nodeMap[rel.source]
            const t = nodeMap[rel.target]
            if (!s || !t) return null
            const isHighlighted = !selected || rel.source === selected || rel.target === selected
            const edgeColor = EDGE_COLORS[rel.type] || '#555'
            const weight = Math.max(1.5, (rel.weight || 1) * 0.8)
            const mx = (s.x + t.x) / 2
            const my = (s.y + t.y) / 2
            return (
              <g key={i}
                onMouseEnter={() => setHoveredEdge(i)}
                onMouseLeave={() => setHoveredEdge(null)}
              >
                {/* Wider invisible hitbox for hover */}
                <line
                  x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                  stroke="transparent"
                  strokeWidth={16}
                />
                <line
                  x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                  stroke={edgeColor}
                  strokeWidth={selected ? (isHighlighted ? weight : 0.5) : weight}
                  opacity={selected ? (isHighlighted ? 0.9 : 0.08) : 0.45}
                  strokeDasharray={rel.type === 'mirror' || rel.type === 'counter' ? '6 3' : undefined}
                  className="transition-opacity duration-300"
                />
                {isHighlighted && (
                  <EdgeArrow sx={s.x} sy={s.y} tx={t.x} ty={t.y} color={edgeColor} strokeWidth={weight} />
                )}
                {(hoveredEdge === i || (selected && isHighlighted && !selected)) && (
                  <EdgeLabel x={mx} y={my} type={rel.type} color={edgeColor} />
                )}
                {selected && isHighlighted && (
                  <EdgeLabel x={mx} y={my} type={rel.type} color={edgeColor} />
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
            const hasImage = node.imageUrl && !imgErrors[node.name]

            return (
              <g key={node.name}
                onMouseDown={e => handleStart(e, node.name)}
                onTouchStart={e => handleStart(e, node.name)}
                onClick={() => setSelected(prev => prev === node.name ? null : node.name)}
                className="cursor-pointer"
                opacity={isFaded ? 0.2 : 1}
                style={{ transition: 'opacity 0.3s' }}
              >
                {/* Glow ring for selected */}
                {isSelected && (
                  <circle
                    cx={node.x} cy={node.y} r={NODE_RADIUS + 5}
                    fill="none"
                    stroke={nodeColor}
                    strokeWidth={2}
                    opacity={0.5}
                    filter="url(#node-glow)"
                  />
                )}

                {/* Outer ring */}
                <circle
                  cx={node.x} cy={node.y} r={NODE_RADIUS}
                  fill={isSelected ? nodeColor : '#0f0f1a'}
                  stroke={isConnected ? nodeColor : isSelected ? nodeColor : '#333'}
                  strokeWidth={isSelected ? 3 : isConnected ? 2 : 1.5}
                />

                {/* Portrait image or initial fallback */}
                {hasImage ? (
                  <image
                    href={node.imageUrl}
                    x={node.x - PORTRAIT_RADIUS}
                    y={node.y - PORTRAIT_RADIUS}
                    width={PORTRAIT_RADIUS * 2}
                    height={PORTRAIT_RADIUS * 2}
                    clipPath={`url(#clip-${node.name.replace(/\s+/g, '-')})`}
                    preserveAspectRatio="xMidYMid slice"
                    onError={() => setImgErrors(prev => ({ ...prev, [node.name]: true }))}
                    style={{ pointerEvents: 'none' }}
                  />
                ) : (
                  <text
                    x={node.x} y={node.y + 5}
                    textAnchor="middle"
                    fontSize={16}
                    fontFamily="monospace"
                    fontWeight="bold"
                    fill={isSelected ? '#050508' : nodeColor}
                    style={{ pointerEvents: 'none' }}
                  >
                    {node.name.charAt(0)}
                  </text>
                )}

                {/* Name label below node */}
                <text
                  x={node.x} y={node.y + NODE_RADIUS + 14}
                  textAnchor="middle"
                  fontSize={11}
                  fontFamily="monospace"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  fill={isSelected || isConnected ? '#e5e7eb' : '#6b7280'}
                  style={{ pointerEvents: 'none' }}
                >
                  {node.name.split(' ')[0]}
                </text>

                {/* Title subtitle */}
                {(isSelected || isConnected) && (
                  <text
                    x={node.x} y={node.y + NODE_RADIUS + 26}
                    textAnchor="middle"
                    fontSize={8}
                    fontFamily="monospace"
                    fill={nodeColor}
                    opacity={0.7}
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
          <div
            className="absolute bottom-2 left-2 right-2 bg-black/95 border rounded-lg px-3 py-2 z-10"
            style={{ borderColor: EDGE_COLORS[relationships[hoveredEdge].type] || accent }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold tracking-wider" style={{ color: EDGE_COLORS[relationships[hoveredEdge].type] }}>
                {relationships[hoveredEdge].source.split(' ')[0]}
              </span>
              <span className="text-[9px] text-gray-500">→</span>
              <span className="text-[10px] font-bold tracking-wider" style={{ color: EDGE_COLORS[relationships[hoveredEdge].type] }}>
                {relationships[hoveredEdge].target.split(' ')[0]}
              </span>
              <span className="text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider"
                style={{ color: EDGE_COLORS[relationships[hoveredEdge].type], backgroundColor: `${EDGE_COLORS[relationships[hoveredEdge].type]}20` }}
              >
                {relationships[hoveredEdge].type}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              {isSystemMode ? (relationships[hoveredEdge].systemDesc || relationships[hoveredEdge].loreDesc) : relationships[hoveredEdge].loreDesc}
            </p>
          </div>
        )}
      </div>

      {/* Selected character detail panel */}
      {selectedChar && (
        <div className="bg-[#0a0a14] border border-white/10 rounded-lg overflow-hidden">
          {/* Header with portrait */}
          <div className="flex gap-4 p-4">
            <div className="shrink-0 w-20 h-24 rounded-lg overflow-hidden border border-white/10">
              <ImageWithFallback
                src={selectedChar.imageUrl}
                alt={selectedChar.name}
                gradientFrom={selectedChar.gradientFrom}
                gradientTo={selectedChar.gradientTo}
                accentColor={selectedChar.accentColor}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold truncate" style={{ color: resolveColor(selectedChar.accentColor, accent) }}>
                {selectedChar.name}
              </h4>
              <p className="text-[10px] text-gray-500 mb-1">{selectedChar.title}</p>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 uppercase tracking-wider">
                  {selectedChar.rank}
                </span>
                {selectedChar.primaryAbility && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider"
                    style={{ color: resolveColor(selectedChar.accentColor, accent), backgroundColor: `${resolveColor(selectedChar.accentColor, accent)}20` }}
                  >
                    {selectedChar.primaryAbility}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-gray-500">THREAT</span>
                <div className="flex-1 max-w-[120px]">
                  <DangerBar level={selectedChar.dangerLevel} />
                </div>
                <span className="text-[10px] font-bold" style={{ color: resolveColor(selectedChar.accentColor, accent) }}>
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
                "{selectedChar.signatureMoment}"
              </p>
            </div>
          )}

          {/* Connected relationships */}
          {selectedRels.length > 0 && (
            <div className="border-t border-white/5 px-4 py-3">
              <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-2">Connections ({selectedRels.length})</p>
              <div className="space-y-2">
                {selectedRels.map((rel, i) => {
                  const isSource = rel.source === selected
                  const other = isSource ? rel.target : rel.source
                  const edgeColor = EDGE_COLORS[rel.type] || '#555'
                  return (
                    <div
                      key={i}
                      className="flex items-start gap-2 cursor-pointer hover:bg-white/5 rounded px-1.5 py-1 -mx-1.5 transition-colors"
                      onClick={(e) => { e.stopPropagation(); setSelected(other) }}
                    >
                      <span className="shrink-0 mt-0.5 w-2 h-2 rounded-full" style={{ backgroundColor: edgeColor }} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-gray-300 font-bold">{other.split(' ')[0]}</span>
                          <span className="text-[8px] uppercase tracking-wider" style={{ color: edgeColor }}>
                            {isSource ? `→ ${rel.type}` : `← ${rel.type}`}
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
