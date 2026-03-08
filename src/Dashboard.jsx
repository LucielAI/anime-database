import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import Toggle from './components/Toggle'
import TabContent from './components/TabContent'

const TABS = ['POWER ENGINE', 'ENTITY DATABASE', 'FACTIONS', 'CORE LAWS']

const DEFAULT_THEME = {
  primary: '#22d3ee',
  secondary: '#8b5cf6',
  accent: '#f59e0b',
  glow: 'rgba(34,211,238,0.35)',
  tabActive: '#22d3ee',
  badgeBg: 'rgba(139,92,246,0.12)',
  badgeText: '#8b5cf6',
  modeGlow: 'rgba(34,211,238,0.25)',
  heroGradient: 'rgba(5,5,20,0.95)',
}

export default function Dashboard({ data }) {
  const [activeTab, setActiveTab] = useState(0)
  const [isSystemMode, setIsSystemMode] = useState(false)

  const theme = data?.themeColors || DEFAULT_THEME
  const animeName = data?.anime || 'UNKNOWN ARCHIVE'
  const isAoT = data?.anime === 'Attack on Titan'

  return (
    <div
      className="min-h-screen bg-[#050508] text-white font-mono selection:bg-cyan-500/30 overflow-x-hidden"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px'
      }}
    >
      {/* Header */}
      <header
        className="pt-12 pb-6 px-6 relative"
        style={{ background: `radial-gradient(ellipse at center, ${theme.heroGradient} 0%, transparent 100%)` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#050508]/20 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center md:items-start text-center md:text-left gap-4 md:flex-row md:justify-between">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-white/10 rounded-full text-[10px] tracking-[0.3em] font-bold text-white/50 bg-white/5 backdrop-blur-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]" />
              ARCHIVE ACTIVE <span className="text-white/20 mx-1">|</span> ID: {data?.malId}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tighter uppercase bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
              {animeName}
            </h1>
            <p className="text-xs md:text-sm text-gray-500 tracking-[0.2em] uppercase font-bold">
              {data?.tagline}
            </p>
            {isAoT && isSystemMode && (
              <div className="flex items-center gap-2 text-[10px] text-red-400/70 tracking-widest">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>// ABSOLUTE ZERO TIME — DETERMINISTIC LOOP ACTIVE</span>
              </div>
            )}
            {isAoT && !isSystemMode && (
              <div className="flex items-center gap-2 text-[10px] text-red-400/70 tracking-widest">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>// THE WORLD IS CRUEL — AND ALSO VERY BEAUTIFUL</span>
              </div>
            )}
          </div>

          <div className="w-full md:w-auto mt-4 md:mt-0 relative z-20 shrink-0">
            <Toggle isSystemMode={isSystemMode} setIsSystemMode={setIsSystemMode} theme={theme} />
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="max-w-6xl mx-auto px-6 mb-8 mt-4 flex overflow-x-auto relative flex-nowrap border-b border-white/5 scrollbar-hide">
        {TABS.map((tab, idx) => {
          const isActive = activeTab === idx
          const activeColor = isSystemMode ? theme.secondary : theme.primary
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(idx)}
              className={`relative px-4 py-3.5 min-h-[44px] md:px-6 md:py-4 text-[10px] md:text-xs font-bold tracking-[0.2em] whitespace-nowrap transition-all duration-300 cursor-pointer ${isActive ? '' : 'hover:text-gray-300'}`}
              style={{
                color: isActive ? activeColor : '#4b5563',
                textShadow: isActive ? `0 0 12px ${activeColor}60` : 'none'
              }}
            >
              <span className="relative z-10">{tab}</span>
              {isActive && (
                <span
                  className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: activeColor,
                    boxShadow: `0 0 8px ${isSystemMode ? theme.modeGlow : theme.glow}`
                  }}
                />
              )}
            </button>
          )
        })}
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 pb-24">
        <TabContent
          activeTab={activeTab}
          data={data}
          isSystemMode={isSystemMode}
          theme={theme}
        />
      </main>

      {/* Footer */}
      <footer className="py-10 border-t border-white/5 relative z-10 flex flex-col items-center gap-4">
        <div className="flex flex-wrap justify-center gap-3">
          {data?.malId && (
            <a
              href={`https://myanimelist.net/anime/${data.malId}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300"
              style={{ color: theme.primary }}
            >
              VIEW ON MAL
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <a
            href="https://www.tiktok.com/@kenshipeak"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/30 rounded-full transition-all duration-300"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-cyan-400 group-hover:text-white transition-colors" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.63a8.23 8.23 0 004.79 1.53V6.71a4.85 4.85 0 01-1.03-.02z"/>
            </svg>
            <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 group-hover:text-white transition-colors uppercase">
              @KENSHIPEAK
            </span>
          </a>
        </div>
        <p className="text-[10px] text-white/15 tracking-[0.2em] uppercase max-w-2xl mx-auto px-6 text-center">
          Unofficial fan-made interactive analysis. All characters, names, and lore belong to their respective creators and studios.
        </p>
      </footer>
    </div>
  )
}
