import { useEffect, useState, useMemo } from 'react'
import { ExternalLink, Camera, X, Network, HeartHandshake } from 'lucide-react'
import Toggle from './components/Toggle'
import TabContent from './components/TabContent'
import SystemSummary from './components/SystemSummary'
import ExploreAnotherUniverse from './components/ExploreAnotherUniverse'
import WhyThisRenderer from './components/WhyThisRenderer'
import AIInsightPanel from './components/AIInsightPanel'
import ShareButton from './components/ShareButton'
import FeedbackBlock from './components/FeedbackBlock'
import SystemQuestionsPanel from './components/SystemQuestionsPanel'
import { useSystemReveal } from './hooks/useSystemReveal'
import { useShareFrame } from './hooks/useShareFrame'
import { getClassificationLabel } from './utils/getClassificationLabel'
import { deriveBullets } from './utils/deriveBullets'
import { getBestEntryConfig } from './utils/discovery'
import { getBackgroundMotif, getRevealOverlay, getSysWarningColors } from './config/universePresentation'

const TABS = ['POWER ENGINE', 'ENTITY DATABASE', 'FACTIONS', 'CORE LAWS']

const TAB_DESCRIPTIONS = {
  0: 'Abilities, techniques, and the mechanics that define combat.',
  1: 'Key figures, their threat levels, and how they connect.',
  2: 'Organizations, alliances, and the groups that shape the world.',
  3: 'The unbreakable rules that govern this universe.',
}

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

const SUPPORT_URL = 'https://buymeacoffee.com/hashiai'

function buildUniverseIntroduction(data) {
  if (!data) return ''
  if (typeof data.introductionSummary === 'string' && data.introductionSummary.trim()) {
    return data.introductionSummary.trim()
  }

  const powerCount = data.powerSystem?.length || 0
  const rulesCount = data.rules?.length || 0
  const factionCount = data.factions?.length || 0
  const relationshipCount = data.relationships?.length || 0
  const architectureLine = data.visualizationReason || data.tagline || 'This universe rewards structural analysis over surface-level plot recall.'

  return `${data.anime} is modeled here as a constrained system where abilities, institutions, and consequences create predictable strategic pressure. This archive profile maps ${powerCount} core mechanics, ${rulesCount} governing constraints, and ${factionCount} major power blocs so readers can quickly understand the operating logic of the world. ${architectureLine} Relationship and causality layers (${relationshipCount} mapped edges) make this page useful as a standalone reference for comparative universe analysis.`
}

