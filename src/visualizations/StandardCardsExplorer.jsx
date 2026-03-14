import { useState } from 'react'
import ImageWithFallback from '../components/ImageWithFallback'
import DangerBar from '../components/DangerBar'
import { User, Sword, Swords, Shield, Flame, Zap, Skull, Eye, Star, Brain, Copy, Crosshair, Hexagon, Wifi, Globe, Cpu, Activity, Box } from 'lucide-react'

const ICON_MAP = { User, Sword, Swords, Shield, Flame, Zap, Skull, Eye, Star, Brain, Copy, Crosshair, Hexagon, Wifi, Globe, Cpu, Activity, Box }

function getIcon(iconName) {
  return ICON_MAP[iconName] || User
}

export default function StandardCardsExplorer({ characters = [], isSystemMode, theme }) {
  const [expanded, setExpanded] = useState(null)

  if (characters.length === 0) {
    return (
      <div className="text-center text-gray-600 text-sm font-mono py-12">
        [ NO CHARACTER DATA ]
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {characters.map((char, i) => {
        const Icon = getIcon(char.icon)
        const isExpanded = expanded === i
        return (
          <div
            key={char.name}
            className="rounded-lg overflow-hidden border border-white/10 hover:border-white/20 transition-all cursor-pointer"
            style={{ background: '#0a0a14' }}
            onClick={() => setExpanded(isExpanded ? null : i)}
          >
            <div className="aspect-[2/3] relative overflow-hidden">
              <ImageWithFallback
                src={char.imageUrl}
                alt={`${char.name} portrait — ${char.title} in ${isSystemMode ? "system" : "lore"} view`}
                fallbackIcon={Icon}
                gradientFrom={char.gradientFrom || 'gray-900'}
                gradientTo={char.gradientTo || 'gray-950'}
                accentColor={char.accentColor || 'cyan-400'}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                <h3 className="text-sm font-bold font-mono leading-tight break-words" style={{ color: theme?.accent || '#22d3ee' }}>
                  {char.name}
                </h3>
                <p className="text-[10px] text-gray-300 leading-snug line-clamp-2">{char.title}</p>
              </div>
            </div>
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
                <span>RANK: {char.rank}</span>
                <span>DNG: {char.dangerLevel}/10</span>
              </div>
              <DangerBar level={char.dangerLevel || 0} />
              {isExpanded && (
                <p className="text-xs text-gray-400 mt-2 font-mono leading-relaxed">
                  {isSystemMode ? char.systemBio : char.loreBio}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
