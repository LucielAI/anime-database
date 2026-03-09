import { Link } from 'react-router-dom'
import { ANIME_LIST } from '../data/index'
import { Database, Lock, ArrowRight } from 'lucide-react'



export default function ExploreAnotherUniverse({ currentId, isSystemMode, theme }) {
  const accentColor = isSystemMode ? (theme?.secondary || '#22d3ee') : (theme?.primary || '#8b5cf6')
  
  // Filter out the current universe
  const liveUniverses = ANIME_LIST.filter(a => a.id !== currentId)

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-16 mt-8 font-mono border-t border-white/5">
      <div className="flex flex-col items-center text-center gap-6">
        
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5" style={{ color: accentColor }} />
          <h2 className="text-sm md:text-base font-bold tracking-[0.2em] uppercase text-white">
            {isSystemMode ? 'ACCESS ADDITIONAL DATABASES' : 'EXPLORE ANOTHER SYSTEM'}
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mt-2">
          {/* Live Links */}
          {liveUniverses.map(anime => {
            const cardAccent = isSystemMode ? (anime.themeColors?.secondary || accentColor) : (anime.themeColors?.primary || accentColor)
            const cardGlow = isSystemMode ? (anime.themeColors?.modeGlow || 'rgba(34,211,238,0.25)') : (anime.themeColors?.glow || 'rgba(139,92,246,0.25)')
            
            return (
              <Link 
                key={anime.id} 
                to={`/universe/${anime.id}`}
                onClick={() => window.scrollTo({ top: 0, behavior: 'auto' })}
                className="group flex flex-col items-start justify-end p-5 bg-white/5 border border-white/10 rounded-xl transition-all duration-500 w-full md:w-[260px] h-[120px] relative overflow-hidden text-left shadow-lg hover:border-white/30 hover:-translate-y-1"
                style={{ boxShadow: `0 0 0 rgba(0,0,0,0)` }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 10px 30px -10px ${cardGlow}`
                  e.currentTarget.style.borderColor = cardAccent
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = `none`
                  e.currentTarget.style.borderColor = `rgba(255,255,255,0.1)`
                }}
              >
                {/* Dynamic Background Image (Subtle Grayscale) */}
                {anime.animeImageUrl ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5 grayscale group-hover:opacity-20 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                    style={{ backgroundImage: `url(${anime.animeImageUrl})` }}
                  />
                ) : (
                  <div
                    className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity duration-700"
                    style={{ background: `radial-gradient(ellipse at 70% 30%, ${cardAccent}12 0%, transparent 60%)` }}
                  />
                )}

                {/* Gradient Overlay for Text Readability - Always active, intensifies on hover */}
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Left Border Accent */}
                <div 
                  className="absolute top-0 left-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ backgroundColor: cardAccent }}
                />
                
                {/* Content */}
                <div className="relative z-10 w-full flex flex-col gap-1 translate-y-2 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                  <span className="text-[10px] text-gray-500 font-bold tracking-[0.2em] group-hover:text-white/80 group-hover:scale-105 origin-left transition-all duration-500">STATUS: ONLINE</span>
                  <span className="text-sm font-bold uppercase truncate w-full flex items-center justify-between text-gray-200 group-hover:text-white drop-shadow-md">
                    {anime.anime}
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" style={{ color: cardAccent }} />
                  </span>
                </div>
              </Link>
            )
          })}

        </div>
      </div>
    </div>
  )
}
