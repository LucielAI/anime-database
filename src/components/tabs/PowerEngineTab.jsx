import { useState } from 'react'
import SeverityBadge from '../SeverityBadge'
import { Zap, Cpu, Activity, Box, Hexagon, Swords, Globe, Shield, HelpCircle } from 'lucide-react'

const ICON_MAP = { Zap, Cpu, Activity, Box, Hexagon, Swords, Globe, Shield, HelpCircle }

const HoverCard = ({ children, className, hoverGlow }) => {
  const [isHovered, setIsHovered] = useState(false)
  return (
    <div
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ boxShadow: isHovered ? `0 0 24px ${hoverGlow}` : 'none' }}
    >
      {children}
    </div>
  )
}

function getIcon(iconName) {
  const IconComponent = ICON_MAP[iconName]
  return IconComponent ? <IconComponent className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />
}

export default function PowerEngineTab({ data, isSystemMode, theme }) {
  const [expandedCounterplay, setExpandedCounterplay] = useState(true)
  const powerSystem = data?.powerSystem || []
  const counterplay = data?.counterplay || []
  const rankings = data?.rankings

  if (powerSystem.length === 0) {
    return (
      <div className="text-center text-gray-600 text-sm font-mono py-12">
        [ POWER ENGINE — AWAITING DATA ]
      </div>
    )
  }

  return (
    <div className="space-y-8 font-mono animate-fade-in">
      <section aria-labelledby="power-system-heading">
        <h2 id="power-system-heading" className="text-sm md:text-base font-bold tracking-[0.2em] uppercase text-white mb-2">Power System</h2>
        <p className="text-xs text-gray-500 leading-relaxed mb-5">
          This section maps the core mechanics that generate advantages in this universe. Read each entry as a rule-bearing subsystem: what it enables, what it costs, and where it creates strategic leverage.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {powerSystem.map((power, idx) => (
          <HoverCard
            key={idx}
            hoverGlow={isSystemMode ? theme.modeGlow : theme.glow}
            className="bg-white/5 backdrop-blur-sm border rounded-xl overflow-hidden hover:-translate-y-1 transition-all duration-300 group hover:bg-white/10 active:bg-white/15 cursor-default [@media(hover:none)]:transform-none"
          >
            <div className="p-6 h-full flex flex-col border-l-4" style={{ borderLeftColor: isSystemMode ? theme.secondary : theme.primary }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: `${isSystemMode ? theme.secondary : theme.primary}20`, color: isSystemMode ? theme.secondary : theme.primary }}>
                  {getIcon(power.icon)}
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider leading-tight break-words">{power.name}</h2>
                  <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase" style={{ color: isSystemMode ? theme.secondary : theme.primary }}>{isSystemMode ? (power.systemSubtitle || power.subtitle) : (power.loreSubtitle || power.name)}</span>
                </div>
              </div>

              <p className="text-xs md:text-sm text-gray-300 leading-relaxed mb-6 flex-grow">
                {isSystemMode ? power.systemDesc : power.loreDesc}
              </p>

              {power.signatureMoment && (
                <div className="pt-4 border-t border-white/10 mt-auto opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-[8px] md:text-[10px] text-white/50 uppercase tracking-widest block mb-1">SIGNATURE MOMENT</span>
                  <p className="text-[10px] md:text-xs text-gray-400 italic">&ldquo;{power.signatureMoment}&rdquo;</p>
                </div>
              )}
            </div>
          </HoverCard>
        ))}
        </div>
      </section>

      {/* Rankings/Tiers Section */}
      {rankings && (
        <section aria-labelledby="rankings-heading">
          <h2 id="rankings-heading" className="text-sm md:text-base font-bold tracking-[0.2em] uppercase text-white mb-2">Rankings</h2>
          <p className="text-xs text-gray-500 leading-relaxed mb-5">
            Rankings summarize how authority or combat priority is distributed. Use it to understand what the top tier can do, which constraints still apply, and how lower tiers remain relevant.
          </p>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 md:p-8" style={{ background: `radial-gradient(ellipse at top left, ${theme.glow} 0%, transparent 60%)` }}>
          <h2 className="text-lg md:text-xl font-bold mb-8 text-center tracking-[0.2em] text-gray-400 uppercase">
            {isSystemMode ? rankings.systemName : (rankings.loreName || rankings.systemName)}
          </h2>

          <div className="flex flex-col gap-4">
            <div className="p-6 border rounded-lg" style={{ backgroundColor: theme.badgeBg, borderColor: theme.badgeBg }}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <h3 className="text-xl md:text-2xl font-bold uppercase" style={{ color: theme.badgeText }}>{rankings.topTierName}</h3>
                <div className="px-3 py-1 text-[10px] font-bold tracking-widest rounded" style={{ backgroundColor: theme.badgeBg, color: theme.badgeText, boxShadow: `0 0 10px ${theme.badgeBg}` }}>{isSystemMode ? 'ABSOLUTE AUTHORITY' : 'HIGHEST RANK'}</div>
              </div>
              <p className="text-xs md:text-sm" style={{ color: theme.badgeText, opacity: 0.8 }}>
                {isSystemMode ? rankings.topTierSystem : rankings.topTierLore}
              </p>
            </div>

            {rankings.tiers?.map((tier, idx) => (
              <div key={idx} className="p-4 border border-white/10 rounded-lg bg-black/20 flex flex-col md:flex-row gap-4 md:items-center hover:bg-white/5 transition-colors">
                <div className="md:w-1/4 text-sm md:text-base font-bold text-gray-300 uppercase tracking-wider">{tier.name}</div>
                <div className="md:w-3/4 text-xs md:text-sm text-gray-500">
                  {isSystemMode ? tier.systemDesc : tier.loreDesc}
                </div>
              </div>
            ))}
          </div>
        </div>
        </section>
      )}

      {/* Counterplay section */}
      {counterplay.length > 0 && (
        <section aria-labelledby="counterplay-heading">
          <h2 id="counterplay-heading" className="text-sm md:text-base font-bold tracking-[0.2em] uppercase text-white mb-2">Counterplay</h2>
          <p className="text-xs text-gray-500 leading-relaxed mb-4">
            Counterplay entries explain practical interaction logic: which tools answer which threats and why specific matchups swing toward one side.
          </p>
        <div>
          <button
            onClick={() => setExpandedCounterplay(!expandedCounterplay)}
            className="text-xs tracking-widest text-gray-500 hover:text-gray-300 transition-colors mb-3 flex items-center gap-2"
          >
            <span>{isSystemMode ? '// TACTICAL COUNTERPLAY LOG' : '// COMBAT MATCHUPS'}</span>
            <span className="text-[10px]">{expandedCounterplay ? '▼' : '▶'}</span>
          </button>
          {expandedCounterplay && (
            <div className="space-y-2">
              {counterplay.map((cp, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5">
                  <span className="text-xs font-bold text-amber-400">[ATTACK] {cp.attacker}</span>
                  <span className="text-gray-600 text-xs">&rarr;&rarr;&rarr;</span>
                  <span className="text-xs font-bold text-red-400">[COUNTER] {cp.defender}</span>
                  <span className="text-[10px] text-gray-500 ml-auto hidden sm:block">{cp.mechanic}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        </section>
      )}
    </div>
  )
}
