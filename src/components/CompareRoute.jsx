import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { UNIVERSE_CATALOG, UNIVERSE_CATALOG_MAP, loadUniverseBySlug } from '../data/index.js'
import SeoHead from './SeoHead'
import { getClassificationLabel } from '../utils/getClassificationLabel'
import { SITE_NAME, SITE_URL } from '../utils/seo'
import { ArrowLeft, Scale, Zap, Users, Shield, GitBranch, ArrowRight } from 'lucide-react'
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

function CompareRow({ label, left, right, index }) {
  const leftVal = String(left ?? '—')
  const rightVal = String(right ?? '—')
  const same = leftVal === rightVal
  return (
    <div
      className="compare-table-row flex flex-col sm:flex-row sm:items-center"
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

  // Load actual universe core payloads (not just catalog metadata)
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
    }).catch(() => {
      setLeftData(UNIVERSE_CATALOG_MAP[leftId] || null)
      setRightData(UNIVERSE_CATALOG_MAP[rightId] || null)
      setLoading(false)
    })
  }, [leftId, rightId])

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
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="compare-selector-label mb-3 block">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
                  Left Universe
                </span>
              </label>
              <select
                value={leftId}
                onChange={(e) => {
                  const params = new URLSearchParams(searchParams)
                  params.set('left', e.target.value)
                  setSearchParams(params)
                }}
                className="compare-select w-full h-11 rounded-xl px-3 text-[11px]"
              >
                <option value="">— Select —</option>
                {UNIVERSE_CATALOG.map((u) => (
                  <option key={u.id} value={u.id}>{u.anime}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="compare-selector-label mb-3 block">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" />
                  Right Universe
                </span>
              </label>
              <select
                value={rightId}
                onChange={(e) => {
                  const params = new URLSearchParams(searchParams)
                  params.set('right', e.target.value)
                  setSearchParams(params)
                }}
                className="compare-select w-full h-11 rounded-xl px-3 text-[11px]"
              >
                <option value="">— Select —</option>
                {UNIVERSE_CATALOG.map((u) => (
                  <option key={u.id} value={u.id}>{u.anime}</option>
                ))}
              </select>
            </div>
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
                <p className="text-[11px] font-semibold text-gray-200 leading-snug line-clamp-2 group-hover:text-white transition-colors">{left.tagline}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-600 shrink-0 ml-3 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-cyan-400" />
            </Link>
            <Link
              to={`/universe/${right.id}`}
              className="compare-quick-card rounded-xl p-4 flex items-center justify-between group"
            >
              <div className="min-w-0">
                <p className="compare-selector-label mb-1.5 text-cyan-400/70">{right.anime}</p>
                <p className="text-[11px] font-semibold text-gray-200 leading-snug line-clamp-2 group-hover:text-white transition-colors">{right.tagline}</p>
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
          <div className="compare-loading-grid animate-compare-slide-up animate-compare-delay-3">
            {[0,1,2].map(i => <div key={i} className="compare-loading-block" />)}
          </div>
        ) : left && right ? (
          <div className="space-y-5">
            {comparisonStats.map(({ category, icon, rows }, catIndex) => (
              <div
                key={category}
                className="compare-table-panel rounded-2xl overflow-hidden animate-compare-slide-up"
                style={{ animationDelay: `${(catIndex + 3) * 80}ms` }}
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
            <div className="flex items-center justify-center mb-4">
              <Scale className="w-8 h-8 text-gray-700" />
            </div>
            <p className="text-xs uppercase tracking-widest text-gray-600">Select two universes to compare</p>
            <p className="text-[10px] text-gray-700 mt-2">Choose from the dropdowns above to see a side-by-side analysis.</p>
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
