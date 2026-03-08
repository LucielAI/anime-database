import { useState } from 'react'
import SeverityBadge from '../SeverityBadge'
import { AlertTriangle } from 'lucide-react'

const TIMELINE_BADGE_COLORS = {
  'Ancient Past': { bg: 'rgba(107,114,128,0.2)', text: '#6b7280' },
  'Pre-Narrative': { bg: 'rgba(245,158,11,0.2)', text: '#f59e0b' },
  'Mid-Narrative': { bg: 'rgba(34,211,238,0.2)', text: '#22d3ee' },
  'Final Arc': { bg: 'rgba(239,68,68,0.2)', text: '#ef4444' },
}

export default function CoreLawsTab({ data, isSystemMode, theme }) {
  const [expandedCausal, setExpandedCausal] = useState(false)
  const rules = data?.rules || []
  const causalEvents = data?.causalEvents || []
  const anomalies = data?.anomalies || []

  if (rules.length === 0 && causalEvents.length === 0) {
    return (
      <div className="text-center text-gray-600 text-sm font-mono py-12">
        [ CORE LAWS — AWAITING DATA ]
      </div>
    )
  }

  return (
    <div className="space-y-6 font-mono animate-fade-in">
      {/* Rules */}
      {rules.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          {rules.map((rule, idx) => (
            <div key={idx} className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 rounded-xl p-6 md:p-8 transition-colors duration-300">
              <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6 pb-6 border-b border-white/10">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-white mb-2">{rule.name}</h2>
                  {rule.subtitle && <span className="text-[10px] md:text-xs font-bold tracking-widest text-gray-400 uppercase">{rule.subtitle}</span>}
                </div>
                {rule.severity && <SeverityBadge severity={rule.severity} />}
              </div>

              <div className="flex flex-col gap-2">
                <span
                  className="text-[10px] font-bold tracking-[0.2em] uppercase"
                  style={{ color: isSystemMode ? theme?.secondary : theme?.primary }}
                >
                  {isSystemMode ? 'SYSTEM EXCEPTION' : 'LORE CONSEQUENCE'}
                </span>
                <p className="text-sm md:text-lg text-gray-300 leading-relaxed font-light">
                  {isSystemMode ? (rule.systemEquivalent || rule.systemDesc) : (rule.loreConsequence || rule.loreDesc)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Anomalies */}
      {anomalies.length > 0 && (
        <div className="mt-16 pt-8 border-t border-dashed" style={{ borderColor: `${theme?.accent || '#f59e0b'}50` }}>
          <div className="flex items-center gap-2 mb-8 justify-center">
            <AlertTriangle className="w-5 h-5 animate-pulse" style={{ color: theme?.accent }} />
            <span className="font-bold tracking-[0.2em] text-xs md:text-sm uppercase" style={{ color: theme?.accent }}>Known System Anomalies</span>
            <AlertTriangle className="w-5 h-5 animate-pulse" style={{ color: theme?.accent }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {anomalies.map((anom, idx) => (
              <div key={idx} className="p-6 border rounded-lg" style={{ borderColor: `${theme?.accent}40`, backgroundColor: `${theme?.accent}10` }}>
                <h3 className="text-lg md:text-xl font-bold text-white mb-1 uppercase truncate">{anom.name}</h3>
                <p className="text-[10px] md:text-xs mb-4 tracking-wider" style={{ color: theme?.accent }}>VIOLATION: {(anom.ruleViolated || '').toUpperCase()}</p>
                <p className="text-xs md:text-sm text-gray-400">
                  {isSystemMode ? anom.systemDesc : anom.loreDesc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Causal Events */}
      {causalEvents.length > 0 && (
        <div>
          <button
            onClick={() => setExpandedCausal(!expandedCausal)}
            className="text-xs tracking-widest text-gray-500 hover:text-gray-300 transition-colors mb-3 flex items-center gap-2"
          >
            <span>// CAUSAL EVENT MATRIX</span>
            <span className="text-[10px]">{expandedCausal ? '▼' : '▶'}</span>
          </button>
          {expandedCausal && (
            <div className="overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="text-gray-600 border-b border-white/10">
                    <th className="text-left py-2 pr-3">EVENT</th>
                    <th className="text-left py-2 px-3">TIMELINE</th>
                    <th className="text-left py-2 px-3 hidden sm:table-cell">TRIGGER</th>
                    <th className="text-left py-2 px-3">CONSEQUENCE</th>
                  </tr>
                </thead>
                <tbody>
                  {causalEvents.map((evt, i) => {
                    const tpKey = Object.keys(TIMELINE_BADGE_COLORS).find(k => evt.timelinePosition?.includes(k)) || 'Mid-Narrative'
                    const badge = TIMELINE_BADGE_COLORS[tpKey]
                    return (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-2 pr-3 text-gray-300">{evt.name}</td>
                        <td className="py-2 px-3">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold whitespace-nowrap" style={{ backgroundColor: badge.bg, color: badge.text }}>
                            {evt.timelinePosition}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-gray-500 hidden sm:table-cell">{evt.trigger}</td>
                        <td className="py-2 px-3 text-gray-500">{evt.consequence}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
