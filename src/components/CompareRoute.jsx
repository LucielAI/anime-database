import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { UNIVERSE_CATALOG, UNIVERSE_CATALOG_MAP, loadUniverseBySlug } from '../data/index.js'
import SeoHead from './SeoHead'
import { getClassificationLabel } from '../utils/getClassificationLabel'
import { SITE_NAME, SITE_URL } from '../utils/seo'
import { ArrowLeft, ArrowUpDown, Share2, Check } from 'lucide-react'
import './CompareRoute.css'

function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse rounded bg-white/[0.04] ${className}`} aria-hidden="true" />
  )
}

function SwapButton({ onSwap, disabled }) {
  return (
    <button
      onClick={onSwap}
      disabled={disabled}
      className="flex items-center justify-center w-10 h-10 rounded-xl border border-white/10 text-gray-400 hover:text-cyan-400 hover:border-cyan-400/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      aria-label="Swap universes"
      title="Swap (S)"
    >
      <ArrowUpDown className="w-4 h-4" />
    </button>
  )
}

function ShareButton({ leftId, rightId }) {
  const [copied, setCopied] = useState(false)
  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/compare?left=${leftId}&right=${rightId}`
  const shareText = `Comparing ${UNIVERSE_CATALOG_MAP[leftId]?.anime || leftId} vs ${UNIVERSE_CATALOG_MAP[rightId]?.anime || rightId} — anime system analysis`
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }
  const handleTwitterShare = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer,width=600,height=400')
  }
  return (
    <div className="flex items-center gap-2">
      <button onClick={handleCopy} className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-cyan-400 hover:border-cyan-400/30 transition-all text-xs uppercase tracking-widest">
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
        {copied ? 'Copied' : 'Copy Link'}
      </button>
      <button onClick={handleTwitterShare} className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all text-xs uppercase tracking-widest">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
        Share on X
      </button>
    </div>
  )
}

function UniverseSelector({ id, value, onChange }) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-11 pl-4 pr-10 rounded-xl bg-white/5 border border-white/10 text-white text-sm appearance-none cursor-pointer hover:bg-white/10 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-all"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 1rem center',
      }}
    >
      <option value="">— Select —</option>
      {UNIVERSE_CATALOG.map((u) => (
        <option key={u.id} value={u.id}>{u.anime}</option>
      ))}
    </select>
  )
}

function CompareRow({ label, left, right, leftAnime, rightAnime, index, leftColor, rightColor }) {
  const same = String(left ?? '') === String(right ?? '')

  return (
    <>
      {/* Desktop: 4-column grid */}
      <div className="hidden sm:grid compare-grid-cols border-b border-white/[0.04] last:border-b-0">
        <div className="compare-label px-4 py-3 w-full sm:w-40 shrink-0 bg-black/30">
          <span className="text-[10px] uppercase tracking-[0.15em] text-gray-500 leading-relaxed">{label}</span>
        </div>
        <div className="px-4 py-3 text-xs text-gray-200 text-center">{left ?? '—'}</div>
        <div className="px-4 py-3 text-center">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-white/10 text-[9px] font-bold text-gray-500">VS</span>
        </div>
        <div className="px-4 py-3 text-xs text-gray-200 text-center">{right ?? '—'}</div>
      </div>

      {/* Mobile: stacked stat cards */}
      <div className="sm:hidden compare-mobile-row">
        <div className="compare-mobile-stat-card compare-mobile-left" style={{ borderTopColor: leftColor }}>
          <div className="compare-mobile-stat-anime" style={{ color: leftColor }}>{leftAnime || '—'}</div>
          <div className="compare-mobile-stat-value">{left ?? '—'}</div>
        </div>
        <div className="compare-mobile-divider">
          <div className="compare-mobile-vs">VS</div>
          <div className="text-[9px] uppercase tracking-widest text-gray-600 mt-1">{label}</div>
        </div>
        <div className="compare-mobile-stat-card compare-mobile-right" style={{ borderTopColor: rightColor }}>
          <div className="compare-mobile-stat-anime" style={{ color: rightColor }}>{rightAnime || '—'}</div>
          <div className="compare-mobile-stat-value">{right ?? '—'}</div>
        </div>
      </div>
    </>
  )
}

