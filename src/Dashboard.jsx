import { useState } from 'react'
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
            <div className="inline-block px-3 py-1 border border-white/20 rounded-full text-[10px] tracking-[0.3em] font-bold text-gray-400 bg-white/5 backdrop-blur-md">
              INTELLIGENCE SCHEMA <span className="text-cyan-400 mx-2">|</span> ID: {data?.malId}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tighter uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              {animeName}
            </h1>
            <p className="text-xs md:text-sm lg:text-base text-gray-400 tracking-widest uppercase">
              {data?.tagline}
            </p>
            {isAoT && (
              <div className="flex items-center gap-2 text-[10px] text-red-400/70 tracking-widest">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>// ABSOLUTE ZERO TIME — DETERMINISTIC LOOP ACTIVE</span>
              </div>
            )}
          </div>

          <div className="w-full md:w-auto mt-4 md:mt-0 relative z-20 shrink-0">
            <Toggle isSystemMode={isSystemMode} setIsSystemMode={setIsSystemMode} theme={theme} />
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="max-w-6xl mx-auto px-6 mb-8 mt-4 border-b border-white/10 flex overflow-x-auto relative flex-nowrap">
        {TABS.map((tab, idx) => (
          <button
            key={tab}
            onClick={() => setActiveTab(idx)}
            className="px-4 py-3 min-h-[44px] md:px-6 md:py-4 text-xs md:text-sm font-bold tracking-widest whitespace-nowrap transition-colors duration-300"
            style={{ color: activeTab === idx ? (isSystemMode ? theme.secondary : theme.primary) : '#6b7280' }}
          >
            {tab}
          </button>
        ))}
        <div
          className="absolute bottom-0 h-0.5 transition-all duration-300"
          style={{
            width: `${100 / TABS.length}%`,
            transform: `translateX(${activeTab * 100}%)`,
            backgroundColor: isSystemMode ? theme.secondary : theme.primary,
            boxShadow: `0 0 10px ${isSystemMode ? theme.modeGlow : theme.glow}`
          }}
        />
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
      <footer className="py-8 text-center border-t border-white/5 relative z-10 flex flex-col items-center">
        <p className="text-[8px] md:text-[10px] text-gray-600 tracking-[0.2em] uppercase max-w-2xl mx-auto px-6 mb-4">
          Unofficial fan-made interactive analysis. All characters, names, and lore belong to their respective creators and studios.
        </p>
        {data?.malId && (
          <a
            href={`https://myanimelist.net/anime/${data.malId}`}
            target="_blank"
            rel="noreferrer"
            className="text-[10px] hover:text-white transition-colors tracking-widest uppercase font-bold hover:underline"
            style={{ color: theme.primary }}
          >
            VIEW ON MYANIMELIST
          </a>
        )}
      </footer>
    </div>
  )
}
