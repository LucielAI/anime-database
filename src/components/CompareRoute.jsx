import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { UNIVERSE_CATALOG, UNIVERSE_CATALOG_MAP, loadUniverseBySlug } from '../data/index.js'
import SeoHead from './SeoHead'
import { getClassificationLabel } from '../utils/getClassificationLabel'
import { SITE_NAME, SITE_URL } from '../utils/seo'
import { ArrowLeft, Scale, Zap, Users, Shield, GitBranch, ArrowRight, ArrowUpDown, Share2, Check } from 'lucide-react'
import './CompareRoute.css'

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

// Skeleton loaders matching page layout
function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded bg-white/[0.04] ${className}`}
      aria-hidden="true"
    />
  )
}

function SkeletonTableBlock() {
  const rows = [1, 2, 3, 4]
  return (
    <div className="rounded-2xl overflow-hidden animate-compare-slide-up">
      <div className="flex items-center gap-3 px-5 py-4 bg-black/20 border-b border-white/10">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className="h-1.5 w-10" />
        </div>
      </div>
      <div className="px-5 py-3 space-y-0">
        {rows.map((i) => (
          <div key={i} className="flex items-center gap-4 py-3 border-b border-white/[0.04] last:border-0">
            <Skeleton className="h-2 w-24 shrink-0" />
            <Skeleton className="h-2 flex-1" />
            <Skeleton className="h-2 w-20 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

function SkeletonSelectorBlock() {
  return (
    <div className="rounded-2xl p-5 animate-compare-slide-up">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <Skeleton className="h-2 w-20" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-2 w-20" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}

// Swap button
function SwapButton({ onSwap, disabled }) {
  return (
    <button
      onClick={onSwap}
      disabled={disabled}
      aria-label="Swap universes"
      title="Swap universes (S)"
      className={`flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-200 cursor-pointer ${
        disabled
          ? 'border-white/5 bg-black/20 text-gray-700 cursor-not-allowed'
          : 'border-white/10 bg-black/40 text-gray-500 hover:text-cyan-400 hover:border-cyan-400/30 hover:bg-cyan-400/10 active:scale-95'
      }`}
    >
      <ArrowUpDown className="w-4 h-4" />
    </button>
  )
}

// Share button
function ShareButton({ leftId, rightId }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = `${window.location.origin}/compare?left=${leftId}&right=${rightId}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for environments without clipboard API
      window.history.replaceState({}, '', `/compare?left=${leftId}&right=${rightId}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleShare}
      aria-label="Share this comparison"
      title="Copy comparison link"
      className={`flex items-center gap-1.5 h-9 px-3 rounded-xl border text-[10px] tracking-[0.08em] uppercase font-bold transition-all duration-200 cursor-pointer ${
        copied
          ? 'border-green-400/40 bg-green-400/10 text-green-400'
          : 'border-white/10 bg-black/40 text-gray-500 hover:text-cyan-400 hover:border-cyan-400/30 hover:bg-cyan-400/10 active:scale-95'
      }`}
    >
      {copied ? (
        <>
          <Check className="w-3 h-3" />
          Copied
        </>
      ) : (
        <>
          <Share2 className="w-3 h-3" />
          Share
        </>
      )}
    </button>
  )
}

function CompareRow({ label, left, right, index }) {
  const leftVal = String(left ?? '—')
  const rightVal = String(right ?? '—')
  const same = leftVal === rightVal
  return (
    <div
      className="compare-table-row flex flex-col sm:flex-row sm:items-center hover:bg-cyan-400/[0.03] transition-colors duration-150 cursor-default"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="compare-label px-4 py-3 w-full sm:w-40 shrink-0 bg-black/30">{label}</div>
      <div className="flex sm:hidden px-4 py-2 text-[11px] text-gray-500 bg-black/20">{leftVal}</div>
      <div className="hidden sm:flex px-4 py-3 flex-1 compare-cell-left items-center">
        <span className={same ? 'compare-value-same' : 'compare-value-diff'}>{leftVal}</span>
      </div>
      <div className="hidden sm:flex px-4 py-3 flex-1 items-center">
        <span className={same ? 'compare-value-same' : 'compare-value-diff'}>{rightVal}</span>
      </div>
    </div>
  )
}

export default function CompareRoute() {
  const [searchParams, setSearchParams] = useSearchParams()
  // Support both ?left=slug&right=slug and ?a=slug&b=slug URL formats
  const leftId = searchParams.get('left') || searchParams.get('a') || ''
  const rightId = searchParams.get('right') || searchParams.get('b') || ''

  const [leftData, setLeftData] = useState(null)
  const [rightData, setRightData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dataVisible, setDataVisible] = useState(false)
  const [focusedSelect, setFocusedSelect] = useState(null) // 'left' | 'right' | null
  const leftSelectRef = useRef(null)
  const rightSelectRef = useRef(null)

  // Update page title when universes change (URL deep-linking)
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

  // Load actual universe core payloads (not just catalog metadata)
  useEffect(() => {
    if (!leftId && !rightId) return
    setLoading(true)
    setDataVisible(false)
    Promise.all([
      leftId ? loadUniverseBySlug(leftId) : Promise.resolve(null),
      rightId ? loadUniverseBySlug(rightId) : Promise.resolve(null),
    ]).then(([l, r]) => {
      setLeftData(l)
      setRightData(r)
      setLoading(false)
      // Trigger entrance animation after data loads
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setDataVisible(true))
      })
    }).catch(() => {
      setLeftData(UNIVERSE_CATALOG_MAP[leftId] || null)
      setRightData(UNIVERSE_CATALOG_MAP[rightId] || null)
      setLoading(false)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setDataVisible(true))
      })
    })
  }, [leftId, rightId])

  // Keyboard navigation for universe selectors
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
      setFocusedSelect(side)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      // Confirm selection by keeping current value
      const params = new URLSearchParams(searchParams)
      setSearchParams(params)
      setFocusedSelect(null)
    } else if (e.key === 'Escape') {
      setFocusedSelect(null)
    }
  }, [leftId, rightId, searchParams, setSearchParams])

  // Swap left and right universes
  const handleSwap = useCallback(() => {
    const params = new URLSearchParams(searchParams)
    const currentLeft = params.get('left') || params.get('a') || ''
    const currentRight = params.get('right') || params.get('b') || ''
    if (!currentLeft && !currentRight) return
    if (currentLeft) params.set('right', currentLeft)
    if (currentRight) params.set('left', currentRight)
    // Clean up legacy params
    params.delete('a')
    params.delete('b')
    setSearchParams(params)
  }, [searchParams, setSearchParams])

  // Global keyboard shortcut for swap (S key when no input is focused)
  useEffect(() => {
    const handleGlobalKey = (e) => {
      if (e.key === 's' || e.key === 'S') {
        const tag = document.activeElement?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
        if (leftId || rightId) {
          e.preventDefault()
          handleSwap()
        }
      }
    }
    window.addEventListener('keydown', handleGlobalKey)
    return () => window.removeEventListener('keydown', handleGlobalKey)
  }, [leftId, rightId, handleSwap])

  // Merge catalog preview data with loaded payload data
  const left = leftData ? { ...UNIVERSE_CATALOG_MAP[leftId], ...leftData } : null
  const right = rightData ? { ...UNIVERSE_CATALOG_MAP[rightId], ...rightData } : null

  const comparisonStats = useMemo(() => getCompareStats(left, right), [left, right])

  const seo = {
    title: left?.anime && right?.anime
      ? `${left.anime} vs ${right.anime} — System Comparison | ${SITE_NAME}`
      : (console.warn('[ARCHIVE] CompareRoute OG title fallback: missing anime names', { leftAnime: left?.anime, rightAnime: right?.anime }), `Universe Comparison | ${SITE_NAME}`),
    description: left && right
      ? `Compare ${left.anime} and ${right.anime} side-by-side. Power systems, factions, combat mechanics, and structural analysis.`
      : `Compare anime universe systems side-by-side.`,
    canonicalUrl: `${SITE_URL}/compare?left=${leftId}&right=${rightId}`,
    keywords: 'anime comparison, universe comparison, anime power systems, side-by-side anime analysis',
  }

  const structuredData = left && right ? [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemPage',
      name: `${left.anime} vs ${right.anime} — System Comparison`,
      description: seo.description,
      url: `${SITE_URL}/compare?left=${leftId}&right=${rightId}`,
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: `${SITE_URL}/` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `${left.anime} vs ${right.anime} Universe Comparison`,
      description: `Side-by-side system comparison of ${left.anime} and ${right.anime} power mechanics, factions, and world logic.`,
      numberOfItems: 2,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: `${left.anime} System Analysis`,
          url: `${SITE_URL}/universe/${leftId}`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: `${right.anime} System Analysis`,
          url: `${SITE_URL}/universe/${rightId}`,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Archive Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Compare', item: `${SITE_URL}/compare` },
      ],
    },
  ] : []

  return (
    <div className="min-h-screen bg-[#050508] text-white font-mono">
      <SeoHead {...seo} structuredData={structuredData} />
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="relative mb-10 animate-compare-slide-up">
          <div className="compare-header-glow" />
          <div className="relative z-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-gray-500 hover:text-cyan-400 transition-colors duration-200 mb-6 group"
            >
              <ArrowLeft className="w-3 h-3 transition-transform duration-200 group-hover:-translate-x-1" />
              Back to Archive
            </Link>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20">
                <Scale className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-none">
                  System <span className="text-cyan-400">Comparison</span>
                </h1>
              </div>
            </div>
            <p className="text-xs text-gray-500 max-w-xl leading-relaxed pl-[52px]">
              Compare anime universes as structured systems — power mechanics, factions, combat rules, and world logic.
            </p>
          </div>
        </div>

        {/* Universe Selector */}
        <div className="compare-selector-panel rounded-2xl p-5 mb-8 animate-compare-slide-up animate-compare-delay-1">
          <div className="grid gap-4" style={{ gridTemplateColumns: '1fr auto 1fr' }}>
            <div>
              <label className="compare-selector-label mb-3 block">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
                  Left Universe
                </span>
              </label>
              <select
                ref={leftSelectRef}
                value={leftId}
                onChange={(e) => {
                  const params = new URLSearchParams(searchParams)
                  params.set('left', e.target.value)
                  setSearchParams(params)
                }}
                onKeyDown={(e) => handleSelectKeyDown(e, 'left')}
                onFocus={() => setFocusedSelect('left')}
                onBlur={() => setFocusedSelect(null)}
                className={`compare-select w-full h-11 rounded-xl px-3 text-[11px] transition-colors duration-200 focus:outline-none ${
                  focusedSelect === 'left'
                    ? 'ring-2 ring-cyan-400/30 border-cyan-400/50'
                    : ''
                }`}
              >
                <option value="">— Select —</option>
                {UNIVERSE_CATALOG.map((u) => (
                  <option key={u.id} value={u.id}>{u.anime}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2 items-center justify-end pb-0.5">
              <SwapButton onSwap={handleSwap} disabled={!leftId && !rightId} />
              {leftId && rightId && (
                <div className="animate-compare-slide-up">
                  <ShareButton leftId={leftId} rightId={rightId} />
                </div>
              )}
            </div>

            <div>
              <label className="compare-selector-label mb-3 block">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" />
                  Right Universe
                </span>
              </label>
              <select
                ref={rightSelectRef}
                value={rightId}
                onChange={(e) => {
                  const params = new URLSearchParams(searchParams)
                  params.set('right', e.target.value)
                  setSearchParams(params)
                }}
                onKeyDown={(e) => handleSelectKeyDown(e, 'right')}
                onFocus={() => setFocusedSelect('right')}
                onBlur={() => setFocusedSelect(null)}
                className={`compare-select w-full h-11 rounded-xl px-3 text-[11px] transition-colors duration-200 focus:outline-none ${
                  focusedSelect === 'right'
                    ? 'ring-2 ring-purple-400/30 border-purple-400/50'
                    : ''
                }`}
              >
                <option value="">— Select —</option>
                {UNIVERSE_CATALOG.map((u) => (
                  <option key={u.id} value={u.id}>{u.anime}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Keyboard hint */}
          <div className="mt-3 flex items-center justify-center gap-4">
            <span className="text-[9px] text-gray-700 flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 text-gray-600">↑</kbd>
              <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 text-gray-600">↓</kbd>
              navigate
            </span>
            <span className="text-[9px] text-gray-700 flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 text-gray-600">Enter</kbd>
              confirm
            </span>
            <span className="text-[9px] text-gray-700 flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 text-gray-600">S</kbd>
              swap
            </span>
          </div>
        </div>

        {/* Quick Links to Both Universes */}
        {left && right && (
          <div className="grid grid-cols-2 gap-3 mb-6 animate-compare-slide-up animate-compare-delay-2">
            <Link
              to={`/universe/${left.id}`}
              className="compare-quick-card rounded-xl p-4 flex items-center justify-between group"
            >
              <div className="min-w-0">
                <p className="compare-selector-label mb-1.5 text-purple-400/70">{left.anime}</p>
                <p className="text-[11px] font-semibold text-gray-200 leading-snug line-clamp-2 group-hover:text-white transition-colors duration-200">{left.tagline}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-600 shrink-0 ml-3 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-cyan-400" />
            </Link>
            <Link
              to={`/universe/${right.id}`}
              className="compare-quick-card rounded-xl p-4 flex items-center justify-between group"
            >
              <div className="min-w-0">
                <p className="compare-selector-label mb-1.5 text-cyan-400/70">{right.anime}</p>
                <p className="text-[11px] font-semibold text-gray-200 leading-snug line-clamp-2 group-hover:text-white transition-colors duration-200">{right.tagline}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-600 shrink-0 ml-3 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-cyan-400" />
            </Link>
          </div>
        )}

        <div className="compare-divider mb-5 animate-compare-slide-up animate-compare-delay-2" />

        <p className="text-[10px] text-gray-600 text-center mb-8 leading-relaxed animate-compare-slide-up animate-compare-delay-2">
          Counts reflect the full universe data — characters, factions, rules, relationships, and events mapped in the archive.
        </p>

        {/* Comparison Tables */}
        {loading ? (
          <div className="space-y-5">
            <SkeletonSelectorBlock />
            <SkeletonTableBlock />
            <SkeletonTableBlock />
            <SkeletonTableBlock />
          </div>
        ) : left && right ? (
          <div className="space-y-5">
            {comparisonStats.map(({ category, icon, rows }, catIndex) => (
              <div
                key={category}
                className={`compare-table-panel rounded-2xl overflow-hidden animate-compare-slide-up ${dataVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                style={{ transition: 'opacity 400ms ease, transform 400ms ease', animationDelay: `${(catIndex + 3) * 80}ms` }}
              >
                {/* Category header */}
                <div className="compare-table-category-header flex items-center gap-3 px-5 py-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/20">
                    <span className="text-cyan-400">{icon}</span>
                  </div>
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-200">{category}</h2>
                    <p className="text-[10px] text-gray-600">{rows.length} attributes compared</p>
                  </div>
                </div>

                {/* Column labels (desktop) */}
                <div className="hidden sm:flex border-b border-white/5 bg-black/20">
                  <div className="compare-label px-4 py-2 w-40 shrink-0">Attribute</div>
                  <div className="px-4 py-2 text-[9px] uppercase tracking-[0.2em] text-cyan-400/60 font-bold flex-1">
                    {left.anime}
                  </div>
                  <div className="px-4 py-2 text-[9px] uppercase tracking-[0.2em] text-purple-400/60 font-bold flex-1">
                    {right.anime}
                  </div>
                </div>

                {/* Rows */}
                <div>
                  {rows.map((row, rowIndex) => (
                    <CompareRow key={row.label} {...row} index={rowIndex} />
                  ))}
                </div>
              </div>
            ))}

            {/* CTA */}
            <div className="grid grid-cols-2 gap-3 mt-6 animate-compare-slide-up animate-compare-delay-6">
              <Link
                to={`/universe/${left.id}`}
                className="compare-cta-btn relative overflow-hidden rounded-xl py-3.5 px-4 text-center cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <span className="relative z-10">Full {left.anime} Analysis</span>
                <ArrowRight className="relative z-10 w-3.5 h-3.5" />
              </Link>
              <Link
                to={`/universe/${right.id}`}
                className="compare-cta-btn relative overflow-hidden rounded-xl py-3.5 px-4 text-center cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <span className="relative z-10">Full {right.anime} Analysis</span>
                <ArrowRight className="relative z-10 w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="compare-empty-state rounded-2xl py-20 text-center animate-compare-slide-up animate-compare-delay-3">
            {/* Visual universe grid */}
            <div className="flex items-center justify-center gap-3 mb-6">
              {UNIVERSE_CATALOG.slice(0, 5).map((u, i) => (
                <div
                  key={u.id}
                  className="flex flex-col items-center gap-1.5 animate-compare-slide-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[9px] text-gray-600 uppercase tracking-wider font-bold">
                    {u.anime.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </div>
                  <span className="text-[8px] text-gray-700 uppercase tracking-wider">{u.anime.split(' ')[0]}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center mb-4">
              <Scale className="w-10 h-10 text-gray-700" />
            </div>
            <p className="text-xs uppercase tracking-widest text-gray-600 mb-2">
              Select two universes above
            </p>
            <p className="text-[10px] text-gray-700 leading-relaxed max-w-xs mx-auto">
              Use the dropdowns to pick any two universes, then see them compared side-by-side.
            </p>
          </div>
        )}

        {/* Footer note */}
        <div className="mt-12 pt-6 border-t border-white/5 text-center animate-compare-slide-up animate-compare-delay-6">
          <p className="text-[10px] text-gray-600 tracking-wider">
            Analysis based on publicly known lore. Not affiliated with any anime studio or creator.
          </p>
        </div>
      </div>
    </div>
  )
}
