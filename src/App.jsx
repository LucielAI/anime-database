import { useState, useEffect } from 'react'
import Dashboard from './Dashboard'
import { ANIME_LIST } from './data/index.js'
import { Lock } from 'lucide-react'

export default function App() {
  const [activeUniverse, setActiveUniverse] = useState(null)

  useEffect(() => { document.title = 'Anime Architecture Archive' }, [])

  if (activeUniverse !== null) {
    return (
      <div className="relative">
        <button
          onClick={() => setActiveUniverse(null)}
          className="fixed top-6 left-6 z-50 px-4 py-2 bg-black/50 hover:bg-black/80 border border-white/20 rounded font-mono text-[10px] text-gray-300 hover:text-white tracking-[0.2em] transition-all backdrop-blur-md uppercase"
        >
          &larr; ARCHIVE SELECTOR
        </button>
        <Dashboard data={ANIME_LIST[activeUniverse]} />
      </div>
    )
  }

  const totalEntities = ANIME_LIST.reduce((sum, a) => sum + (a.characters?.length || 0), 0)
  const totalPowers = ANIME_LIST.reduce((sum, a) => sum + (a.powerSystem?.length || 0), 0)
  const placeholdersCount = Math.max(0, 6 - ANIME_LIST.length)
  const placeholders = Array(placeholdersCount).fill(0)

  return (
    <div
      className="min-h-screen bg-[#050508] text-white font-mono selection:bg-cyan-500/30 overflow-x-hidden relative"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px'
      }}
    >
      <div className="absolute top-0 left-0 w-full h-px bg-white/5 z-0 animate-[scan_8s_linear_infinite]" />

      {/* Hero Section */}
      <header
        className="w-full relative py-24 px-6 border-b border-white/5 flex flex-col items-center justify-center text-center z-10"
        style={{ background: 'radial-gradient(ellipse at center, #0d0d1f 0%, #050508 100%)' }}
      >
        <div className="absolute top-6 left-6 inline-block px-3 py-1 border border-white/20 rounded-full text-[10px] tracking-[0.3em] font-bold text-white/60 bg-white/5 backdrop-blur-md">
          SYSTEM ROOT ACCESS
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter uppercase mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          Anime Architecture Archive
        </h1>
        <p className="text-sm md:text-base text-cyan-400/70 tracking-widest uppercase mt-2">
          Fictional Universe Intelligence System V1.0
        </p>

        <div className="mt-8 font-mono text-[10px] md:text-xs text-white/40 tracking-widest uppercase flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-4">
          <span>[{ANIME_LIST.length}] UNIVERSES CLASSIFIED</span>
          <span className="hidden sm:inline">|</span>
          <span>[{totalEntities}] ENTITIES ARCHIVED</span>
          <span className="hidden sm:inline">|</span>
          <span>[{totalPowers}] POWER SYSTEMS MAPPED</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 py-16 z-10 relative">
        <div className="text-sm text-cyan-400 font-mono tracking-widest mb-8 uppercase flex items-center gap-2">
          <span>// CLASSIFIED ARCHIVES</span>
          <div className="h-px bg-cyan-400/20 grow ml-4" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ANIME_LIST.map((data, idx) => {
            const theme = data.themeColors || { primary: '#374151', glow: 'rgba(255,255,255,0.1)' }
            return (
              <div
                key={data.anime}
                onClick={() => setActiveUniverse(idx)}
                className="group cursor-pointer bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden hover:-translate-y-2 transition-all duration-300 relative flex flex-col aspect-3/4"
                style={{ border: `1px solid ${theme.primary}` }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 30px ${theme.glow}` }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none' }}
              >
                <div className="h-[70%] relative w-full overflow-hidden shrink-0">
                  {data.animeImageUrl ? (
                    <img
                      src={data.animeImageUrl}
                      alt={data.anime}
                      loading="lazy"
                      className="w-full h-full object-cover object-center opacity-80 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-900 border-b border-white/10 flex items-center justify-center text-xs tracking-widest text-gray-600">NO IMAGE ASSET</div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#050508] to-transparent pointer-events-none" />
                  <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm border border-white/20 text-[10px] font-bold tracking-[0.2em] text-white rounded uppercase">
                    {data.visualizationHint}
                  </div>
                </div>

                <div className="p-5 grow flex flex-col justify-end relative">
                  <div className="text-[10px] text-white/50 font-bold tracking-[0.2em] mb-1 uppercase flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                    INDEX: {data.malId}
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold uppercase mb-1 text-white transition-colors truncate w-full" style={{ textShadow: `0 0 8px ${theme.glow}80` }}>{data.anime}</h2>
                  <p className="text-[10px] text-white/50 tracking-widest uppercase truncate w-full mb-4 md:mb-6">
                    {data.tagline}
                  </p>
                  <div className="text-xs font-bold tracking-widest opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 md:translate-y-2 md:group-hover:translate-y-0 uppercase md:absolute md:bottom-5 pointer-events-none" style={{ color: theme.primary }}>
                    [ENTER ARCHIVE &rarr;]
                  </div>
                </div>
              </div>
            )
          })}

          {/* Placeholder Archives */}
          {placeholders.map((_, idx) => (
            <div
              key={`placeholder-${idx}`}
              className="rounded-xl overflow-hidden relative flex flex-col items-center justify-center aspect-3/4"
              style={{
                border: '1px solid rgba(255,255,255,0.05)',
                background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 2px, transparent 2px, transparent 10px)'
              }}
            >
              <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              <Lock className="w-8 h-8 text-white/20 mb-4" />
              <div className="text-xl md:text-2xl font-bold tracking-widest text-white/20 uppercase mb-2">CLASSIFIED</div>
              <div className="text-[8px] md:text-[10px] font-bold tracking-[0.2em] text-white/20 uppercase max-w-[80%] text-center">
                ARCHIVE PENDING CLASSIFICATION
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="mt-20 pb-8 text-center font-mono text-xs text-white/20 uppercase tracking-widest">
        Unofficial fan-made interactive analysis. All characters, names, and lore belong to their respective creators and studios.
      </footer>
    </div>
  )
}
