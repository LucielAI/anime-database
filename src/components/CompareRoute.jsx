import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { UNIVERSE_CATALOG, UNIVERSE_CATALOG_MAP } from '../data/index.js'
import SeoHead from './SeoHead'
import { getClassificationLabel } from '../utils/getClassificationLabel'
import { buildCatalogStructuredData, SITE_NAME, SITE_URL } from '../utils/seo'
import { ArrowLeft, ArrowRight, Scale, Zap, Users, Shield, GitBranch, AlertTriangle } from 'lucide-react'

function getCompareStats(left, right) {
  if (!left || !right) return []
  return [
    {
      category: 'System',
      icon: <Zap className="w-3 h-3" />,
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
      icon: <Shield className="w-3 h-3" />,
      rows: [
        { label: 'Power System', left: left.powerSystem?.[0]?.name || 'N/A', right: right.powerSystem?.[0]?.name || 'N/A' },
        { label: 'Combat Style', left: left.combatStyle || 'Standard', right: right.combatStyle || 'Standard' },
        { label: 'System Complexity', left: left.systemComplexity || 'Medium', right: right.systemComplexity || 'Medium' },
      ],
    },
    {
      category: 'World',
      icon: <GitBranch className="w-3 h-3" />,
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
  return (
    <tr className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
      <td className="px-3 py-2.5 text-[10px] uppercase tracking-[0.14em] text-gray-500 bg-black/20 w-36 align-top">{label}</td>
      <td className="px-3 py-2.5 text-[11px] text-gray-200 align-top">
        <span className={same ? 'text-gray-500' : 'text-cyan-200'}>{leftVal}</span>
      </td>
      <td className="px-3 py-2.5 text-[11px] text-gray-200 border-l border-white/10 align-top">
        <span className={same ? 'text-gray-500' : 'text-cyan-200'}>{rightVal}</span>
      </td>
    </tr>
  )
}

export default function CompareRoute() {
  const [searchParams] = useSearchParams()
  const leftId = searchParams.get('left') || UNIVERSE_CATALOG[0]?.id || ''
  const rightId = searchParams.get('right') || UNIVERSE_CATALOG[1]?.id || ''

  const left = leftId ? UNIVERSE_CATALOG_MAP[leftId] : null
  const right = rightId ? UNIVERSE_CATALOG_MAP[rightId] : null

  const comparisonStats = useMemo(() => getCompareStats(left, right), [left, right])

  const seo = {
    title: left && right
      ? `${left.anime} vs ${right.anime} — System Comparison | ${SITE_NAME}`
      : `Universe Comparison | ${SITE_NAME}`,
    description: left && right
      ? `Compare ${left.anime} and ${right.anime} side-by-side. Power systems, factions, combat mechanics, and structural analysis.`
      : `Compare anime universe systems side-by-side.`,
    canonicalUrl: `${SITE_URL}/compare?left=${leftId}&right=${rightId}`,
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white font-mono">
      <SeoHead {...seo} />
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-gray-400 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-3 h-3" /> Back to Archive
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Scale className="w-5 h-5 text-cyan-400" />
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">System Comparison</h1>
          </div>
          <p className="text-xs text-gray-400">Compare anime universes as structured systems — power mechanics, factions, combat rules, and world logic.</p>
        </div>

        {/* Universe Selector */}
        <div className="grid grid-cols-2 gap-3 mb-8 p-4 rounded-xl border border-white/10 bg-white/5">
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2 block">Left Universe</label>
            <select
              value={leftId}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams)
                params.set('left', e.target.value)
                window.location.search = params.toString()
              }}
              className="w-full h-10 rounded-lg border border-white/10 bg-black/40 px-3 text-xs text-gray-200 cursor-pointer"
            >
              {UNIVERSE_CATALOG.map((u) => (
                <option key={u.id} value={u.id}>{u.anime}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2 block">Right Universe</label>
            <select
              value={rightId}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams)
                params.set('right', e.target.value)
                window.location.search = params.toString()
              }}
              className="w-full h-10 rounded-lg border border-white/10 bg-black/40 px-3 text-xs text-gray-200 cursor-pointer"
            >
              {UNIVERSE_CATALOG.map((u) => (
                <option key={u.id} value={u.id}>{u.anime}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Links to Both Universes */}
        {left && right && (
          <div className="grid grid-cols-2 gap-3 mb-8">
            <Link
              to={`/universe/${left.id}`}
              className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-gray-500 mb-1">{left.anime}</p>
                <p className="text-xs font-bold text-white">{left.tagline?.slice(0, 60)}…</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-500" />
            </Link>
            <Link
              to={`/universe/${right.id}`}
              className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-gray-500 mb-1">{right.anime}</p>
                <p className="text-xs font-bold text-white">{right.tagline?.slice(0, 60)}…</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-500" />
            </Link>
          </div>
        )}

        {/* Comparison Tables */}
        {left && right ? (
          <div className="space-y-6">
            {comparisonStats.map(({ category, icon, rows }) => (
              <div key={category} className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-black/20">
                  <span className="text-cyan-400">{icon}</span>
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">{category}</h2>
                </div>
                <table className="w-full">
                  <tbody>
                    {rows.map((row) => (
                      <CompareRow key={row.label} {...row} />
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

            {/* CTA */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Link
                to={`/universe/${left.id}`}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-400 text-[#020617] font-bold text-[10px] tracking-[0.2em] uppercase hover:bg-cyan-300 transition-colors"
              >
                Full {left.anime} Analysis →
              </Link>
              <Link
                to={`/universe/${right.id}`}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-400 text-[#020617] font-bold text-[10px] tracking-[0.2em] uppercase hover:bg-cyan-300 transition-colors"
              >
                Full {right.anime} Analysis →
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <p className="text-xs uppercase tracking-widest">Select two universes to compare</p>
          </div>
        )}

        {/* Footer note */}
        <div className="mt-10 pt-6 border-t border-white/5 text-center">
          <p className="text-[10px] text-gray-600 tracking-wider">
            Analysis based on publicly known lore. Not affiliated with any anime studio or creator.
          </p>
        </div>
      </div>
    </div>
  )
}
