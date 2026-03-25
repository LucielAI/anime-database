import React, { useState, useCallback, useRef, useEffect, lazy, Suspense } from 'react'
import * as d3 from 'd3-force'
import DangerBar from '../components/DangerBar'
import { resolveColor } from '../utils/resolveColor'
import { RELATIONSHIP_COLORS } from '../config/relationshipColors'

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
const VB_W = 800
const VB_H = 650
const LABEL_OFFSET = 48
const TITLE_OFFSET = 60
const BOUNDS_PAD = 80


const MIN_NODE_DIST = 130

function getConnectedRelationships(name, relationships) {
  return relationships.filter(r => 
    (typeof r.source === 'object' ? r.source.name === name : r.source === name) || 
    (typeof r.target === 'object' ? r.target.name === name : r.target === name)
  )
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

const StandardCardsExplorer = lazy(() => import('./StandardCardsExplorer'))

export default React.memo(function NodeGraphExplorer({ characters = [], relationships = [], isSystemMode, theme, data }) {
  const svgRef = useRef(null)
  const simulationRef = useRef(null)
  const [nodes, setNodes] = useState([])
  const [links, setLinks] = useState([])
  const [selected, setSelected] = useState(null)
  const [dragging, setDragging] = useState(null)
  const [hoveredEdge, setHoveredEdge] = useState(null)
  const [imgFailed, setImgFailed] = useState({})
  const [hasInteracted, setHasInteracted] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const rafRef = useRef(null)
  // Stable refs for D3 — avoids creating new array references on every tick
  const nodesRef = useRef([])
  const linksRef = useRef([])

  // Wow Graph Moment — auto-select highest-degree node
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasInteracted && !selected && nodes.length > 0) {
        const degrees = {}
        links.forEach(l => {
          const sName = typeof l.source === 'object' ? l.source.name : l.source
          const tName = typeof l.target === 'object' ? l.target.name : l.target
          degrees[sName] = (degrees[sName] || 0) + 1
          degrees[tName] = (degrees[tName] || 0) + 1
        })
        const target = Object.keys(degrees).reduce((a, b) => (degrees[a] || 0) > (degrees[b] || 0) ? a : b, null)
        if (target) setSelected(target)
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [nodes, hasInteracted, selected, links])

  // Stable refs so resetLayout doesn't need characters/relationships in its deps
  const charactersRef = useRef(characters)
  const relationshipsRef = useRef(relationships)

  useEffect(() => {
    charactersRef.current = characters
    relationshipsRef.current = relationships
  }, [characters, relationships])

  const resetLayout = useCallback(() => {
    if (simulationRef.current) simulationRef.current.stop()

    // Position nodes radially to start
    const cx = VB_W / 2, cy = VB_H / 2, spread = 220
    const chars = charactersRef.current
    const rels = relationshipsRef.current
    const newNodes = chars.map((c, i) => {
      const angle = (2 * Math.PI * i) / chars.length - Math.PI / 2
      return { ...c, x: cx + spread * Math.cos(angle), y: cy + spread * Math.sin(angle) }
    })
    
    // Copy links so d3 doesn't mutate original JSON relationship objects
    const newLinks = rels.map(r => ({ ...r }))

    // Store in refs so tick can read them without causing re-renders
    nodesRef.current = newNodes
    linksRef.current = newLinks

    const sim = d3.forceSimulation(newNodes)
      .force('link', d3.forceLink(newLinks).id(d => d.name).distance(220))
      .force('charge', d3.forceManyBody().strength(-6500))
      .force('center', d3.forceCenter(VB_W / 2, VB_H / 2).strength(0.04))
      .force('collide', d3.forceCollide().radius(NODE_R + 35).iterations(3))
      .alphaDecay(0.02)
      .on('tick', () => {
        if (!rafRef.current) {
          rafRef.current = requestAnimationFrame(() => {
            // Enforce boundary box safely — mutate nodes in-place
            nodesRef.current.forEach(n => {
              n.x = Math.max(BOUNDS_PAD, Math.min(VB_W - BOUNDS_PAD, n.x))
              n.y = Math.max(BOUNDS_PAD, Math.min(VB_H - BOUNDS_PAD, n.y))
            })
            setNodes([...nodesRef.current])
            setLinks([...linksRef.current])
            rafRef.current = null
          })
        }
      })

    simulationRef.current = sim
  }, []) // stable — reads current data from refs

  useEffect(() => {
    resetLayout()
    return () => {
      if (simulationRef.current) simulationRef.current.stop()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [characters, relationships]) // triggers resetLayout only when data actually changes

  if (characters.length === 0) {
    return (
      <Suspense fallback={<div className="w-full h-64 bg-white/5 rounded-xl animate-pulse" />}>
        <StandardCardsExplorer characters={characters} isSystemMode={isSystemMode} theme={theme} />
      </Suspense>
    )
  }

  const nodeMap = {}
  nodes.forEach(n => { nodeMap[n.name] = n })

  const accent = theme?.accent || '#22d3ee'
  const graphSummary = `${data?.anime || 'Universe'} relationship graph showing ${characters.length} entities and ${relationships.length} directed edges.`

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
    setHasInteracted(true)
    e.stopPropagation()
    if (e.cancelable) e.preventDefault()
    if (!simulationRef.current) return
    simulationRef.current.alphaTarget(0.3).restart()
    const node = simulationRef.current.nodes().find(n => n.name === name)
    if (!node) return
    const svgP = getSvgPoint(e)
    if (!svgP) return
    dragOffset.current = { x: svgP.x - node.x, y: svgP.y - node.y }
    node.fx = node.x
    node.fy = node.y
    setDragging(name)
  }

  const handleMove = (e) => {
    if (!dragging || !simulationRef.current) return
    const svgP = getSvgPoint(e)
    if (!svgP) return
    const node = simulationRef.current.nodes().find(n => n.name === dragging)
    if (node) {
      node.fx = svgP.x - dragOffset.current.x
      node.fy = svgP.y - dragOffset.current.y
    }
  }

  const handleEnd = () => {
    if (!dragging || !simulationRef.current) return
    const node = simulationRef.current.nodes().find(n => n.name === dragging)
    if (node) {
      node.fx = null
      node.fy = null
    }
    simulationRef.current.alphaTarget(0)
    setDragging(null)
  }

  const selectedChar = selected ? characters.find(c => c.name === selected) : null
  const selectedRels = selected ? getConnectedRelationships(selected, links) : []

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
            <span className="w-3 h-0.5 inline-block rounded" style={{ backgroundColor: RELATIONSHIP_COLORS[type] || '#555' }} />
            <span className="text-[9px] text-gray-500 uppercase tracking-wider">{type}</span>
          </span>
        ))}
      </div>

      <div className={`relative w-full overflow-x-auto scrollbar-hide rounded-xl border border-white/10 bg-[#050508] ${isSystemMode ? 'sys-mode-container shadow-[inset_0_0_100px_rgba(34,211,238,0.03)]' : ''}`}>
        <svg
          ref={svgRef}
          role="img"
          aria-label={graphSummary}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="w-full h-auto max-h-[650px]"
          style={{ aspectRatio: `${VB_W} / ${VB_H}` }}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        >
          <title>{graphSummary}</title>
          <desc>Interactive network map of characters and relationship edge types. Select nodes to inspect local dependencies and conflict links.</desc>
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
          {links.map((rel, i) => {
            const s = rel.source
            const t = rel.target
            if (!s || !t || typeof s === 'string' || typeof t === 'string') return null
            const isActive = !selected || s.name === selected || t.name === selected
            const edgeColor = RELATIONSHIP_COLORS[rel.type] || '#555'
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
                  opacity={isSystemMode ? (selected ? (isActive ? 1 : 0.1) : 0.8) : (selected ? (isActive ? 0.85 : 0.06) : 0.4)}
                  strokeDasharray={isSystemMode ? "2 4" : (rel.type === 'mirror' || rel.type === 'counter' ? '6 3' : undefined)}
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
            const isConnected = selected && links.some(r =>
              (r.source.name === selected && r.target.name === node.name) ||
              (r.target.name === selected && r.source.name === node.name)
            )
            const isFaded = selected && !isSelected && !isConnected
            const nodeColor = resolveColor(node.accentColor, accent)
            const hasImage = node.imageUrl && !imgFailed[node.name]

            return (
              <g key={node.name}
                onMouseDown={e => handleStart(e, node.name)}
                onTouchStart={e => handleStart(e, node.name)}
                onClick={() => {
                  setHasInteracted(true)
                  setSelected(prev => prev === node.name ? null : node.name)
                }}
                className="cursor-pointer"
                opacity={isFaded ? 0.35 : 1}
              >
                {/* Glow ring */}
                {isSelected && (
                  <circle cx={node.x} cy={node.y} r={NODE_R + 6}
                    fill="none" stroke={nodeColor} 
                    strokeWidth={isSystemMode ? 1.5 : 2}
                    opacity={isSystemMode ? 0.9 : 0.5} 
                    strokeDasharray={isSystemMode ? "4 4" : undefined}
                    filter={isSystemMode ? undefined : "url(#node-glow)"} />
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
                        fontSize={20} fontFamily="monospace" fontWeight="bold"
                        fill={nodeColor} style={{ pointerEvents: 'none' }}>
                        {node.name.slice(0, 1).toUpperCase()}
                      </text>
                    </>
                  )}
                </g>

                {/* Name label with heavy stroke for readability */}
                <g style={{ pointerEvents: 'none' }}>
                  <text
                    x={node.x} y={node.y + LABEL_OFFSET}
                    textAnchor="middle" fontSize={12} fontFamily="monospace"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    stroke="#050508" strokeWidth={5} strokeLinejoin="round"
                  >
                    {node.name.split(' ')[0]}
                  </text>
                  <text
                    x={node.x} y={node.y + LABEL_OFFSET}
                    textAnchor="middle" fontSize={12} fontFamily="monospace"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    fill={isSelected || isConnected ? '#e5e7eb' : '#9ca3af'}
                  >
                    {isSystemMode ? `[ID:${node.name.substring(0,3).toUpperCase()}]` : node.name.split(' ')[0]}
                  </text>
                </g>

                {/* Title on select/connect */}
                {(isSelected || isConnected) && (
                  <g style={{ pointerEvents: 'none' }}>
                    <text
                      x={node.x} y={node.y + TITLE_OFFSET}
                      textAnchor="middle" fontSize={9} fontFamily="monospace"
                      stroke="#050508" strokeWidth={4} strokeLinejoin="round"
                    >
                      {node.title}
                    </text>
                    <text
                      x={node.x} y={node.y + TITLE_OFFSET}
                      textAnchor="middle" fontSize={9} fontFamily="monospace"
                      fill={nodeColor} opacity={0.9}
                    >
                      {node.title}
                    </text>
                  </g>
                )}
              </g>
            )
          })}
        </svg>

        {/* Edge hover tooltip */}
        {hoveredEdge !== null && links[hoveredEdge] && (
          <div className="absolute bottom-2 left-2 right-2 bg-black/95 border rounded-lg px-3 py-2 z-10"
            style={{ borderColor: RELATIONSHIP_COLORS[links[hoveredEdge].type] || accent }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold tracking-wider"
                style={{ color: RELATIONSHIP_COLORS[links[hoveredEdge].type] }}>
                {links[hoveredEdge].source.name.split(' ')[0]}
              </span>
              <span className="text-[9px] text-gray-500">&rarr;</span>
              <span className="text-[10px] font-bold tracking-wider"
                style={{ color: RELATIONSHIP_COLORS[links[hoveredEdge].type] }}>
                {links[hoveredEdge].target.name.split(' ')[0]}
              </span>
              <span className="text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider"
                style={{
                  color: RELATIONSHIP_COLORS[links[hoveredEdge].type],
                  backgroundColor: `${RELATIONSHIP_COLORS[links[hoveredEdge].type]}20`
                }}>
                {links[hoveredEdge].type}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              {isSystemMode
                ? (links[hoveredEdge].systemDesc || links[hoveredEdge].loreDesc)
                : links[hoveredEdge].loreDesc}
            </p>
          </div>
        )}
      </div>

      {/* Selected character detail panel */}
      {selectedChar && (
        <div className="bg-[#050508] border border-white/10 rounded-xl overflow-hidden shadow-2xl animate-fade-in relative">
          <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: resolveColor(selectedChar.accentColor, accent) }} />
          <div className="flex gap-4 p-5">
            {/* Portrait with proper gradient fallback */}
            <div className="shrink-0 w-20 h-24 rounded-lg overflow-hidden border border-white/10"
              style={{
                background: `linear-gradient(to bottom, ${resolveColor(selectedChar.gradientFrom, '#1a1a2e')}, ${resolveColor(selectedChar.gradientTo, '#0f0f1a')})`
              }}>
              {selectedChar.imageUrl && !imgFailed[selectedChar.name] ? (
                <img
                  src={selectedChar.imageUrl}
                  alt={`${selectedChar.name} portrait — ${selectedChar.title}`}
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                  decoding="async"
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
          <div className="px-5 pb-4">
            <div className="bg-white/5 border border-white/5 rounded p-3">
              <p className="text-xs text-gray-300 leading-relaxed tracking-wide">
                {isSystemMode ? selectedChar.systemBio : selectedChar.loreBio}
              </p>
            </div>
          </div>

          {/* Signature Moment */}
          {selectedChar.signatureMoment && !isSystemMode && (
            <div className="px-5 pb-4">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                <span className="w-2 h-0.5 bg-gray-600"></span> Signature Moment
              </p>
              <p className="text-[11px] text-gray-400 leading-relaxed italic border-l-2 pl-3 py-1"
                style={{ borderColor: resolveColor(selectedChar.accentColor, accent) }}>
                &ldquo;{selectedChar.signatureMoment}&rdquo;
              </p>
            </div>
          )}

          {/* Connected relationships */}
          {selectedRels.length > 0 && (
            <div className="border-t border-white/10 bg-white/[0.02] px-5 py-4">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-2 h-0.5 bg-gray-600"></span> Operational Ties ({selectedRels.length})
              </p>
              <div className="space-y-2">
                {selectedRels.map((rel, i) => {
                  const isSource = rel.source.name === selected
                  const other = isSource ? rel.target.name : rel.source.name
                  const edgeColor = RELATIONSHIP_COLORS[rel.type] || '#555'
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
})
