import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { UNIVERSE_CATALOG, UNIVERSE_CATALOG_MAP, loadUniverseBySlug } from '../data/index.js'
import SeoHead from './SeoHead'
import { getClassificationLabel } from '../utils/getClassificationLabel'
import { SITE_NAME, SITE_URL } from '../utils/seo'
import {
  ArrowLeft, Scale, Zap, Users, Shield, GitBranch,
  Copy, Check, Shuffle, X, ChevronDown, Sparkles
} from 'lucide-react'

// System type badge colors
const SYSTEM_COLORS = {
  timeline: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30' },
  'counter-tree': { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/30' },
  'node-graph': { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/30' },
  'affinity-matrix': { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/30' },
}

function SystemBadge({ type }) {
  const colors = SYSTEM_COLORS[type] || SYSTEM_COLORS['node-graph']
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colors.bg} ${colors.text} ${colors.border}`}>
      <Sparkles className="w-2.5 h-2.5" />
      {type.replace('-', ' ')}
    </span>
  )
}

// Loading skeleton row
function SkeletonRow() {
  return (
    <div className="flex items-center border-b border-white/5 last:border-0">
      <div className="w-36 shrink-0 px-3 py-2.5">
        <div className="h-3 bg-white/5 rounded animate-pulse w-20" />
      </div>
      <div className="flex-1 px-3 py-2.5">
        <div className="h-3 bg-white/5 rounded animate-pulse w-32" />
      </div>
      <div className="flex-1 px-3 py-2.5 border-l border-white/10">
        <div className="h-3 bg-white/5 rounded animate-pulse w-28" />
      </div>
    </div>
  )
}

// Loading skeleton card
function SkeletonCard() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 bg-white/5 rounded" />
        <div className="h-4 bg-white/5 rounded w-24" />
      </div>
      <div className="space-y-2">
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    </div>
  )
}

// VS Badge with animation
function VsBadge({ visible }) {
  return (
    <div className={`relative flex items-center justify-center transition-all duration-500 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
      <div className="relative">
        {/* Glow ring */}
        <div className={`absolute inset-0 rounded-full bg-cyan-400/20 blur-xl scale-150 transition-all duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`} />
        {/* VS circle */}
        <div className={`relative w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center font-black text-lg text-slate-900 shadow-lg shadow-cyan-400/30 transition-all duration-500 ${visible ? 'scale-100 ring-4 ring-cyan-400/30' : 'scale-75'}`}>
          VS
        </div>
      </div>
    </div>
  )
}

// Universe selector card (for mobile-first picker)
function UniverseSelector({ selected, onSelect, label, side }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selectedUniverse = UNIVERSE_CATALOG.find(u => u.id === selected)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2 block">{label}</label>
      
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full h-14 rounded-xl border transition-all duration-200 flex items-center gap-3 px-4 ${
          open
            ? 'border-cyan-400/50 bg-cyan-400/10'
            : selected
              ? 'border-white/10 bg-white/5 hover:border-white/20'
              : 'border-white/10 bg-white/5 hover:border-white/20'
        }`}
      >
        {selectedUniverse ? (
          <>
            <div
              className="w-8 h-8 rounded-lg bg-cover bg-center shrink-0"
              style={{ backgroundImage: `url(${selectedUniverse.animeImageUrl})` }}
            />
            <div className="flex-1 text-left">
              <p className="text-xs font-bold text-white leading-tight">{selectedUniverse.anime}</p>
              <p className="text-[10px] text-gray-500 truncate">{selectedUniverse.tagline}</p>
            </div>
          </>
        ) : (
          <div className="flex-1 text-left">
            <p className="text-xs text-gray-400">Choose universe...</p>
          </div>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#0a0a10] border border-white/10 rounded-xl shadow-2xl shadow-black/50 max-h-80 overflow-y-auto">
          <div className="p-2 space-y-1">
            {UNIVERSE_CATALOG.map(u => (
              <button
                key={u.id}
                type="button"
                onClick={() => { onSelect(u.id); setOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all active:scale-95 ${
                  u.id === selected
                    ? 'bg-cyan-400/20 border border-cyan-400/30'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-lg bg-cover bg-center shrink-0"
                  style={{ backgroundImage: `url(${u.animeImageUrl})` }}
                />
                <div className="flex-1 text-left">
                  <p className="text-xs font-bold text-white leading-tight">{u.anime}</p>
                  <p className="text-[10px] text-gray-500 truncate">{u.tagline}</p>
                </div>
                {u.id === selected && <Check className="w-4 h-4 text-cyan-400" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function getCompareStats(left, right) {
  if (!left || !right) return []
  return [
    {
      category: 'System',
      icon: <Zap className="w-3.5 h-3.5" />,
      rows: [
        { label: 'Type', left: getClassificationLabel(left.visualizationHint), right: getClassificationLabel(right.visualizationHint) },
        { label: 'Rules Count', left: left.rules?.length || 0, right: right.rules?.length || 0 },
        { label: 'Factions', left: left.factions?.length || 0, right: right.factions?.length || 0 },
        { label: 'Key Characters', left: left.characters?.length || 0, right: right.characters?.length || 0 },
        { label: 'Relationships', left: left.relationships?.length || 0, right: right.relationships?.length || 0 },
        { label: 'Causal Events', left: left.causalEvents?.length || 0, right: right.causalEvents?.length || 0 },
        { label: 'Anomalies', left: left.anomalies?.length || 0, right: right.anomalies?.length || 0 },
      ],
    },
    {
      category: 'Combat',
      icon: <Shield className="w-3.5 h-3.5" />,
      rows: [
        { label: 'Power System', left: left.powerSystem?.[0]?.name || 'N/A', right: right.powerSystem?.[0]?.name || 'N/A' },
        { label: 'Combat Style', left: left.combatStyle || 'Standard', right: right.combatStyle || 'Standard' },
        { label: 'System Complexity', left: left.systemComplexity || 'Medium', right: right.systemComplexity || 'Medium' },
      ],
    },
    {
      category: 'World',
      icon: <GitBranch className="w-3.5 h-3.5" />,
      rows: [
        { label: 'Factions', left: left.factions?.map(f => f.name).slice(0,3).join(', ') || 'N/A', right: right.factions?.map(f => f.name).slice(0,3).join(', ') || 'N/A' },
        { label: 'System Questions', left: left.systemQuestions?.length || 0, right: right.systemQuestions?.length || 0 },
      ],
    },
  ]
}

function CompareRow({ label, left, right }) {
  const leftVal = String(left ?? '—')
  const rightVal = String(right ?? '—')
  const same = leftVal === rightVal
  const leftWins = !same && typeof left === 'number' && typeof right === 'number' && left > right
  const rightWins = !same && typeof left === 'number' && typeof right === 'number' && right > left

  return (
    <div className="flex items-center border-b border-white/5 last:border-0 hover:bg-white/[0.02] active:bg-white/[0.04] transition-colors">
      <div className="px-3 py-2.5 text-[10px] uppercase tracking-[0.14em] text-gray-500 bg-black/20 w-36 shrink-0">{label}</div>
      <div className={`px-3 py-2.5 text-[11px] flex-1 ${same ? 'text-gray-500' : leftWins ? 'text-green-300' : 'text-gray-200'}`}>
        {leftVal}
      </div>
      <div className={`px-3 py-2.5 text-[11px] border-l border-white/10 flex-1 ${same ? 'text-gray-500' : rightWins ? 'text-green-300' : 'text-gray-200'}`}>
        {rightVal}
      </div>
    </div>
  )
}

// Stats bar component
function StatsBar({ universe, side }) {
  if (!universe) return null
  return (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      <SystemBadge type={universe.visualizationHint} />
      <span className="text-[10px] text-gray-500">
        {universe.stats?.characters || 0} chars · {universe.stats?.powerSystem || 0} power · {universe.stats?.rules || 0} rules
      </span>
    </div>
  )
}

// Universe header card
function UniverseCard({ universe, side }) {
  if (!universe) return null
  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-4 mb-4">
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-12 h-12 rounded-xl bg-cover bg-center shrink-0 ring-2 ring-white/10"
          style={{ backgroundImage: `url(${universe.animeImageUrl})` }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-black text-white leading-tight mb-0.5">{universe.anime}</h3>
          <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">{universe.tagline}</p>
        </div>
      </div>
      <StatsBar universe={universe} side={side} />
    </div>
  )
}

export default function CompareRoute() {
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Support both ?left=slug&right=slug and ?a=slug&b=slug URL formats
  const rawLeft = searchParams.get('left') || searchParams.get('a') || ''
  const rawRight = searchParams.get('right') || searchParams.get('b') || ''
  
  // Validate universes exist in catalog
  const leftId = UNIVERSE_CATALOG_MAP[rawLeft] ? rawLeft : ''
  const rightId = UNIVERSE_CATALOG_MAP[rawRight] ? rawRight : ''

  const [leftData, setLeftData] = useState(null)
  const [rightData, setRightData] = useState(null)
  const [shareCopied, setShareCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Mount animation trigger
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load actual universe core payloads
  useEffect(() => {
    if (!leftId && !rightId) return
    let cancelled = false
    setLeftData(null)
    setRightData(null)
    
    Promise.all([
      leftId ? loadUniverseBySlug(leftId) : Promise.resolve(null),
      rightId ? loadUniverseBySlug(rightId) : Promise.resolve(null),
    ]).then(([l, r]) => {
      if (cancelled) return
      setLeftData(l)
      setRightData(r)
    }).catch(() => {
      if (cancelled) return
      setLeftData(UNIVERSE_CATALOG_MAP[leftId] || null)
      setRightData(UNIVERSE_CATALOG_MAP[rightId] || null)
    })
    return () => { cancelled = true }
  }, [leftId, rightId])

  // Merge catalog preview data with loaded payload data
  const left = useMemo(() => {
    if (!leftData && !leftId) return null
    if (!leftData) return UNIVERSE_CATALOG_MAP[leftId] || null
    return { ...UNIVERSE_CATALOG_MAP[leftId], ...leftData }
  }, [leftData, leftId])

  const right = useMemo(() => {
    if (!rightData && !rightId) return null
    if (!rightData) return UNIVERSE_CATALOG_MAP[rightId] || null
    return { ...UNIVERSE_CATALOG_MAP[rightId], ...rightData }
  }, [rightData, rightId])

  const comparisonStats = useMemo(() => getCompareStats(left, right), [left, right])
  
  const hasMatchup = left && right
  const sameUniverse = leftId && rightId && leftId === rightId

  // Share functionality
  const copyShareLink = useCallback(() => {
    const url = `${window.location.origin}/compare?left=${leftId}&right=${rightId}`
    navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    })
  }, [leftId, rightId])

  // Random matchup
  const randomMatchup = useCallback(() => {
    const shuffled = [...UNIVERSE_CATALOG].sort(() => Math.random() - 0.5)
    const [a, b] = shuffled.slice(0, 2)
    const params = new URLSearchParams(searchParams)
    params.set('left', a.id)
    params.set('right', b.id)
    setSearchParams(params)
  }, [searchParams, setSearchParams])

  const seo = {
    title: left?.anime && right?.anime
      ? `${left.anime} vs ${right.anime} — System Comparison | ${SITE_NAME}`
      : `Universe Comparison | ${SITE_NAME}`,
    description: left && right
      ? `Compare ${left.anime} and ${right.anime} side-by-side. Power systems, factions, combat mechanics, and structural analysis.`
      : `Compare anime universe systems side-by-side.`,
    canonicalUrl: `${SITE_URL}/compare?left=${leftId}&right=${rightId}`,
    keywords: 'anime comparison, universe comparison, anime power systems, side-by-side anime analysis',
    image: left?.animeImageUrl || right?.animeImageUrl || '',
  }

  const structuredData = buildCompareStructuredData(left || null, right || null, leftId, rightId)

  return (
    <div className="min-h-screen bg-[#050508] text-white font-mono">
      <SeoHead {...seo} structuredData={structuredData} />
      
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-cyan-400/5 via-transparent to-purple-400/5 pointer-events-none" />
      
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className={`mb-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Link to="/" className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-gray-400 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-3 h-3" /> Back to Archive
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Scale className="w-5 h-5 text-cyan-400" />
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">System Comparison</h1>
          </div>
          <p className="text-xs text-gray-400">Compare anime universes as structured systems — power mechanics, factions, combat rules, and world logic.</p>
        </div>

        {/* Universe Selector */}
        <div className={`mb-6 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Mobile: stacked selectors, Desktop: side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
            <UniverseSelector
              selected={leftId}
              onSelect={(id) => {
                const params = new URLSearchParams(searchParams)
                params.set('left', id)
                setSearchParams(params)
              }}
              label="Universe A"
              side="left"
            />
            <UniverseSelector
              selected={rightId}
              onSelect={(id) => {
                const params = new URLSearchParams(searchParams)
                params.set('right', id)
                setSearchParams(params)
              }}
              label="Universe B"
              side="right"
            />
          </div>
          
          {/* Action buttons row */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={randomMatchup}
              disabled={!leftId && !rightId}
              className="flex-1 flex items-center justify-center gap-2 h-10 sm:h-9 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-[10px] font-bold uppercase tracking-wider text-purple-300 hover:from-purple-500/30 hover:to-pink-500/30 hover:border-purple-500/50 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Random Matchup</span>
              <span className="sm:hidden">Random</span>
            </button>
            
            {hasMatchup && (
              <button
                onClick={copyShareLink}
                className="flex items-center justify-center gap-2 h-10 sm:h-9 px-4 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-gray-300 hover:bg-white/10 hover:border-white/20 transition-all active:scale-[0.98]"
              >
                {shareCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{shareCopied ? 'Copied!' : 'Share'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Same universe warning */}
        {sameUniverse && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
            <X className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-xs text-amber-300">You're comparing the same universe. Pick two different ones to see a real matchup.</p>
          </div>
        )}

        {/* VS Badge - centered between universes */}
        {hasMatchup && (
          <div className="flex justify-center mb-6">
            <VsBadge visible={hasMatchup} />
          </div>
        )}

        {/* Universe Quick Links */}
        {hasMatchup && (
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Link
              to={`/universe/${leftId}`}
              className="group flex items-center justify-between p-4 rounded-xl border border-white/10 bg-gradient-to-r from-white/5 to-transparent hover:from-white/10 hover:border-white/20 transition-all"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-6 h-6 rounded-md bg-cover bg-center"
                    style={{ backgroundImage: `url(${left.animeImageUrl})` }}
                  />
                  <p className="text-[10px] uppercase tracking-[0.14em] text-gray-500">{left.anime}</p>
                </div>
                <p className="text-xs font-bold text-white line-clamp-1">{left.tagline}</p>
              </div>
              <span className="text-[10px] text-cyan-400 group-hover:translate-x-1 transition-transform">View →</span>
            </Link>
            <Link
              to={`/universe/${rightId}`}
              className="group flex items-center justify-between p-4 rounded-xl border border-white/10 bg-gradient-to-l from-white/5 to-transparent hover:from-white/10 hover:border-white/20 transition-all"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-6 h-6 rounded-md bg-cover bg-center"
                    style={{ backgroundImage: `url(${right.animeImageUrl})` }}
                  />
                  <p className="text-[10px] uppercase tracking-[0.14em] text-gray-500">{right.anime}</p>
                </div>
                <p className="text-xs font-bold text-white line-clamp-1">{right.tagline}</p>
              </div>
              <span className="text-[10px] text-cyan-400 group-hover:-translate-x-1 transition-transform">← View</span>
            </Link>
          </div>
        )}

        {/* Info note */}
        {hasMatchup && (
          <p className="text-[10px] text-gray-600 text-center mb-6 leading-relaxed">
            Counts reflect the full universe data — characters, factions, rules, relationships, and events mapped in the archive.
          </p>
        )}

        {/* Comparison Content */}
        {(!leftId && !rightId) ? (
          /* Empty State */
          <div className={`text-center py-20 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-purple-400/20 border border-white/10 flex items-center justify-center">
              <Scale className="w-10 h-10 text-gray-600" />
            </div>
            <h2 className="text-lg font-black text-white mb-2">Pick Two Universes</h2>
            <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
              Select two anime universes above to see a detailed side-by-side comparison of their power systems, factions, and combat mechanics.
            </p>
            <button
              onClick={randomMatchup}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 text-[10px] font-bold uppercase tracking-wider text-slate-900 hover:from-cyan-300 hover:to-cyan-400 transition-all active:scale-95"
            >
              <Shuffle className="w-3.5 h-3.5" />
              Surprise Me
            </button>
          </div>
        ) : (leftId || rightId) && !left && !right ? (
          /* Loading State */
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : hasMatchup && !sameUniverse ? (
          /* Comparison Tables */
          <div className={`space-y-4 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {comparisonStats.map(({ category, icon, rows }) => (
              <div key={category} className="rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-black/20">
                  <span className="text-cyan-400">{icon}</span>
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">{category}</h2>
                </div>
                <div className="w-full">
                  {rows.map((row) => (
                    <CompareRow key={row.label} {...row} />
                  ))}
                </div>
              </div>
            ))}

            {/* CTA buttons */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Link
                to={`/universe/${leftId}`}
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 hover:from-cyan-300 hover:to-cyan-400 transition-all active:scale-[0.98]"
              >
                Full {left.anime} Analysis →
              </Link>
              <Link
                to={`/universe/${rightId}`}
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 hover:from-cyan-300 hover:to-cyan-400 transition-all active:scale-[0.98]"
              >
                Full {right.anime} Analysis →
              </Link>
            </div>
          </div>
        ) : (
          /* One universe selected */
          <div className="text-center py-12">
            <p className="text-xs text-gray-500 uppercase tracking-widest">Select another universe to compare</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-white/5 text-center">
          <p className="text-[10px] text-gray-600 tracking-wider">
            Analysis based on publicly known lore. Not affiliated with any anime studio or creator.
          </p>
        </div>
      </div>
    </div>
  )
}

export const preferredOrder = ['aot', 'jjk', 'chainsawman', 'demonslayer', 'hxh', 'vinlandsaga', 'steinsgate', 'deathnote', 'fmab', 'codegeass', 'mha', 'frieren', 'sololeveling', 'goblinslayer', 'mushokutensei', 'naruto', 'bleach', 'dragonballz', 'mob-psycho-100', 'tokyo-ghoul', 'one-piece', 'black-clover', 're-zero', 'blue-lock', 'sword-art-online', 'tokyo-revengers', 'one-punch-man', 'spy-x-family', 'fire-force', 'parasyte']