function getComparisonStats(left, right) {
  if (!left || !right) return []
  return [
    {
      category: 'System',
      rows: [
        { label: 'Type', left: getClassificationLabel(left.visualizationHint), right: getClassificationLabel(right.visualizationHint) },
        { label: 'Rules Count', left: left.rules?.length || 0, right: right.rules?.length || 0 },
        { label: 'Factions', left: left.factions?.length || 0, right: right.factions?.length || 0 },
        { label: 'Characters', left: left.characters?.length || 0, right: right.characters?.length || 0 },
        { label: 'Relationships', left: left.relationships?.length || 0, right: right.relationships?.length || 0 },
      ],
    },
    {
      category: 'Combat',
      rows: [
        { label: 'Power System', left: left.powerSystem?.[0]?.name || 'N/A', right: right.powerSystem?.[0]?.name || 'N/A' },
        { label: 'Combat Style', left: left.combatStyle || 'Standard', right: right.combatStyle || 'Standard' },
        { label: 'Strategic Depth', left: left.strategicDepth || 'Standard', right: right.strategicDepth || 'Standard' },
      ],
    },
    {
      category: 'World',
      rows: [
        { label: 'Factions', left: left.factions?.map(f => f.name).slice(0,3).join(', ') || 'N/A', right: right.factions?.map(f => f.name).slice(0,3).join(', ') || 'N/A' },
        { label: 'System Questions', left: left.systemQuestions?.length || 0, right: right.systemQuestions?.length || 0 },
        { label: 'Apex Hierarchy', left: left.apexCharacter || 'N/A', right: right.apexCharacter || 'N/A' },
      ],
    },
  ]
}

