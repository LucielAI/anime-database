import React, { useState, Suspense } from 'react'
import { getVisualization } from '../../visualizations/registry'
import ErrorBoundary from '../ErrorBoundary'

function renderVisualization(hint, props) {
  const Comp = getVisualization(hint)
  return (
    <Suspense fallback={<div className="w-full h-64 bg-white/5 rounded-xl animate-pulse" />}>
      <Comp {...props} />
    </Suspense>
  )
}

const TYPE_BADGE_COLORS = {
  ally: { bg: 'rgba(34,211,238,0.15)', text: '#22d3ee' },
  enemy: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444' },
  betrayal: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' },
  mirror: { bg: 'rgba(168,85,247,0.15)', text: '#a855f7' },
  mentor: { bg: 'rgba(34,211,238,0.15)', text: '#22d3ee' },
  rival: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' },
  dependent: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6' },
  counter: { bg: 'rgba(16,185,129,0.15)', text: '#10b981' },
  successor: { bg: 'rgba(34,211,238,0.15)', text: '#22d3ee' },
}

export default function EntityDatabaseTab({ data, isSystemMode, theme, revealStep, isRevealing }) {
  const [showRelationships, setShowRelationships] = useState(true)

  const characters = data?.characters || []
  const relationships = data?.relationships || []
  const anomalies = data?.anomalies || []
  const accent = theme?.accent || '#22d3ee'

  const visualizationCaption = {
    'timeline': 'Timeline graph of trigger → consequence chains across major events.',
    'node-graph': 'Relationship graph showing influence, hostility, and dependency between key entities.',
    'counter-tree': 'Counter-tree map of matchup branches and exploit/counter interactions.',
    'affinity-matrix': 'Affinity matrix comparing compatibility and synergy across the core roster.',
    'standard-cards': 'Structured roster cards summarizing key actors and system-relevant traits.'
  }[data?.visualizationHint] || 'Universe entity visualization.'

  return (
    <div className="space-y-6 font-mono">
      <section aria-labelledby="entity-database-heading">
        <h2 id="entity-database-heading" className="text-sm md:text-base font-bold tracking-[0.2em] uppercase text-white mb-2">Entity Database</h2>
        <p className="text-xs text-gray-400 leading-relaxed mb-5">
          The entity graph maps key actors and their links so you can inspect control flow, dependencies, and conflict pressure without needing prior story context.
        </p>
        <p className="text-[11px] text-cyan-200/85 mb-3">
          Start here: inspect how control flows between key actors.
        </p>
      {/* Main visualization */}
      <p className="text-[10px] text-gray-400 mb-3" id="entity-graph-caption">
        {visualizationCaption}
      </p>
      <figure aria-labelledby="entity-database-heading" aria-describedby="entity-graph-caption">
      <ErrorBoundary data={data} isSystemMode={isSystemMode} theme={theme}>
        {renderVisualization(data?.visualizationHint, {
          characters,
          causalEvents: data?.causalEvents || [],
          relationships,
          counterplay: data?.counterplay || [],
          powerSystem: data?.powerSystem || [],
          data,
          isSystemMode,
          theme,
          revealStep,
          isRevealing
        })}
      </ErrorBoundary>
      </figure>
      </section>

      {/* Anomalies section */}
      {anomalies.length > 0 && (
        <section aria-labelledby="entity-anomalies-heading">
          <h3 id="entity-anomalies-heading" className="text-xs tracking-widest text-gray-500 mb-3">{isSystemMode ? '// SYSTEM ANOMALIES' : '// RULE BREAKERS'}</h3>
          <p className="text-[10px] text-gray-600 mb-2">Characters who break the rules of their own universe.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {anomalies.map((a, i) => (
              <div key={i} className="border border-dashed border-red-500/30 rounded-lg p-3" style={{ backgroundColor: 'rgba(239,68,68,0.03)' }}>
                <span className="text-red-400 text-xs font-bold block mb-1" style={{ textShadow: '1px 1px 3px rgba(239,68,68,0.3)' }}>
                  {a.name}
                </span>
                <p className="text-[10px] text-orange-300/70 mb-1">VIOLATION: {a.ruleViolated || a.ruleViolation}</p>
                <p className="text-[10px] text-gray-400">{isSystemMode ? a.systemDesc : a.loreDesc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Relationship Matrix */}
      {relationships.length > 0 && (
        <section aria-labelledby="relationship-matrix-heading">
          <h3 id="relationship-matrix-heading" className="text-xs tracking-widest text-gray-500 mb-2">{isSystemMode ? '// DEPENDENCY GRAPH' : '// RELATIONSHIP MATRIX'}</h3>
          <p className="text-[10px] text-gray-600 mb-3">
            Relationship edges show who influences whom, and where alliances or hostilities can rewire system behavior.
          </p>
          <button
            onClick={() => setShowRelationships(!showRelationships)}
            className="text-xs tracking-widest text-gray-500 hover:text-gray-300 transition-colors mb-3 flex items-center gap-2"
          >
            <span>{isSystemMode ? '// DEPENDENCY GRAPH EDGES' : '// RELATIONSHIP MATRIX'}</span>
            <span className="text-[10px]">{showRelationships ? '▼' : '▶'}</span>
          </button>
          {showRelationships && (
            <div className="overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="text-gray-600 border-b border-white/10">
                    <th className="text-left py-2 pr-3">SOURCE</th>
                    <th className="text-center py-2 px-2">→</th>
                    <th className="text-left py-2 px-3">TARGET</th>
                    <th className="text-left py-2 px-3">TYPE</th>
                    <th className="text-left py-2 px-3">WEIGHT</th>
                    <th className="text-left py-2 px-3 hidden sm:table-cell">DESCRIPTION</th>
                  </tr>
                </thead>
                <tbody>
                  {relationships.map((rel, i) => {
                    const badgeColor = TYPE_BADGE_COLORS[rel.type] || TYPE_BADGE_COLORS.ally
                    return (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-2 pr-3 text-gray-300">{rel.source}</td>
                        <td className="py-2 px-2 text-gray-600 text-center">→</td>
                        <td className="py-2 px-3 text-gray-300">{rel.target}</td>
                        <td className="py-2 px-3">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase" style={{ backgroundColor: badgeColor.bg, color: badgeColor.text }}>
                            {rel.type}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <div className="w-16 bg-white/10 rounded-full h-1 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${(rel.weight || 1) * 10}%`, backgroundColor: accent }} />
                          </div>
                        </td>
                        <td className="py-2 px-3 text-gray-500 hidden sm:table-cell max-w-[200px] truncate">{isSystemMode ? (rel.systemDesc || rel.loreDesc) : rel.loreDesc}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
