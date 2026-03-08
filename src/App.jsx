import { useEffect } from 'react'
import { Routes, Route, useNavigate, useParams, Link } from 'react-router-dom'
import Dashboard from './Dashboard'
import { ANIME_LIST } from './data/index.js'
import { Lock, ExternalLink } from 'lucide-react'

function Home() {
  const totalEntities = ANIME_LIST.reduce((sum, a) => sum + (a.characters?.length || 0), 0)
  const totalPowers = ANIME_LIST.reduce((sum, a) => sum + (a.powerSystem?.length || 0), 0)
  const totalRules = ANIME_LIST.reduce((sum, a) => sum + (a.rules?.length || 0), 0)
  const placeholdersCount = Math.max(0, 4 - ANIME_LIST.length)
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
        className="w-full relative py-20 md:py-28 px-6 border-b border-white/5 flex flex-col items-center justify-center text-center z-10"
        style={{ background: 'radial-gradient(ellipse at center, #0d0d1f 0%, #050508 100%)' }}
      >
        <div className="absolute top-6 left-6 inline-flex items-center gap-2 px-3 py-1.5 border border-white/10 rounded-full text-[10px] tracking-[0.3em] font-bold text-white/50 bg-white/5 backdrop-blur-xl transition-all hover:bg-white/10">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]" />
          SYSTEM ONLINE
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter uppercase mb-3 bg-linear-to-b from-white to-white/60 bg-clip-text text-transparent">
          Anime Architecture Archive
        </h1>
        <p className="text-sm md:text-base text-cyan-400/60 tracking-[0.3em] uppercase mt-1 font-bold">
          Fictional Universe Intelligence System
        </p>

        <p className="mt-6 text-xs md:text-sm text-gray-500 max-w-lg leading-relaxed tracking-wide">
          Decode power systems. Map causal chains. Explore entity networks and the immutable laws that govern anime worlds.
        </p>

        <div className="mt-8 font-mono text-[10px] md:text-xs text-white/30 tracking-widest uppercase flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-6">
          <span className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-cyan-400/50" />[{ANIME_LIST.length}] UNIVERSES</span>
          <span className="hidden sm:inline text-white/10">|</span>
          <span className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-cyan-400/50" />[{totalEntities}] ENTITIES</span>
          <span className="hidden sm:inline text-white/10">|</span>
          <span className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-cyan-400/50" />[{totalPowers}] POWER SYSTEMS</span>
          <span className="hidden sm:inline text-white/10">|</span>
          <span className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-cyan-400/50" />[{totalRules}] IMMUTABLE LAWS</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 py-16 z-10 relative">
        <div className="text-sm text-cyan-400 font-mono tracking-widest mb-8 uppercase flex items-center gap-2">
          <span>// SELECT UNIVERSE</span>
          <div className="h-px bg-cyan-400/20 grow ml-4" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ANIME_LIST.map((data, idx) => {
            const theme = data.themeColors || { primary: '#374151', glow: 'rgba(255,255,255,0.1)' }
            const entityCount = data.characters?.length || 0
            const powerCount = data.powerSystem?.length || 0
            return (
              <Link
                to={`/universe/${data.id}`}
                key={data.anime}
                className="group cursor-pointer bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden hover:-translate-y-2 transition-all duration-500 relative flex flex-col aspect-3/4 animate-fade-in"
                style={{
                  border: `1px solid ${theme.primary}`,
                  animationDelay: `${idx * 120}ms`,
                  animationFillMode: 'both',
                }}
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
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-[#050508] to-transparent pointer-events-none" />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <div className="px-2 py-1 bg-black/60 backdrop-blur-sm border border-white/20 text-[10px] font-bold tracking-[0.15em] text-white/80 rounded uppercase">
                      {entityCount} ENTITIES
                    </div>
                    <div className="px-2 py-1 bg-black/60 backdrop-blur-sm border border-white/20 text-[10px] font-bold tracking-[0.15em] text-white/80 rounded uppercase">
                      {powerCount} POWERS
                    </div>
                  </div>
                </div>

                <div className="p-5 grow flex flex-col justify-end relative">
                  <div className="text-[10px] text-white/50 font-bold tracking-[0.2em] mb-1 uppercase flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                    ARCHIVE READY
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold uppercase mb-1 text-white transition-colors truncate w-full" style={{ textShadow: `0 0 8px ${theme.glow}80` }}>{data.anime}</h2>
                  <p className="text-[10px] text-white/50 tracking-widest uppercase truncate w-full mb-4 md:mb-6 leading-relaxed">
                    {data.tagline}
                  </p>
                  <div className="text-xs font-bold tracking-widest opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 md:translate-y-2 md:group-hover:translate-y-0 uppercase md:absolute md:bottom-5 pointer-events-none" style={{ color: theme.primary }}>
                    EXPLORE ARCHIVE &rarr;
                  </div>
                </div>
              </Link>
            )
          })}

          {/* Placeholder Archives */}
          {placeholders.map((_, idx) => (
            <div
              key={`placeholder-${idx}`}
              className="rounded-xl overflow-hidden relative flex flex-col items-center justify-center aspect-3/4 animate-fade-in"
              style={{
                border: '1px solid rgba(255,255,255,0.05)',
                background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 2px, transparent 2px, transparent 10px)',
                animationDelay: `${(ANIME_LIST.length + idx) * 120}ms`,
                animationFillMode: 'both',
              }}
            >
              <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              <Lock className="w-8 h-8 text-white/20 mb-4" />
              <div className="text-xl md:text-2xl font-bold tracking-widest text-white/20 uppercase mb-2">CLASSIFIED</div>
              <div className="text-[8px] md:text-[10px] font-bold tracking-[0.2em] text-white/20 uppercase max-w-[80%] text-center">
                ARCHIVE PENDING
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="mt-20 pb-10 flex flex-col items-center gap-4 font-mono relative z-10">
        <a
          href="https://www.tiktok.com/@kenshipeak"
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-2.5 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/30 rounded-full backdrop-blur-xl transition-all duration-300"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-cyan-400 group-hover:text-white transition-colors" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.63a8.23 8.23 0 004.79 1.53V6.71a4.85 4.85 0 01-1.03-.02z"/>
          </svg>
          <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 group-hover:text-white transition-colors uppercase">
            @KENSHIPEAK
          </span>
          <ExternalLink className="w-3 h-3 text-gray-600 group-hover:text-cyan-400 transition-colors" />
        </a>
        <p className="text-[10px] text-white/15 tracking-[0.2em] uppercase max-w-md text-center px-6">
          Unofficial fan-made interactive analysis. All characters, names, and lore belong to their respective creators and studios.
        </p>
      </footer>
    </div>
  )
}

function UniverseRoute() {
  const navigate = useNavigate()
  const { id } = useParams()
  
  const data = ANIME_LIST.find(a => a.id === id)
  
  useEffect(() => {
    if (!data) {
      navigate('/', { replace: true })
    }
  }, [data, navigate])

  if (!data) return null

  return (
    <div className="relative">
      <Link
        to="/"
        className="fixed top-6 left-6 z-50 px-5 py-2.5 bg-black/60 hover:bg-white/10 border border-white/10 hover:border-white/40 shadow-lg hover:shadow-cyan-500/20 rounded-lg font-mono text-[10px] text-gray-400 hover:text-white tracking-[0.2em] transition-all duration-300 backdrop-blur-xl uppercase cursor-pointer min-h-[44px] min-w-[44px] group flex items-center justify-center"
      >
        <span className="group-hover:-translate-x-1 inline-block transition-transform duration-200 mr-2">&larr;</span> 
        <span>INDEX</span>
      </Link>
      <Dashboard data={data} />
    </div>
  )
}

export default function App() {
  useEffect(() => { document.title = 'Anime Architecture Archive' }, [])
  
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/universe/:id" element={<UniverseRoute />} />
    </Routes>
  )
}