export default function CompareRoute() {
  const [searchParams, setSearchParams] = useSearchParams()
  // Derive IDs from URL — both searchParams (router) and raw window for SSR safety
  const getParam = (name) => {
    // Try router first (reactive), then raw URL as fallback
    const sp = searchParams.get(name)
    if (sp) return sp
    // SSR/prerender fallback: read directly from window
    if (typeof window !== 'undefined') {
      try {
        return new URL(window.location.href).searchParams.get(name) || ''
      } catch { return '' }
    }
    return ''
  }
  const leftId = getParam('left') || getParam('a') || ''
  const rightId = getParam('right') || getParam('b') || ''
  const [leftData, setLeftData] = useState(null)
  const [rightData, setRightData] = useState(null)
  const [loading, setLoading] = useState(false)
  const leftSelectRef = useRef(null)
  const rightSelectRef = useRef(null)

  const left = leftData ? { ...UNIVERSE_CATALOG_MAP[leftId], ...leftData } : null
  const right = rightData ? { ...UNIVERSE_CATALOG_MAP[rightId], ...rightData } : null
  const comparisonStats = getComparisonStats(left, right)

  const handleSwap = useCallback(() => {
    const params = new URLSearchParams(searchParams)
    const currentLeft = params.get('left') || params.get('a') || ''
    const currentRight = params.get('right') || params.get('b') || ''
    if (!currentLeft && !currentRight) return
    if (currentLeft) params.set('right', currentLeft)
    if (currentRight) params.set('left', currentRight)
    params.delete('a')
    params.delete('b')
    setSearchParams(params)
  }, [searchParams, setSearchParams])

  const handleSelectKeyDown = useCallback((e, side) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const catalog = UNIVERSE_CATALOG
      const currentId = side === 'left' ? leftId : rightId
      const currentIndex = catalog.findIndex(u => u.id === currentId)
      if (currentIndex === -1) return
      const delta = e.key === 'ArrowDown' ? 1 : -1
      const nextIndex = (currentIndex + delta + catalog.length) % catalog.length
      const nextId = catalog[nextIndex].id
      const params = new URLSearchParams(searchParams)
      params.set(side, nextId)
      setSearchParams(params)
    } else if (e.key === 'Escape') {
      const ref = side === 'left' ? leftSelectRef : rightSelectRef
      ref.current?.blur()
    }
  }, [leftId, rightId, searchParams, setSearchParams])

  const handleGlobalKey = useCallback((e) => {
    const tag = document.activeElement?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
    if ((e.key === 's' || e.key === 'S') && !e.metaKey && !e.ctrlKey) {
      e.preventDefault()
      handleSwap()
    }
  }, [handleSwap])

  useEffect(() => {
    if (!leftId && !rightId) return
    setLoading(true)
    Promise.all([
      leftId ? loadUniverseBySlug(leftId) : Promise.resolve(null),
      rightId ? loadUniverseBySlug(rightId) : Promise.resolve(null),
    ]).then(([l, r]) => {
      setLeftData(l)
      setRightData(r)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [leftId, rightId])

  useEffect(() => {
    if (left?.anime && right?.anime) {
      document.title = `${left.anime} vs ${right.anime} — System Comparison | ${SITE_NAME}`
    } else if (left?.anime || right?.anime) {
      const selected = left?.anime || right?.anime
      document.title = `${selected} — System Comparison | ${SITE_NAME}`
    } else {
      document.title = `Universe Comparison | ${SITE_NAME}`
    }
  }, [left?.anime, right?.anime])

  useEffect(() => {
    window.addEventListener('keydown', handleGlobalKey)
    return () => window.removeEventListener('keydown', handleGlobalKey)
  }, [handleGlobalKey])

  const seo = {
    title: left?.anime && right?.anime
      ? `${left.anime} vs ${right.anime} — System Comparison | ${SITE_NAME}`
      : `Universe Comparison | ${SITE_NAME}`,
    description: left && right
      ? `Side-by-side structural comparison of ${left.anime} and ${right.anime} — power mechanics, combat rules, faction hierarchies, and world logic analyzed together.`
      : `Pick any two anime universes from the catalog and compare them side-by-side across power systems, combat styles, factions, and strategic depth.`,
    canonicalUrl: `${SITE_URL}/compare?left=${leftId}&right=${rightId}`,
    keywords: 'anime comparison, universe comparison, anime power systems',
  }

  const structuredData = left && right ? [
    { '@context': 'https://schema.org', '@type': 'ItemPage', name: `${left.anime} vs ${right.anime} — System Comparison` }
  ] : []

  const leftColor = '#22d3ee'  // cyan-400
  const rightColor = '#c084fc' // purple-400

  const skeletons = (
    <div className="space-y-3 animate-compare-fade-in">
      <div className="compare-skeleton-panel">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-black/20">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="h-3 w-20" />
        </div>
        {[1,2,3,4].map(i => (
          <div key={i} className="compare-mobile-row px-4 py-4 border-b border-white/[0.04]">
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#050508] text-white">
      <SeoHead {...seo} structuredData={structuredData} />
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-600 hover:text-cyan-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Archive
        </Link>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black uppercase tracking-[0.2em] mb-1 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            System Comparison
          </h1>
          <p className="text-gray-600 text-[11px]">Compare anime universes by mechanics and structure</p>
        </div>

        {/* Selector panel */}
        <div className="compare-selector-panel">
          <div className="compare-selector-grid">
            <div>
              <label className="compare-selector-label" htmlFor="left-select">Left Universe</label>
              <UniverseSelector
                id="left-select"
                ref={leftSelectRef}
                value={leftId}
                onChange={(v) => { const p = new URLSearchParams(searchParams); p.set('left', v); setSearchParams(p) }}
              />
            </div>
            <div className="flex flex-col items-center justify-end pb-1 gap-2">
              <SwapButton onSwap={handleSwap} disabled={!leftId && !rightId} />
            </div>
            <div>
              <label className="compare-selector-label" htmlFor="right-select">Right Universe</label>
              <UniverseSelector
                id="right-select"
                ref={rightSelectRef}
                value={rightId}
                onChange={(v) => { const p = new URLSearchParams(searchParams); p.set('right', v); setSearchParams(p) }}
              />
            </div>
          </div>
        </div>

        {/* Share button */}
        <div className="flex justify-center mb-8">
          <ShareButton leftId={leftId} rightId={rightId} />
        </div>

        {/* Loading state */}
        {loading && skeletons}

        {/* Both selected — show comparison */}
        {!loading && left && right && (
          <div className="space-y-3 animate-compare-fade-in">
            {comparisonStats.map(({ category, rows }) => (
              <div key={category} className="compare-table-panel rounded-2xl border border-white/10 overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-black/30">
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-4 rounded-full" style={{ background: `linear-gradient(to bottom, ${leftColor}, ${rightColor})` }} />
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-300">{category}</h2>
                  </div>
                  <div className="ml-auto flex items-center gap-3 text-[10px] text-gray-600">
                    <span style={{ color: leftColor }}>{left.anime}</span>
                    <span>vs</span>
                    <span style={{ color: rightColor }}>{right.anime}</span>
                  </div>
                </div>
                <div>
                  {rows.map((row, i) => (
                    <CompareRow
                      key={row.label}
                      label={row.label}
                      left={row.left}
                      right={row.right}
                      leftAnime={left.anime}
                      rightAnime={right.anime}
                      index={i}
                      leftColor={leftColor}
                      rightColor={rightColor}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Full analysis CTAs */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                to={`/universe/${left.id}`}
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all hover:opacity-90 active:scale-95"
                style={{ background: `${leftColor}22`, border: `1px solid ${leftColor}40`, color: leftColor }}
              >
                Full {left.anime} Analysis
              </Link>
              <Link
                to={`/universe/${right.id}`}
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all hover:opacity-90 active:scale-95"
                style={{ background: `${rightColor}22`, border: `1px solid ${rightColor}40`, color: rightColor }}
              >
                Full {right.anime} Analysis
              </Link>
            </div>
          </div>
        )}

        {/* Empty state — show trending comparisons */}
        {!loading && !left && !right && (
          <div className="animate-compare-fade-in">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-600 text-center mb-5">Trending Comparisons</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { left: 'one-punch-man', right: 'jjk', label: 'Pure Power vs Power System' },
                { left: 'aot', right: 'one-piece', label: 'Faction Warfare vs Political Economy' },
                { left: 'hunter-x-hunter', right: 'naruto', label: 'Nen vs Chakra' },
                { left: 'solo-leveling', right: 'demon-slayer', label: 'Solo Grind vs Team Hierarchy' },
                { left: 'dragonballz', right: 'one-punch-man', label: 'Zenkai Boost vs Limiter Removal' },
                { left: 'death-note', right: 'code-geass', label: 'Mind Control vs Kira Justice' },
              ].map(({ left, right, label }) => {
                const leftU = UNIVERSE_CATALOG_MAP[left]
                const rightU = UNIVERSE_CATALOG_MAP[right]
                if (!leftU || !rightU) return null
                return (
                  <button
                    key={`${left}-${right}`}
                    onClick={() => {
                      const p = new URLSearchParams()
                      p.set('left', left)
                      p.set('right', right)
                      setSearchParams(p)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="group flex flex-col gap-2 p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-cyan-400/30 transition-all text-left"
                  >
                    <div className="flex items-center gap-2">
                      <img src={leftU.animeImageUrl} alt={leftU.anime} className="w-10 h-10 rounded-lg object-cover shrink-0" loading="lazy" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-white truncate">{leftU.anime}</p>
                        <p className="text-[9px] text-gray-600">{leftU.stats?.characters || 10}+ characters</p>
                      </div>
                      <span className="shrink-0 text-[9px] text-gray-700 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                        vs
                      </span>
                      <div className="flex-1 min-w-0 text-right">
                        <p className="text-[10px] font-bold text-white truncate">{rightU.anime}</p>
                        <p className="text-[9px] text-gray-600">{rightU.stats?.characters || 10}+ characters</p>
                      </div>
                      <img src={rightU.animeImageUrl} alt={rightU.anime} className="w-10 h-10 rounded-lg object-cover shrink-0" loading="lazy" />
                    </div>
                    <p className="text-[9px] text-gray-600 group-hover:text-cyan-400/70 transition-colors">{label}</p>
                  </button>
                )
              })}
            </div>
            <p className="text-[9px] text-gray-700 text-center mt-5">Or pick any two universes from the dropdowns above</p>
          </div>
        )}

        {/* One selected */}
        {!loading && (left || right) && !(left && right) && (
          <div className="text-center py-16">
            <p className="text-[11px] uppercase tracking-widest text-gray-600">
              {left ? 'Select a right universe to compare' : 'Select a left universe to compare'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
