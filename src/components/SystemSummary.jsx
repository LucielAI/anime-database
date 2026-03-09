import { useMemo } from 'react'
import { Terminal, Zap, Scale, AlertTriangle, Clock, Shield } from 'lucide-react'
import { deriveBullets } from '../utils/deriveBullets'

const getCategoryIcon = (category) => {
  switch (category) {
    case 'ENGINE': return <Zap className="w-2.5 h-2.5" />
    case 'LAW': return <Scale className="w-2.5 h-2.5" />
    case 'EXCEPTION': return <AlertTriangle className="w-2.5 h-2.5" />
    case 'CAUSALITY BOUND': return <Clock className="w-2.5 h-2.5" />
    case 'HIERARCHY': return <Shield className="w-2.5 h-2.5" />
    default: return null
  }
}

export default function SystemSummary({ data, isSystemMode, theme, revealStep, isRevealing }) {
  const bullets = useMemo(() => deriveBullets(data), [data])
  const accentColor = isSystemMode ? (theme?.secondary || '#22d3ee') : (theme?.primary || '#8b5cf6')

  if (!bullets || bullets.length === 0) return null

  return (
    <div className="w-full max-w-6xl mx-auto px-6 mb-8 mt-6">
      <div className={`p-5 md:p-6 rounded-xl border border-white/5 bg-[#0a0a10] relative overflow-hidden transition-all duration-300 ${isSystemMode ? 'sys-mode-container' : ''}`}>
        
        {/* Subtle decorative background piece */}
        <div 
          className="absolute right-0 top-0 w-64 h-64 opacity-[0.04] pointer-events-none rounded-full blur-3xl transition-colors duration-500"
          style={{ backgroundColor: accentColor }}
        />

        <div className="flex items-center gap-2 mb-4">
          <Terminal className="w-4 h-4 text-gray-500" style={{ color: accentColor }} />
          <h2 className={`text-[11px] uppercase tracking-[0.25em] font-bold transition-all duration-500 ${isRevealing && revealStep >= 1 ? 'text-white text-shadow-glow' : 'text-gray-300'}`}>
            {isSystemMode ? '// SYSTEM ARCHITECTURE' : 'THE CORE SYSTEM'}
          </h2>
        </div>

        <ul className="space-y-3 relative z-10">
          {bullets.map((bullet, index) => {
            const textContent = isSystemMode ? bullet.sys : bullet.lore
            
            const isHidden = isRevealing && revealStep < 2
            const delay = isRevealing ? `${index * 150}ms` : '0ms'

            return (
              <li 
                key={bullet.id} 
                className={`flex items-start gap-3 group transition-all duration-700 ease-out transform ${isHidden ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
                style={{ transitionDelay: delay }}
              >
                <span 
                  className={`mt-1.5 w-1.5 h-1.5 shrink-0 rounded-sm opacity-50 group-hover:opacity-100 transition-all duration-300 ${isRevealing && revealStep === 2 ? 'animate-pulse' : ''}`}
                  style={{ backgroundColor: accentColor, boxShadow: isRevealing && revealStep === 2 ? `0 0 10px ${accentColor}` : 'none' }}
                />
                <p className="text-xs md:text-sm text-gray-400 group-hover:text-gray-200 transition-colors leading-relaxed">
                  <span 
                    className="inline-flex items-center gap-1 font-bold text-[10px] tracking-wider uppercase mr-2 px-1.5 py-0.5 rounded opacity-70 border border-white/10"
                    style={{ color: accentColor, backgroundColor: `${accentColor}10` }}
                  >
                    {getCategoryIcon(bullet.category)}
                    {bullet.category}
                  </span>
                  <span className={`${isRevealing && revealStep === 2 ? 'text-white' : ''} transition-colors duration-700`}>
                    {textContent}
                  </span>
                </p>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
