import { useEffect, useState, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
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
import { getBestEntryConfig, getRelatedUniverseSuggestions } from './utils/discovery'
import { getHeroContract } from './utils/heroContract'
import { getBackgroundMotif, getRevealOverlay } from './config/universePresentation'
import { UNIVERSE_CATALOG } from './data/index'

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

function trackAffiliateClick(label, universe = 'unknown', linkType = label) {
  if (typeof window !== 'undefined' && window.goatcounter) {
    const page = window.location.pathname
    window.goatcounter.count({
      path: `affiliate-${label}`,
      title: `Affiliate Click: ${label}`,
      event: true,
      data: {
        page,
        universe,
        link_type: linkType,
      },
    })
  }
}

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

  return `${data.anime} is presented here as a structured universe where abilities, institutions, and consequences shape every major outcome. This archive profile maps ${powerCount} core mechanics, ${rulesCount} governing constraints, and ${factionCount} major power blocs so fans can quickly understand how the world works. ${architectureLine} Relationship and causality layers (${relationshipCount} mapped edges) make this page useful as a standalone reference for comparative universe analysis.`
}

export default function Dashboard({ data }) {
  const [activeTab, setActiveTab] = useState(0)
  const [isSystemMode, setIsSystemMode] = useState(false)
  const { isRevealing, revealStep } = useSystemReveal()
  const { isShareFrame, toggleShareFrame } = useShareFrame()
  const heroRef = useRef(null)
  const [isHeroVisible, setIsHeroVisible] = useState(true)
  const [showMonetizationBar, setShowMonetizationBar] = useState(false)

  const bestEntry = useMemo(() => getBestEntryConfig(data?.id, data?.visualizationHint), [data?.id, data?.visualizationHint])
  const relatedUniverses = useMemo(() => getRelatedUniverseSuggestions(UNIVERSE_CATALOG, data?.id, 3), [data?.id])
  const bestParallel = relatedUniverses[0]

  useEffect(() => {
    setActiveTab(bestEntry.tabIndex)
  }, [bestEntry.tabIndex, data?.id])

  useEffect(() => {
    if (typeof window === 'undefined' || !heroRef.current) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeroVisible(entry.isIntersecting)
      },
      { threshold: 0.2 }
    )

    observer.observe(heroRef.current)
    return () => observer.disconnect()
  }, [data?.id])

  useEffect(() => {
    if (isHeroVisible) {
      setShowMonetizationBar(false)
      return undefined
    }

    const timeoutId = window.setTimeout(() => setShowMonetizationBar(true), 150)
    return () => window.clearTimeout(timeoutId)
  }, [isHeroVisible])

  const theme = data?.themeColors || DEFAULT_THEME
  const animeName = data?.anime || 'UNKNOWN ARCHIVE'
  const classLabel = getClassificationLabel(data?.visualizationHint)
  const shareFrameBullets = useMemo(() => deriveBullets(data).slice(0, 3), [data])
  const universeIntro = useMemo(() => buildUniverseIntroduction(data), [data])
  const revealOverlay = getRevealOverlay(data?.revealOverlay)
  const heroContract = useMemo(() => getHeroContract(data, bestEntry.tabIndex), [data, bestEntry.tabIndex])
  const proofStrip = useMemo(() => ([
    `${heroContract.mechanicsCount} Mechanics`,
    `${heroContract.linksCount} Links`,
    `${heroContract.lawsCount} Laws`,
  ]), [heroContract.mechanicsCount, heroContract.linksCount, heroContract.lawsCount])

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

      {/* Hero: first viewport reset */}
      <header
        ref={heroRef}
        className="relative min-h-[100svh] px-6 pt-14 pb-12 flex items-center"
        style={{ background: `radial-gradient(ellipse at center, ${theme.heroGradient} 0%, transparent 100%)` }}
      >
        <div className="absolute inset-0 bg-linear-to-b from-[#050508]/10 via-[#050508]/60 to-[#050508] pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10 w-full">
          <div className="max-w-3xl flex flex-col gap-6 md:gap-7">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-white/10 rounded-full text-[10px] tracking-[0.28em] font-bold text-white/65 bg-white/5 backdrop-blur-xl uppercase">
                <span className={`w-1.5 h-1.5 rounded-full ${isSystemMode ? 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]' : 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]'}`} />
                Archive Active · {heroContract.systemType} system
              </div>
            </div>

            <h1
              key={isSystemMode ? 'sys' : 'lore'}
              className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight uppercase leading-[0.95] transition-colors duration-700 ${isRevealing && revealStep === 1 ? 'text-white drop-shadow-[0_0_14px_rgba(255,255,255,0.55)]' : 'text-white'}`}
            >
              {heroContract.title}
            </h1>

            <p className="text-[11px] md:text-xs uppercase tracking-[0.18em] text-cyan-200/85 max-w-2xl">
              {heroContract.microHook}
            </p>

            <p className="text-sm md:text-base text-gray-200/95 max-w-2xl leading-relaxed">
              {heroContract.thesis}
            </p>

            <div className="inline-flex w-fit items-center gap-2 md:gap-3 rounded-full border border-white/15 bg-white/10 backdrop-blur-md px-3 py-1.5">
              {proofStrip.map((item, index) => (
                <div key={item} className="flex items-center gap-2">
                  {index > 0 && <span className="h-3 w-px bg-white/20" />}
                  <span className="text-[10px] md:text-[11px] font-bold tracking-[0.22em] uppercase text-white/85">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => handleJumpToSection(heroContract.primaryTabIndex, 'analysis-start')}
                className="px-5 py-3 min-h-[44px] rounded-full text-[10px] font-bold tracking-[0.2em] uppercase border transition-all duration-300"
                style={{ borderColor: `${theme.primary}80`, color: '#020617', backgroundColor: theme.primary, boxShadow: `0 0 24px ${theme.glow}` }}
              >
                Open System
              </button>
            </div>
            <p className="text-[10px] text-gray-500 tracking-[0.18em] uppercase">
              Primary path: {TABS[heroContract.primaryTabIndex]}
            </p>
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
          {bestParallel?.entry && (
            <p className="mt-4 text-[11px] text-gray-400">
              If you understood this system, continue with:{' '}
              <Link to={`/universe/${bestParallel.entry.id}`} className="text-cyan-300 hover:text-cyan-200">
                {bestParallel.entry.anime}
              </Link>
              .
            </p>
          )}
        </div>
      </section>

      <div className="share-frame-hide">
        <SystemQuestionsPanel data={data} onJumpToSection={handleJumpToSection} relatedUniverses={relatedUniverses} />
      </div>

      {/* 5-Bullet System Summary */}
      <SystemSummary data={data} isSystemMode={isSystemMode} theme={theme} revealStep={revealStep} isRevealing={isRevealing} />

      <div className="max-w-6xl mx-auto px-6 mt-2 mb-5 share-frame-hide flex items-start justify-between gap-4 flex-wrap">
        <div className="text-[10px] text-gray-500 tracking-[0.18em] uppercase">{bestEntry.label}</div>
        <div className="w-full md:w-auto">
          <Toggle isSystemMode={isSystemMode} setIsSystemMode={setIsSystemMode} theme={theme} />
        </div>
      </div>

      {/* Mobile Sticky Footer - Solo Leveling ONLY (always visible at bottom) */}
      {data?.id === 'sololeveling' && (
        <div className={`fixed bottom-[max(env(safe-area-inset-bottom),0px)] left-0 right-0 p-3 bg-black/88 backdrop-blur-xl border-t border-cyan-400/30 z-50 md:hidden transition-all duration-300 ${
          showMonetizationBar ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}>
          <div className="max-w-6xl mx-auto flex items-center justify-between px-3">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1z"/>
              </svg>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-white">Solo Leveling Series</span>
                <span className="text-[9px] text-gray-400">Complete • 25 eps • English subs</span>
              </div>
            </div>
            <a
              href="https://www.amazon.com/dp/B0G3PC5LX2/ref=cm_sw_r_as_gl_apa_gl_i_4B03CWS4T2XWERHGFR58?linkCode=ml1&tag=hashiai-20&linkId=2377a03ae811e823cf9ba44a6d6df18a"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackAffiliateClick('sololeveling-amazon', 'sololeveling', 'amazon')}
              className="text-[11px] font-bold tracking-[0.18em] uppercase text-cyan-400 hover:text-cyan-300 py-2 px-3 bg-cyan-400/10 hover:bg-cyan-400/20 rounded-full transition-colors"
            >
              Buy Now
            </a>
          </div>
        </div>
      )}

      {/* Desktop Subtle Link - End of Page (Solo Leveling only) */}
      {data?.id === 'sololeveling' && (
        <div className="max-w-6xl mx-auto px-6 mt-8 mb-12 mb-16 md:mb-24">
          <p className="text-center text-xs text-gray-500">
            <span className="text-gray-600">Own the complete series on</span>{' '}
            <a
              href="https://www.amazon.com/dp/B0G3PC5LX2/ref=cm_sw_r_as_gl_apa_gl_i_4B03CWS4T2XWERHGFR58?linkCode=ml1&tag=hashiai-20&linkId=2377a03ae811e823cf9ba44a6d6df18a"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackAffiliateClick('sololeveling-amazon', 'sololeveling', 'amazon')}
              className="text-cyan-400 hover:text-cyan-300 underline font-medium"
            >
              Amazon
            </a>
          </p>
        </div>
      )}
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
      </div>

      {/* AI Insight Panel */}
      <div className="share-frame-hide">
        <AIInsightPanel aiInsights={data?.aiInsights} theme={theme} isSystemMode={isSystemMode} revealStep={revealStep} isRevealing={isRevealing} />
      </div>

      {/* Navigation Tabs */}
      <nav id="analysis-start" className="max-w-6xl mx-auto px-6 mb-3 mt-4 flex overflow-x-auto relative flex-nowrap border-b border-white/5 scrollbar-hide share-frame-hide">
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
                    <span className="sr-only">Suggested starting tab</span>
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
        <p className="text-[10px] md:text-xs text-gray-600 tracking-wider">{TAB_DESCRIPTIONS[activeTab]}{activeTab === bestEntry.tabIndex ? ' · Suggested first view.' : ''}</p>
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
