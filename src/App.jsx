import { useEffect } from 'react'
import { Routes, Route, useNavigate, useParams, Link, useLocation } from 'react-router-dom'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Analytics } from '@vercel/analytics/react'
import Dashboard from './Dashboard'
import { ANIME_LIST } from './data/index.js'
import { Lock, ExternalLink } from 'lucide-react'
import { deriveBullets } from './utils/deriveBullets'
import { getClassificationLabel } from './utils/getClassificationLabel'

function Home() {
  const totalEntities = ANIME_LIST.reduce((sum, a) => sum + (a.characters?.length || 0), 0)
  const totalPowers = ANIME_LIST.reduce((sum, a) => sum + (a.powerSystem?.length || 0), 0)
  const totalRules = ANIME_LIST.reduce((sum, a) => sum + (a.rules?.length || 0), 0)
  const MIN_GRID_FILL = 6
  const placeholdersCount = Math.max(0, MIN_GRID_FILL - ANIME_LIST.length)
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

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter uppercase mb-3 bg-linear-to-b from-white to-white/60 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
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

      {/* Featured "Today's System" Hero Card */}
      {(() => {
        const featured = ANIME_LIST[ANIME_LIST.length - 1]
        if (!featured) return null
        const ft = featured.themeColors || { primary: '#374151', glow: 'rgba(255,255,255,0.1)' }
        const heroLabel = getClassificationLabel(featured.visualizationHint)
        const heroBullets = deriveBullets(featured).slice(0, 3)
        return (
          <section className="max-w-6xl mx-auto px-6 -mt-6 mb-12 relative z-20 animate-fade-in">
            <Link
              to={`/universe/${featured.id}`}
              className="group block rounded-xl overflow-hidden relative"
              style={{ border: `1px solid ${ft.primary}50` }}
            >
              <div className="flex flex-col md:flex-row">
                {/* Image side */}
                <div className="relative w-full md:w-2/5 h-48 md:h-auto md:min-h-[280px] overflow-hidden shrink-0">
                  {featured.animeImageUrl ? (
                    <img
                      src={featured.animeImageUrl}
                      alt={featured.anime}
                      className="w-full h-full object-cover object-center opacity-70 group-hover:opacity-90 transition-all duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{
                        background: `radial-gradient(ellipse at 30% 50%, ${ft.primary}18 0%, transparent 60%), linear-gradient(135deg, #0a0a14 0%, #0d0f1a 40%, ${ft.primary}08 100%)`
                      }}
                    >
                      <div className="flex flex-col items-center gap-2 opacity-40">
                        <div className="w-12 h-12 rounded-full border border-current flex items-center justify-center" style={{ color: ft.primary }}>
                          <span className="text-lg font-bold">{featured.anime?.charAt(0)}</span>
                        </div>
                        <span className="text-[8px] tracking-[0.3em] uppercase" style={{ color: ft.primary }}>CLASSIFIED</span>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-r from-transparent to-[#050508] pointer-events-none hidden md:block" />
                  <div className="absolute inset-0 bg-linear-to-t from-[#050508] to-transparent pointer-events-none md:hidden" />
                  <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm border border-white/20 text-[9px] font-bold tracking-[0.2em] text-cyan-400/80 rounded uppercase">
                    FEATURED SYSTEM
                  </div>
                </div>

                {/* Content side */}
                <div className="relative flex-1 p-6 md:p-8 bg-[#0a0a10] flex flex-col justify-center">
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ background: `radial-gradient(ellipse at top right, ${ft.primary}, transparent 70%)` }} />
                  <div className="relative z-10">
                    <div
                      className="inline-flex items-center px-2.5 py-1 rounded text-[9px] font-bold tracking-[0.25em] uppercase mb-3 border"
                      style={{ color: ft.primary, borderColor: `${ft.primary}40`, backgroundColor: `${ft.primary}10` }}
                    >
                      {heroLabel}
                    </div>
                    <h2
                      className="text-2xl md:text-4xl font-bold uppercase tracking-tighter mb-2 text-white"
                      style={{ textShadow: `0 0 12px ${ft.glow}` }}
                    >
                      {featured.anime}
                    </h2>
                    <p className="text-[10px] text-white/40 tracking-widest uppercase mb-4">{featured.tagline}</p>

                    <div className="space-y-2 mb-6">
                      {heroBullets.map(b => (
                        <div key={b.id} className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-sm mt-1 shrink-0 opacity-60" style={{ backgroundColor: ft.primary }} />
                          <span className="text-xs text-gray-400 leading-relaxed line-clamp-2">{b.lore}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <span
                        className="px-5 py-2.5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase border transition-all duration-300 group-hover:shadow-lg"
                        style={{
                          color: 'white',
                          borderColor: `${ft.primary}60`,
                          backgroundColor: `${ft.primary}20`,
                          boxShadow: `0 0 0px ${ft.primary}00`,
                        }}
                      >
                        REVEAL THE SYSTEM
                      </span>
                      <span className="px-5 py-2.5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase border border-white/10 bg-white/5 text-gray-400 group-hover:text-white transition-colors">
                        ENTER ARCHIVE
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )
      })()}

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
            const classLabel = getClassificationLabel(data.visualizationHint)
            const bullets = deriveBullets(data).slice(0, 2)
            return (
              <Link
                to={`/universe/${data.id}`}
                key={data.anime}
                className="group cursor-pointer bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden hover:-translate-y-2 transition-all duration-500 relative flex flex-col animate-fade-in"
                style={{
                  border: `1px solid ${theme.primary}`,
                  animationDelay: `${idx * 120}ms`,
                  animationFillMode: 'both',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 30px ${theme.glow}` }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none' }}
              >
                <div className="h-[55%] min-h-[180px] relative w-full overflow-hidden shrink-0">
                  {data.animeImageUrl ? (
                    <img
                      src={data.animeImageUrl}
                      alt={data.anime}
                      loading="lazy"
                      className="w-full h-full object-cover object-center opacity-80 group-hover:opacity-100 transition-all duration-700 ease-out group-hover:scale-110"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{
                        background: `radial-gradient(ellipse at 50% 40%, ${theme.primary}15 0%, transparent 60%), linear-gradient(160deg, #0a0a14 0%, #0d0f1a 50%, ${theme.primary}0a 100%)`
                      }}
                    >
                      <div className="flex flex-col items-center gap-2 opacity-30 group-hover:opacity-50 transition-opacity duration-500">
                        <div className="w-14 h-14 rounded-full border border-current flex items-center justify-center" style={{ color: theme.primary }}>
                          <span className="text-xl font-bold tracking-tight">{data.anime?.charAt(0)}</span>
                        </div>
                        <span className="text-[7px] tracking-[0.3em] uppercase" style={{ color: theme.primary }}>SIGNAL PENDING</span>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-[#050508] to-transparent pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none" style={{ background: `linear-gradient(to top, ${theme.primary}08, transparent)` }} />
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
                  <div
                    className="inline-flex items-center self-start px-2 py-0.5 rounded text-[8px] font-bold tracking-[0.2em] uppercase mb-2 border"
                    style={{ color: theme.primary, borderColor: `${theme.primary}40`, backgroundColor: `${theme.primary}10` }}
                  >
                    {classLabel}
                  </div>
                  <div className="space-y-1 mb-3">
                    {bullets.map(b => (
                      <div key={b.id} className="flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full mt-1.5 shrink-0 opacity-60" style={{ backgroundColor: theme.primary }} />
                        <span className="text-[10px] text-gray-500 leading-relaxed line-clamp-1">{b.lore}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs font-bold tracking-widest opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 md:translate-y-2 md:group-hover:translate-y-0 uppercase pointer-events-none" style={{ color: theme.primary }}>
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
              <div className="text-[8px] md:text-[10px] font-bold tracking-[0.2em] text-white/20 uppercase max-w-[80%] text-center border border-white/10 px-3 py-1.5 rounded bg-black/50">
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
  const location = useLocation()

  useEffect(() => {
    document.title = 'Anime Architecture Archive'
  }, [])

  // GoatCounter SPA tracking
  useEffect(() => {
    if (window.goatcounter) {
      window.goatcounter.count({
        path: location.pathname,
        title: document.title
      })
    }
  }, [location.pathname])

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/universe/:id" element={<UniverseRoute />} />
      </Routes>
      <SpeedInsights />
      <Analytics />
    </>
  )
}