export default function Dashboard({ data }) {
  const [activeTab, setActiveTab] = useState(0)
  const [isSystemMode, setIsSystemMode] = useState(false)
  const { isRevealing, revealStep, startReveal, cancelReveal } = useSystemReveal()
  const { isShareFrame, toggleShareFrame } = useShareFrame()

  const bestEntry = useMemo(() => getBestEntryConfig(data?.id, data?.visualizationHint), [data?.id, data?.visualizationHint])

  useEffect(() => {
    setActiveTab(bestEntry.tabIndex)
  }, [bestEntry.tabIndex, data?.id])

  const theme = data?.themeColors || DEFAULT_THEME
  const animeName = data?.anime || 'UNKNOWN ARCHIVE'
  const classLabel = getClassificationLabel(data?.visualizationHint)
  const shareFrameBullets = useMemo(() => deriveBullets(data).slice(0, 3), [data])
  const universeIntro = useMemo(() => buildUniverseIntroduction(data), [data])
  const headerFlavor = data?.headerFlavor
  const revealOverlay = getRevealOverlay(data?.revealOverlay)

  const handleJumpToSection = (tabIndex, sectionId) => {
    const normalizedTabIndex = Number.isInteger(tabIndex)
      ? Math.min(3, Math.max(0, tabIndex))
      : 0

    setActiveTab(normalizedTabIndex)
    if (!sectionId || typeof window === 'undefined') return

    requestAnimationFrame(() => {
      const target = document.getElementById(sectionId)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  }

  return (
    <div
      className={`min-h-screen bg-[#050508] text-white font-mono selection:bg-cyan-500/30 overflow-x-hidden relative ${isShareFrame ? 'share-frame' : ''}`}
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px'
      }}
    >
      <div 
        className="absolute inset-0 pointer-events-none z-0 mix-blend-overlay transition-opacity duration-1000" 
        style={{ 
          backgroundImage: getBackgroundMotif(data?.backgroundMotif),
          opacity: 0.04 
        }} 
      />
      <div className={`sys-mode-overlay ${isSystemMode ? 'active' : ''} share-frame-hide`} />

      {/* Share Frame Overlay */}
      {isShareFrame && (
        <div className="fixed inset-0 z-[60] bg-[#050508] flex flex-col items-center justify-center px-4 py-6 md:p-6 overflow-y-auto">
          <button
            onClick={toggleShareFrame}
            aria-label="Close share frame"
            className="fixed top-4 right-4 z-[70] p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="max-w-lg w-full flex flex-col items-center text-center gap-5 py-6">
            {/* Top accent line */}
            <div className="w-12 h-0.5 rounded-full opacity-40" style={{ backgroundColor: theme.primary }} />

            <div
              className="inline-flex items-center px-3 py-1 rounded text-[9px] font-bold tracking-[0.25em] uppercase border"
              style={{ color: theme.primary, borderColor: `${theme.primary}40`, backgroundColor: `${theme.primary}10` }}
            >
              {classLabel}
            </div>

            <h1 className="text-2xl md:text-5xl font-bold uppercase tracking-tighter text-white/90">
              {animeName}
            </h1>

            <div className="space-y-2.5 text-left w-full max-w-md px-2">
              {shareFrameBullets.map(b => (
                <div key={b.id} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-sm mt-1.5 shrink-0 opacity-60" style={{ backgroundColor: theme.primary }} />
                  <span className="text-xs md:text-sm text-gray-400 leading-relaxed">{b.lore}</span>
                </div>
              ))}
            </div>

            <div className="w-full max-w-md mt-1 rounded-lg border border-white/5 overflow-hidden bg-[#0a0a10] px-4 py-3">
              <div className="flex items-start gap-3">
                <div className="shrink-0 p-2 rounded-lg bg-[#050508]/80 border border-white/5">
                  <Network className="w-4 h-4" style={{ color: theme.primary }} />
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase mb-1">
                    WHY {(data?.visualizationHint || '').replace(/-/g, ' ').toUpperCase()}?
                  </p>
                  <p className="text-xs text-gray-400 font-mono leading-relaxed">
                    <span className="text-white/90">Because</span>{' '}
                    {(() => {
                      const r = data?.visualizationReason || data?.thesis || ''
                      return r.toLowerCase().startsWith('because') ? r.substring(8).trim() : r
                    })()}
                  </p>
                </div>
              </div>
            </div>

            <div className="w-12 h-0.5 rounded-full opacity-20 mt-1" style={{ backgroundColor: theme.primary }} />

            <div className="text-[10px] text-white/20 tracking-[0.3em] uppercase font-bold">
              animearchive.app
            </div>
          </div>
        </div>
      )}

      {/* System Reveal Vignette Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-40 transition-all duration-1000 ease-in-out" 
        style={{ 
          opacity: isRevealing ? 1 : 0,
          boxShadow: 'inset 0 0 150px 50px rgba(0,0,0,0.95)',
          backgroundColor: 'rgba(5, 5, 8, 0.5)'
        }} 
      >
        {isRevealing && revealOverlay && (
          <div className={revealOverlay.className} style={revealOverlay.style} />
        )}
      </div>

      {/* Header */}
      <header
        className="pt-14 pb-6 px-6 relative"
        style={{ background: `radial-gradient(ellipse at center, ${theme.heroGradient} 0%, transparent 100%)` }}
      >
        <div className="absolute inset-0 bg-linear-to-b from-[#050508]/20 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center md:items-start text-center md:text-left gap-4 md:flex-row md:justify-between">
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-white/10 rounded-full text-[10px] tracking-[0.3em] font-bold text-white/50 bg-white/5 backdrop-blur-xl">
                <span className={`w-1.5 h-1.5 rounded-full ${isSystemMode ? 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]' : 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]'}`} />
                ARCHIVE ACTIVE <span className="text-white/20 mx-1">|</span> ID: {data?.malId}
              </div>
              <div
                className="px-2 py-1 rounded text-[9px] font-bold tracking-[0.25em] border backdrop-blur-md"
                style={{ color: theme.primary, borderColor: `${theme.primary}40`, backgroundColor: `${theme.primary}10` }}
              >
                {getClassificationLabel(data?.visualizationHint)}
              </div>
            </div>
            
            {data?.logoUrl && (
              <img src={data.logoUrl} alt={`${animeName} official logo artwork`} className="h-16 md:h-20 object-contain mt-2 mb-1 drop-shadow-lg" />
            )}

            {!data?.logoUrl && (
              <h1 
                key={isSystemMode ? 'sys' : 'lore'} 
                className={`text-4xl md:text-5xl lg:text-7xl font-bold tracking-tighter uppercase transition-colors duration-700 ${isRevealing && revealStep === 1 ? 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 'bg-linear-to-b from-white to-white/60 bg-clip-text text-transparent'} mt-2`}
              >
                {animeName}
              </h1>
            )}

            {/* Casual Discovery Hook */}
            <p className="text-xs md:text-md text-gray-300 tracking-widest italic max-w-xl font-sans mt-1 border-l-2 pl-3" style={{ borderLeftColor: theme.secondary }}>
              "{data?.tagline}"
            </p>

            {headerFlavor && isSystemMode && (() => {
              const colors = getSysWarningColors(headerFlavor.sysWarningColor)
              return (
                <div className={`flex items-center gap-2 text-[10px] ${colors.text} tracking-widest mt-2 rounded ${colors.bg} px-3 py-1.5 border ${colors.border}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} animate-pulse ${colors.dotGlow}`} />
                  <span>{headerFlavor.sysWarning}</span>
                </div>
              )
            })()}
            {headerFlavor && !isSystemMode && (
              <div className="flex items-center gap-2 text-[10px] text-gray-400/70 tracking-widest mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                <span>"{headerFlavor.loreQuote}"</span>
              </div>
            )}
          </div>

          <div className="w-full md:w-auto mt-2 md:mt-0 relative z-20 shrink-0">
            <Toggle isSystemMode={isSystemMode} setIsSystemMode={setIsSystemMode} theme={theme} />
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 mt-8 mb-8 share-frame-hide" aria-labelledby="universe-introduction-heading">
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 md:p-8">
          <h2 id="universe-introduction-heading" className="text-sm md:text-base font-bold tracking-[0.2em] uppercase text-white mb-3">
            Universe Introduction
          </h2>
          <p className="text-xs md:text-sm text-gray-300 leading-relaxed max-w-4xl">
            {universeIntro}
          </p>
        </div>
      </section>

      <div className="share-frame-hide">
        <SystemQuestionsPanel data={data} onJumpToSection={handleJumpToSection} />
      </div>

      {/* 5-Bullet System Summary */}
      <SystemSummary data={data} isSystemMode={isSystemMode} theme={theme} revealStep={revealStep} isRevealing={isRevealing} />

      <div className="max-w-6xl mx-auto px-6 mt-3 mb-4 share-frame-hide">
        <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center rounded-full border border-cyan-300/30 bg-cyan-400/10 px-2.5 py-1 text-[9px] font-bold tracking-[0.2em] uppercase text-cyan-200">
            Best Entry
          </span>
          <p className="text-[11px] text-gray-300 leading-relaxed grow min-w-[220px]">{bestEntry.label}</p>
          <button
            onClick={() => setActiveTab(bestEntry.tabIndex)}
            className="px-3 py-1.5 min-h-[44px] rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-[10px] tracking-[0.18em] uppercase text-gray-200"
          >
            Open {TABS[bestEntry.tabIndex]}
          </button>
        </div>
      </div>

      {/* Why This Lens? */}
      <WhyThisRenderer data={data} isSystemMode={isSystemMode} theme={theme} revealStep={revealStep} isRevealing={isRevealing} />

      {/* Action Buttons */}
      <div className="max-w-6xl mx-auto px-6 mb-4 flex flex-wrap justify-center md:justify-end gap-3 relative z-50 share-frame-hide">
        <ShareButton
          title={animeName}
          systemLabel={classLabel}
          url={typeof window !== 'undefined' ? window.location.href : ''}
          theme={theme}
        />
        <button
          onClick={toggleShareFrame}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer min-h-[44px]"
          style={{ color: theme.primary }}
        >
          <Camera className="w-3.5 h-3.5" />
          SHARE FRAME
        </button>
        <button
          onClick={isRevealing ? cancelReveal : startReveal}
          className={`group flex items-center gap-3 px-5 py-2.5 rounded-full text-xs font-bold tracking-[0.2em] transition-all duration-500 border backdrop-blur-md uppercase cursor-pointer min-h-[44px] ${
            isRevealing
              ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
              : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white hover:border-cyan-400/50'
          }`}
          style={{
            boxShadow: !isRevealing ? `0 0 10px ${isSystemMode ? theme.secondary : theme.primary}20` : undefined
          }}
        >
          {isRevealing ? (
            <>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              CANCEL SEQUENCE
            </>
          ) : (
            <>
              <span className="w-0 overflow-hidden group-hover:w-auto transition-all duration-300">▶</span>
              REVEAL THE SYSTEM
            </>
          )}
        </button>
      </div>

      {/* AI Insight Panel */}
      <div className="share-frame-hide">
        <AIInsightPanel aiInsights={data?.aiInsights} theme={theme} isSystemMode={isSystemMode} revealStep={revealStep} isRevealing={isRevealing} />
      </div>

      {/* Navigation Tabs */}
      <nav className="max-w-6xl mx-auto px-6 mb-3 mt-4 flex overflow-x-auto relative flex-nowrap border-b border-white/5 scrollbar-hide share-frame-hide">
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
              <span className="relative z-10 inline-flex items-center gap-1.5">{tab}
                {idx === bestEntry.tabIndex && (
                  <span className="inline-flex items-center justify-center min-w-4 h-4 text-[8px] px-1.5 py-0.5 rounded border border-cyan-300/20 bg-cyan-400/10 text-cyan-200 tracking-[0.12em]">
                    <span className="sm:hidden" aria-hidden="true">★</span>
                    <span className="hidden sm:inline">START</span>
                    <span className="sr-only">Recommended starting tab</span>
                  </span>
                )}
              </span>
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

      {/* Tab Description */}
      <div className="max-w-6xl mx-auto px-6 mb-10 share-frame-hide">
        <p className="text-[10px] md:text-xs text-gray-600 tracking-wider">{TAB_DESCRIPTIONS[activeTab]}{activeTab === bestEntry.tabIndex ? ' · Recommended first view.' : ''}</p>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 pb-24 relative z-40 share-frame-hide">
        <TabContent
          activeTab={activeTab}
          data={data}
          isSystemMode={isSystemMode}
          theme={theme}
          revealStep={revealStep}
          isRevealing={isRevealing}
        />
      </main>

      <div className="share-frame-hide">
        <ExploreAnotherUniverse currentId={data?.id || data?.malId} isSystemMode={isSystemMode} theme={theme} />
      </div>

      {/* Community Feedback */}
      <div className="share-frame-hide">
        <FeedbackBlock slug={data?.id} theme={theme} animeName={animeName} />
      </div>

      {/* Footer */}
      <footer className="py-10 border-t border-white/5 relative z-10 flex flex-col items-center gap-4 share-frame-hide">
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
            href="https://www.tiktok.com/@hashi.ai"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/30 rounded-full transition-all duration-300"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-cyan-400 group-hover:text-white transition-colors" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.63a8.23 8.23 0 004.79 1.53V6.71a4.85 4.85 0 01-1.03-.02z"/>
            </svg>
            <span className="text-[10px] font-bold tracking-[0.2em] text-gray-300 group-hover:text-white transition-colors uppercase">
              @HASHI.AI
            </span>
          </a>
          <a
            href={SUPPORT_URL}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-400/30 rounded-full transition-all duration-300"
          >
            <HeartHandshake className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white transition-colors" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-gray-300 group-hover:text-white transition-colors uppercase">
              Support the archive
            </span>
          </a>

        </div>
        <p className="text-[10px] text-gray-300/70 tracking-[0.2em] uppercase max-w-2xl mx-auto px-6 text-center">
          Unofficial fan-made interactive analysis. All characters, names, and lore belong to their respective creators and studios. Created by Hashi.Ai.
        </p>
      </footer>
    </div>
  )
}
