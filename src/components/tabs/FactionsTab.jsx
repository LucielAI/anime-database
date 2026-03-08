import { useState } from 'react'
import * as Icons from 'lucide-react'

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
  const IconComponent = Icons[iconName]
  return IconComponent ? <IconComponent className="w-5 h-5" /> : <Icons.HelpCircle className="w-5 h-5" />
}

export default function FactionsTab({ data, isSystemMode, theme }) {
  const factions = data?.factions || []

  if (factions.length === 0) {
    return (
      <div className="text-center text-gray-600 text-sm font-mono py-12">
        [ FACTIONS — AWAITING DATA ]
      </div>
    )
  }

  const roleColors = {
    antagonist: theme?.accent || '#f59e0b',
    protagonist: theme?.secondary || '#8b5cf6',
    neutral: theme?.primary || '#22d3ee',
    chaotic: theme?.accent || '#f59e0b',
  }

  return (
    <div className="animate-fade-in font-mono">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {factions.map((faction, idx) => {
          const color = roleColors[faction.role] || theme?.primary || '#22d3ee'
          const glow = faction.role === 'antagonist' || faction.role === 'chaotic' ? theme?.badgeBg : theme?.glow

          return (
            <HoverCard
              key={idx}
              hoverGlow={glow}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:-translate-y-1 transition-all duration-300 hover:bg-white/10 active:bg-white/15 [@media(hover:none)]:transform-none"
            >
              <div className="p-6 md:p-8 flex flex-col items-start h-full" style={{ borderLeft: `4px solid ${color}` }}>
                <div className="flex w-full items-start justify-between mb-4">
                  <div className="p-3 rounded-full hidden sm:block shrink-0" style={{ backgroundColor: `${color}20`, color }}>
                    {getIcon(faction.icon)}
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-auto">
                    <div className="px-2 py-1 text-[8px] md:text-[10px] font-bold tracking-widest rounded border uppercase" style={{ backgroundColor: `${color}20`, color, borderColor: `${color}50` }}>
                      {faction.role}
                    </div>
                    {faction.memberCount && (
                      <div className="text-[8px] md:text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase flex items-center gap-1">
                        <Icons.Users className="w-3 h-3" />
                        EST: <span className="text-white">{faction.memberCount}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-full flex-grow">
                  <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider mb-3 truncate">{faction.name}</h2>
                  <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
                    {isSystemMode ? faction.systemDesc : faction.loreDesc}
                  </p>
                </div>
              </div>
            </HoverCard>
          )
        })}
      </div>
    </div>
  )
}
