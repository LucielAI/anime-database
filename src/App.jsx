import React, { useEffect, lazy, Suspense, useMemo, useState, useRef } from 'react'
import { Routes, Route, useNavigate, useParams, Link, useLocation, useSearchParams } from 'react-router-dom'
import { UNIVERSE_CATALOG, UNIVERSE_CATALOG_MAP, loadUniverseBySlug, warmUniverseBySlug } from './data/index.js'
import { ExternalLink, ArrowRight, Star, ListFilter, Search, Compass, Route as RouteIcon, LibraryBig, Network, ShieldAlert, Clock3, Landmark, Repeat2, Coins, BookOpen } from 'lucide-react'
import { getClassificationLabel } from './utils/getClassificationLabel'
import SeoHead from './components/SeoHead'
import {
  buildHomeSeo,
  buildHomeStructuredData,
  buildUniverseSeo,
  buildUniverseStructuredData,
  buildCatalogSeo,
  buildCatalogStructuredData,
  SITE_NAME
} from './utils/seo'
import { sortCatalogUniverses, filterCatalogUniverses, incrementUniverseLocalView, getDiscoveryClusters, getRelatedUniverseSuggestions } from './utils/discovery'
import { DISCOVERY_CLUSTERS } from './data/discoveryMetadata'
import {
  getHomepageFeaturedUniverses,
  getHomepageRequestCandidates,
  getSystemStructureGroups,
  getHomepageContinuation,
  getHomepageClusterLinks,
  getHomepageBrowsePreview,
  getHomepageQuickInsights,
  buildUniverseComparison,
  getHomepageHighlightLeaders,
} from './config/homepageContract'
import NotFound from './components/NotFound'
import About from './components/About'
import Privacy from './components/Privacy'
import CompareRoute from './components/CompareRoute'
import GlobalSearch from './components/GlobalSearch'
import { trackExternalLink } from './utils/analytics'

const Dashboard = lazy(() => import('./Dashboard'))
const CommunityPulse = lazy(() => import('./components/CommunityPulse'))
const NewsletterCTA = lazy(() => import('./components/NewsletterCTA'))
const InsightsRoute = lazy(() => import('./components/InsightsRoute'))
const InsightPost = lazy(() => import('./components/InsightPost'))
const SearchResults = lazy(() => import('./components/SearchResults'))
const ThematicPage = lazy(() => import('./components/ThematicPage'))
const BlogIndex = lazy(() => import('./components/BlogIndex'))
const BlogPost = lazy(() => import('./components/BlogPost'))
const CharacterPage = lazy(() => import('./components/CharacterPage'))
const PowerSystemPage = lazy(() => import('./components/PowerSystemPage'))
const FactionPage = lazy(() => import('./components/FactionPage'))

const SUPPORT_URL = 'https://buymeacoffee.com/hashiai'


function scheduleIdleTask(callback, timeout = 1000) {
  if (typeof window === 'undefined') return null

  if (typeof window.requestIdleCallback === 'function') {
    return window.requestIdleCallback(callback, { timeout })
  }

  return window.setTimeout(() => {
    callback({
      didTimeout: true,
      timeRemaining: () => 0,
    })
  }, timeout)
}

function cancelIdleTask(handle) {
  if (handle == null || typeof window === 'undefined') return

  if (typeof window.cancelIdleCallback === 'function') {
    window.cancelIdleCallback(handle)
    return
  }

  clearTimeout(handle)
}

function RouteScrollReset() {
  const location = useLocation()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!location.pathname.startsWith('/universe/')) {
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [location.pathname])

  return null
}

function UniverseLinkCard({ data, compact = false, density = 'default', priorityImage = false }) {
  const theme = data.themeColors || { primary: '#374151', glow: 'rgba(255,255,255,0.1)' }
  const classLabel = getClassificationLabel(data.visualizationHint)
  const isCatalogDense = density === 'catalog'
  const [imageFailed, setImageFailed] = useState(false)
  const [viewCount] = useState(() => {
    if (typeof window === 'undefined') return 0
    const stored = JSON.parse(window.localStorage.getItem('anime-archive:view-counts:v1') || '{}')
    return Number(stored[data.id] || 0)
  })

  // Prefetch universe data on hover
  const linkRef = useRef(null)
  const handleMouseEnter = () => warmUniverseBySlug(data.id)

  return (
    <Link
      ref={linkRef}
      to={`/universe/${data.id}`}
      onMouseEnter={handleMouseEnter}
      className="group cursor-pointer bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden hover:-translate-y-1 transition-all duration-300 relative flex flex-col focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
      style={{ border: `1px solid ${theme.primary}` }}
    >
      <div className="relative w-full overflow-hidden shrink-0" style={{ aspectRatio: compact || isCatalogDense ? '16/9' : '16/10' }}>
        {data.animeImageUrl && !imageFailed ? (
          <img
            src={data.animeImageUrl}
            alt={`${data.anime} universe cover art`}
            width={400}
            height={250}
            loading={priorityImage ? 'eager' : 'lazy'}
            fetchPriority={priorityImage ? 'high' : 'auto'}
            decoding="async"
            sizes={isCatalogDense ? '(max-width: 640px) 92vw, (max-width: 1024px) 48vw, 32vw' : '(max-width: 1024px) 88vw, 31vw'}
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover object-center opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full" style={{ background: `radial-gradient(ellipse at 50% 40%, ${theme.primary}15 0%, transparent 60%), linear-gradient(160deg, #0a0a14 0%, #0d0f1a 50%, ${theme.primary}0a 100%)` }} />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-[#050508] to-transparent pointer-events-none" />
        {viewCount > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[9px] text-gray-400 font-mono">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
            {viewCount.toLocaleString()}
          </div>
        )}
      </div>

      <div className={`grow flex flex-col justify-end p-4 md:p-6`}>
        <div className="inline-flex items-center self-start px-2 py-0.5 rounded text-[10px] font-bold tracking-[0.15em] uppercase mb-2 border" style={{ color: theme.primary, borderColor: `${theme.primary}40`, backgroundColor: `${theme.primary}10` }}>
          {classLabel}
        </div>
        <h3 className={`font-bold uppercase text-white truncate ${isCatalogDense ? 'text-base' : 'text-lg'}`}>{data.anime}</h3>
        <p className={`text-gray-500 leading-relaxed mt-1 ${isCatalogDense ? 'text-[10px] line-clamp-3' : 'text-[11px] line-clamp-2'}`}>{data.tagline}</p>
      </div>
    </Link>
  )
}


function FeaturedPrimaryCard({ entry, className = '', priority = false }) {
  const [imageFailed, setImageFailed] = useState(false)
  if (!entry) return null

  return (
    <Link
      to={`/universe/${entry.id}`}
      className={`group rounded-xl border border-white/10 bg-white/5 overflow-hidden transition-all hover:border-cyan-400/40 ${className}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 h-full min-h-[320px]">
        <div className="relative h-full overflow-hidden">
          {entry.animeImageUrl && !imageFailed ? (
            <>
              <img
                src={entry.animeImageUrl}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover object-center opacity-25 blur-sm scale-105"
                loading={priority ? 'eager' : 'lazy'}
                decoding="async"
                onError={() => setImageFailed(true)}
              />
              <img
                src={entry.animeImageUrl}
                alt={`${entry.anime} featured universe artwork`}
                className="relative w-full h-full object-cover object-center opacity-90 group-hover:scale-105 transition-transform duration-500"
                loading={priority ? 'eager' : 'lazy'}
                fetchPriority={priority ? 'high' : 'auto'}
                decoding="async"
                sizes="(max-width: 1024px) 90vw, 45vw"
                onError={() => setImageFailed(true)}
              />
            </>
          ) : (
            <div className="w-full h-full" style={{ background: 'linear-gradient(150deg, #111827 0%, #0b1220 55%, #030712 100%)' }} />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-[#050508] via-[#050508]/50 to-transparent" />
        </div>

        <div className="p-6 flex flex-col justify-between min-h-[170px]">
          <div>
            <p className="text-[10px] text-cyan-300 tracking-[0.2em] uppercase mb-2">Best Place to Start</p>
            <h3 className="text-xl md:text-2xl font-bold uppercase mb-2 leading-tight">{entry.anime}</h3>
            <p className="text-xs text-gray-400 leading-relaxed">{entry.tagline}</p>
          </div>
          <span className="mt-4 inline-flex items-center gap-2 text-xs text-white/80 uppercase tracking-[0.15em]">Open breakdown <ArrowRight className="w-3.5 h-3.5" /></span>
        </div>
      </div>
    </Link>
  )
}

const STRUCTURE_VISUALS = {
  'relational-systems': { icon: Network, tone: 'border-cyan-400/50 hover:border-cyan-400/80 shadow-[0_0_0_1px_rgba(34,211,238,0.15)]', badge: 'text-cyan-200 bg-cyan-400/10' },
  'counterplay-systems': { icon: ShieldAlert, tone: 'border-amber-400/50 hover:border-amber-400/80 shadow-[0_0_0_1px_rgba(251,191,36,0.15)]', badge: 'text-amber-200 bg-amber-400/10' },
  'timeline-systems': { icon: Clock3, tone: 'border-purple-400/50 hover:border-purple-400/80 shadow-[0_0_0_1px_rgba(196,181,253,0.15)]', badge: 'text-purple-200 bg-purple-400/10' },
  'control-systems': { icon: Landmark, tone: 'border-rose-400/50 hover:border-rose-400/80 shadow-[0_0_0_1px_rgba(251,113,133,0.15)]', badge: 'text-rose-200 bg-rose-400/10' },
  'closed-loop-systems': { icon: Repeat2, tone: 'border-emerald-400/50 hover:border-emerald-400/80 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]', badge: 'text-emerald-200 bg-emerald-400/10' },
  'power-economy-systems': { icon: Coins, tone: 'border-indigo-400/50 hover:border-indigo-400/80 shadow-[0_0_0_1px_rgba(129,140,248,0.15)]', badge: 'text-indigo-200 bg-indigo-400/10' },
}

// CRO: Newsletter CTA Hero - compact inline version for above-fold conversion
function NewsletterCTAHero() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const lastSubmitTime = useRef(0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const now = Date.now()
    if (now - lastSubmitTime.current < 5000) return
    lastSubmitTime.current = now

    const trimmed = email.trim()
    if (!trimmed.includes('@')) return

    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      })
      if (res.ok) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10">
        <div className="w-5 h-5 rounded-full bg-emerald-400/20 flex items-center justify-center">
          <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-[11px] font-mono tracking-wider text-emerald-300 uppercase">You&apos;re in. New universes drop first.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full">
      <input
        type="email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle') }}
        placeholder="your@email.com"
        maxLength={254}
        disabled={status === 'loading'}
        className="flex-1 min-h-[44px] bg-white/5 border border-white/20 focus:border-cyan-400/60 rounded-full px-4 py-2.5 text-xs text-gray-200 placeholder:text-gray-500 outline-none transition-colors font-mono"
      />
      <button
        type="submit"
        disabled={status === 'loading' || !email.trim()}
        className="min-h-[44px] px-5 py-2.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-[#020617] text-[10px] font-bold tracking-[0.18em] uppercase transition-colors disabled:opacity-40 whitespace-nowrap font-mono"
      >
        {status === 'loading' ? '...' : 'Get Notified'}
      </button>
    </form>
  )
}

function Home() {
  const [sortMode, setSortMode] = useState('latest')
  const [deferSecondary, setDeferSecondary] = useState(false)
  const [compareLeftId, setCompareLeftId] = useState(UNIVERSE_CATALOG[0]?.id || '')
  const [lastViewed] = useState(() => {
    if (typeof window === 'undefined') return null
    const last = String(window.localStorage.getItem('anime-archive:last-viewed:v1') || '').trim().toLowerCase()
    return last && UNIVERSE_CATALOG_MAP[last] ? UNIVERSE_CATALOG_MAP[last] : null
  })
  const [compareRightId, setCompareRightId] = useState(UNIVERSE_CATALOG[1]?.id || '')
  const [blogPosts, setBlogPosts] = useState([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    fetch('/blog-index.json')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.posts) setBlogPosts(data.posts.slice(0, 3))
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = '/blog-index.json'
    link.as = 'fetch'
    document.head.appendChild(link)
    return () => { document.head.removeChild(link) }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const token = scheduleIdleTask(() => setDeferSecondary(true), 1200)
    return () => cancelIdleTask(token)
  }, [])

  const featuredUniverses = useMemo(() => getHomepageFeaturedUniverses(UNIVERSE_CATALOG, 3), [])
  const structureGroups = useMemo(() => getSystemStructureGroups(UNIVERSE_CATALOG, 6), [])
  const continuation = useMemo(() => getHomepageContinuation(UNIVERSE_CATALOG), [deferSecondary])
  const clusterLinks = useMemo(() => getHomepageClusterLinks(UNIVERSE_CATALOG, 4), [])
  const previewUniverses = useMemo(() => getHomepageBrowsePreview(UNIVERSE_CATALOG, sortMode, 6), [sortMode])
  const requestCandidates = useMemo(() => getHomepageRequestCandidates(UNIVERSE_CATALOG, 6).map((row) => row.anime), [])
  const quickInsights = useMemo(() => getHomepageQuickInsights(UNIVERSE_CATALOG, 3), [])
  const highlights = useMemo(() => getHomepageHighlightLeaders(UNIVERSE_CATALOG), [])
  const comparison = useMemo(() => {
    const left = UNIVERSE_CATALOG.find((entry) => entry.id === compareLeftId)
    const right = UNIVERSE_CATALOG.find((entry) => entry.id === compareRightId)
    return buildUniverseComparison(left, right)
  }, [compareLeftId, compareRightId])
  const seo = buildHomeSeo(UNIVERSE_CATALOG)
  const structuredData = buildHomeStructuredData(UNIVERSE_CATALOG, {
    featuredUniverses,
    structureGroups,
  })

  const totalEntities = UNIVERSE_CATALOG.reduce((sum, a) => sum + (a.stats?.characters || 0), 0)

  return (
    <div className="min-h-screen bg-[#050508] text-white font-mono selection:bg-cyan-500/30 overflow-x-hidden relative">
      <SeoHead {...seo} structuredData={structuredData} />

      <header className="w-full relative py-20 md:py-24 px-6 border-b border-white/5 flex flex-col items-center text-center" style={{ background: 'radial-gradient(ellipse at center, #101634 0%, #050508 100%)' }}>
        <p className="text-[10px] md:text-xs text-cyan-300/80 tracking-[0.24em] uppercase font-bold mb-3">For Anime Fans Who Love Deep Breakdowns</p>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight uppercase mb-3 text-white leading-[0.96]">
          Analyze Anime Power Systems
        </h1>
        <p className="text-sm md:text-base text-cyan-300/85 tracking-[0.2em] uppercase font-bold">Compare anime worlds by power, strategy, and worldbuilding</p>
        <p className="mt-6 text-xs md:text-sm text-gray-300/80 max-w-2xl leading-relaxed">
          Find the best anime systems, compare anime power systems side-by-side, and explore the mechanics behind each world in minutes.
        </p>
        <div className="mt-7 flex flex-col items-center gap-4">
          {/* Primary CTA: Newsletter Signup - CRO: "impossible to miss" */}
          <div className="w-full max-w-md">
            <NewsletterCTAHero />
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 flex-wrap justify-center">
            <Link
              to="/compare"
              className="flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 hover:bg-emerald-400/20 text-[10px] font-bold tracking-[0.18em] uppercase text-emerald-300 hover:text-emerald-200 transition-colors"
            >
              <Network className="w-3.5 h-3.5" />
              Compare Two Systems
            </Link>
            <a
              href="#explore-system-structure"
              className="flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-full border border-cyan-300/40 bg-cyan-400/10 hover:bg-cyan-400/15 text-[10px] font-bold tracking-[0.18em] uppercase text-cyan-100 hover:text-white transition-colors"
            >
              Explore System Structures
            </a>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Link to="/universes" className="text-[10px] tracking-[0.16em] uppercase text-gray-400 hover:text-white transition-colors">Browse all universes →</Link>
            <button onClick={() => setSearchOpen(true)} className="flex items-center gap-1.5 text-[10px] tracking-[0.14em] uppercase px-3 py-1.5 rounded-full border border-white/10 hover:border-cyan-400/40 text-gray-400 hover:text-cyan-400 bg-white/5 hover:bg-cyan-400/10 transition-all">
              <Search className="w-3.5 h-3.5" />
              Search
            </button>
          </div>

          {/* Returning visitor: pick up where you left off */}
          {lastViewed && (
            <div className="mt-4 flex items-center gap-3 px-4 py-2.5 rounded-xl border border-cyan-400/20 bg-cyan-400/5 backdrop-blur-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <p className="text-[10px] text-gray-400">
                <span className="text-cyan-300">Continue reading: </span>
                <Link to={`/universe/${lastViewed.id}`} className="text-white underline underline-offset-2 hover:text-cyan-300 transition-colors">
                  {lastViewed.anime}
                </Link>
              </p>
            </div>
          )}

          {/* Archive stats bar */}
          <div className="mt-5 flex flex-wrap justify-center gap-4 text-[10px] text-gray-500 tracking-widest uppercase">
            <span>{UNIVERSE_CATALOG.length} Universes</span>
            <span className="text-white/10">·</span>
            <span>{UNIVERSE_CATALOG.reduce((s, a) => s + (a.stats?.characters || 0), 0)} Characters</span>
            <span className="text-white/10">·</span>
            <span>{new Set(UNIVERSE_CATALOG.map((a) => a.visualizationHint)).size} System Types</span>
          </div>
        </div>
      </header>

      <main id="main-content">
      <section className="max-w-5xl mx-auto px-6 pt-6 pb-2" aria-label="Anime analysis overview">
        <p className="text-[11px] text-gray-500 leading-relaxed">
          Anime Architecture Archive helps you compare how different shows handle power, fights, and world rules.
          Pick a style, jump into a title, and see what makes each world work.
        </p>
      </section>
      <section id="explore-system-structure" className="max-w-6xl mx-auto px-6 pt-12 pb-10" aria-labelledby="explore-structure-heading">
        <div className="flex items-center gap-2 mb-4">
          <Compass className="w-4 h-4 text-cyan-300" />
          <h2 id="explore-structure-heading" className="text-sm font-bold tracking-[0.2em] uppercase">Explore by World Style</h2>
        </div>
        <p className="text-xs text-gray-400 mb-5 max-w-2xl">
          Pick a system style to start exploring.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {structureGroups.map((group) => {
            const visual = STRUCTURE_VISUALS[group.key] || STRUCTURE_VISUALS['relational-systems']
            const Icon = visual.icon
            return (
            <Link
              key={group.key}
              to="/universes"
              className={`group rounded-xl border bg-white/5 p-4 md:p-5 min-h-[132px] transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01] ${visual.tone}`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] tracking-[0.14em] uppercase ${visual.badge}`}>
                  <Icon className="w-3.5 h-3.5" />
                  {group.label}
                </h3>
                <span className="text-[10px] text-gray-300 tracking-[0.14em] uppercase">{group.count}</span>
              </div>
              <p className="text-[11px] text-gray-300/90 leading-relaxed group-hover:text-gray-200">{group.description}</p>
            </Link>
            )
          })}
        </div>
      </section>
      <div className="max-w-6xl mx-auto px-6"><div className="h-px bg-linear-to-r from-transparent via-white/10 to-transparent" /></div>

      <section id="featured-archive-systems" className="max-w-6xl mx-auto px-6 pt-9 pb-8" aria-labelledby="featured-archives-heading">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-4 h-4 text-cyan-300" />
          <h2 id="featured-archives-heading" className="text-sm font-bold tracking-[0.2em] uppercase">Featured Starting Points</h2>
        </div>
        <p className="text-xs text-gray-400 mb-4">Start with fan-favorite picks, then branch into similar shows.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featuredUniverses.map((entry, index) => (
            index === 0
              ? <FeaturedPrimaryCard key={entry.id} entry={entry} priority className="md:col-span-2" />
              : <UniverseLinkCard key={entry.id} data={entry} compact priorityImage={index === 1} />
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {featuredUniverses.map((entry) => (
            <span key={entry.id} className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] tracking-[0.14em] uppercase text-gray-300">
              {entry.id === highlights.mostComplexId && 'Most Complex · '}
              {entry.id === highlights.mostStrategicId && 'Most Strategic · '}
              {entry.anime}
            </span>
          ))}
        </div>
      </section>
      <div className="max-w-6xl mx-auto px-6"><div className="h-px bg-linear-to-r from-transparent via-white/10 to-transparent" /></div>

      <section className="max-w-6xl mx-auto px-6 pt-8 pb-7" aria-labelledby="quick-insights-heading">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 id="quick-insights-heading" className="text-sm text-cyan-300 tracking-[0.2em] uppercase font-bold">Quick Insights</h2>
          <span className="text-[10px] text-gray-500 uppercase tracking-[0.16em]">Easy to share</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {quickInsights.map((item) => (
            <Link
              key={item.id}
              to={`/universe/${item.id}`}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:border-cyan-300/40 transition-colors"
            >
              <p className="text-[10px] text-cyan-200 uppercase tracking-[0.16em] mb-2">{item.anime}</p>
              <p className="text-xs text-gray-200 leading-relaxed">“{item.insight}”</p>
            </Link>
          ))}
        </div>
      </section>
      <div className="max-w-6xl mx-auto px-6"><div className="h-px bg-linear-to-r from-transparent via-white/10 to-transparent" /></div>

      <section className="max-w-6xl mx-auto px-6 pt-8 pb-7" aria-labelledby="latest-analysis-heading">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-300" />
            <h2 id="latest-analysis-heading" className="text-sm text-cyan-300 tracking-[0.2em] uppercase font-bold">Latest Analysis</h2>
          </div>
          <Link to="/blog" className="text-[10px] tracking-[0.16em] uppercase text-gray-400 hover:text-white">All posts →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.02] hover:border-cyan-400/30 hover:bg-white/[0.04] transition-all duration-200 p-4"
            >
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.16em]">{post.date}</p>
              <h3 className="text-xs font-bold text-white leading-snug group-hover:text-cyan-100 transition-colors line-clamp-3">{post.title}</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2 mt-auto">{post.description}</p>
            </Link>
          ))}
        </div>
      </section>
      <div className="max-w-6xl mx-auto px-6"><div className="h-px bg-linear-to-r from-transparent via-white/10 to-transparent" /></div>

      <section id="continue-next-paths" className="max-w-6xl mx-auto px-6 pt-8 pb-7" aria-labelledby="continue-pathways-heading">
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 md:px-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h2 id="continue-pathways-heading" className="text-sm text-cyan-300 tracking-[0.2em] uppercase font-bold">Where to Go Next</h2>
            <Link to="/universes" className="text-[10px] tracking-[0.16em] uppercase text-gray-400 hover:text-white">See all titles →</Link>
          </div>
          <div className="mb-4 rounded-xl border border-white/10 bg-[#080a12] p-3 md:p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-200">Compare systems</p>
              <Link
                to={`/compare?left=${compareLeftId}&right=${compareRightId}`}
                className="text-[9px] uppercase tracking-[0.14em] text-gray-500 hover:text-cyan-400 transition-colors"
              >
                Full comparison →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
              <select value={compareLeftId} onChange={(e) => setCompareLeftId(e.target.value)} className="h-10 rounded-lg border border-white/10 bg-black/30 px-2 text-xs">
                {UNIVERSE_CATALOG.map((entry) => <option key={entry.id} value={entry.id}>{entry.anime}</option>)}
              </select>
              <select value={compareRightId} onChange={(e) => setCompareRightId(e.target.value)} className="h-10 rounded-lg border border-white/10 bg-black/30 px-2 text-xs">
                {UNIVERSE_CATALOG.map((entry) => <option key={entry.id} value={entry.id}>{entry.anime}</option>)}
              </select>
            </div>
            {comparison && (
              <div className="rounded-lg border border-white/10 bg-white/5 overflow-hidden">
                <div className="grid grid-cols-2 border-b border-white/10">
                  <p className="px-3 py-2 text-[10px] uppercase tracking-[0.15em] text-cyan-200">{comparison.left.anime}</p>
                  <p className="px-3 py-2 text-[10px] uppercase tracking-[0.15em] text-cyan-200 border-l border-white/10">{comparison.right.anime}</p>
                </div>
                {[
                  { label: 'System Type', left: comparison.left.powerSystemType, right: comparison.right.powerSystemType },
                  { label: 'Combat Style', left: comparison.left.combatStyle, right: comparison.right.combatStyle },
                  { label: 'Complexity', left: String(comparison.left.complexity), right: String(comparison.right.complexity) },
                  { label: 'Strategy | Power', left: comparison.left.strategyVsRaw, right: comparison.right.strategyVsRaw },
                ].map((row) => (
                  <div key={row.label} className="grid grid-cols-1 md:grid-cols-[160px_1fr_1fr] border-b border-white/10 last:border-b-0 hover:bg-white/5">
                    <p className="px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-gray-500 bg-black/20">{row.label}</p>
                    <p className="px-3 py-2 text-[11px] text-gray-200">{row.left}</p>
                    <p className="px-3 py-2 text-[11px] text-gray-200 border-l border-white/10">{row.right}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="text-[11px] text-gray-400 mb-3">
            {continuation.continueEntry
              ? `Pick up where you left off with ${continuation.continueEntry.anime}.`
              : 'New here? Start with our top picks below.'}
          </p>
          {continuation.continueEntry && (
            <div className="mb-3">
              <Link
                to={`/universe/${continuation.continueEntry.id}`}
                className="inline-flex items-center gap-2 min-h-[40px] px-3 py-2 rounded-full border border-cyan-300/40 bg-cyan-400/10 hover:border-cyan-300/60 text-[10px] tracking-[0.16em] uppercase text-gray-100 transition-colors"
              >
                <RouteIcon className="w-3.5 h-3.5" />
                Continue {continuation.continueEntry.anime}
              </Link>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mb-3">
            {continuation.nextComparisons.map((row) => (
              <Link
                key={row.entry.id}
                to={`/universe/${row.entry.id}`}
                className="inline-flex items-center gap-2 min-h-[40px] px-3 py-2 rounded-full border border-white/10 bg-[#090b14] hover:border-cyan-300/40 text-[10px] tracking-[0.16em] uppercase text-gray-200 transition-colors"
              >
                <span>{row.entry.anime}</span>
                <span className="text-gray-500 normal-case tracking-normal">{row.reason}</span>
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {continuation.editorPicks.map((entry) => (
              <Link
                key={entry.id}
                to={`/universe/${entry.id}`}
                className="inline-flex items-center gap-2 min-h-[40px] px-3 py-2 rounded-full border border-emerald-300/30 bg-emerald-500/5 hover:border-emerald-300/50 text-[10px] tracking-[0.16em] uppercase text-gray-200 transition-colors"
              >
                <LibraryBig className="w-3.5 h-3.5 text-emerald-300" />
                Top pick: {entry.anime}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {clusterLinks.map((cluster) => (
              <Link
                key={cluster.key}
                to={`/universes?cluster=${cluster.key}`}
                className="inline-flex items-center gap-2 min-h-[36px] px-3 py-1.5 rounded-full border border-white/10 bg-[#090b14] hover:border-cyan-300/40 text-[10px] tracking-[0.12em] uppercase text-gray-300 transition-colors"
              >
                <span>Compare in {cluster.shortLabel}</span>
                <span className="text-gray-500">{cluster.count} universes</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-4" aria-labelledby="archive-browse-heading">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h2 id="archive-browse-heading" className="text-sm text-cyan-300 tracking-[0.2em] uppercase font-bold">Browse Universes</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'latest', label: 'Latest' },
              { id: 'most-viewed', label: 'Most Viewed' },
              { id: 'alphabetical', label: 'Alphabetical' }
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => setSortMode(mode.id)}
                className={`px-3 py-2 rounded-full text-[10px] uppercase tracking-[0.16em] border transition-colors ${sortMode === mode.id ? 'text-white border-cyan-300/60 bg-cyan-400/10' : 'text-gray-400 border-white/10 bg-white/5 hover:text-white'}`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {previewUniverses.map((entry) => <UniverseLinkCard key={entry.id} data={entry} />)}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/universes" className="px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] uppercase tracking-[0.2em] text-gray-300 hover:text-white transition-colors">
            Browse all universes
          </Link>
          <span className="text-[10px] text-gray-300/70 tracking-[0.15em] uppercase">Showing 6 of {UNIVERSE_CATALOG.length}</span>
        </div>
      </section>

      {deferSecondary && (
        <Suspense fallback={null}>
          <CommunityPulse quickVoteCandidates={requestCandidates} />
        </Suspense>
      )}

      {/* Newsletter */}
      <NewsletterCTA />

      <footer className="pb-10 flex flex-col items-center gap-4 font-mono relative z-10">
        <div className="max-w-4xl text-center px-6">
          <p className="text-[10px] tracking-[0.2em] uppercase text-cyan-300/80">Compare. Discover. Rewatch Smarter.</p>
          <p className="text-[11px] text-gray-400 mt-2">See how your favorite anime worlds handle power, strategy, and big turning points.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <a href="https://www.tiktok.com/@hashi.ai" target="_blank" rel="noreferrer" onClick={() => trackExternalLink('tiktok', 'https://www.tiktok.com/@hashi.ai')} className="group flex items-center gap-2.5 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/30 rounded-full transition-all duration-300">
            <span className="text-[10px] font-bold tracking-[0.2em] text-gray-300 group-hover:text-white transition-colors uppercase">@HASHI.AI</span>
            <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-cyan-400 transition-colors" />
          </a>
          <a href={SUPPORT_URL} target="_blank" rel="noreferrer" onClick={() => trackExternalLink('buymeacoffee', SUPPORT_URL)} className="group flex items-center gap-2.5 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-400/30 rounded-full transition-all duration-300">
            <span className="text-[10px] font-bold tracking-[0.2em] text-gray-300 group-hover:text-white transition-colors uppercase">Support this project</span>
            <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-emerald-400 transition-colors" />
          </a>
        </div>
        <div className="flex flex-wrap justify-center gap-4 text-[10px] tracking-[0.14em] uppercase text-gray-600">
          <a href="/about" className="hover:text-gray-400 transition-colors">About</a>
          <span className="text-gray-700">·</span>
          <a href="/insights" className="hover:text-gray-400 transition-colors">Insights</a>
          <span className="text-gray-700">·</span>
          <a href="/privacy" className="hover:text-gray-400 transition-colors">Privacy</a>
          <span className="text-gray-700">·</span>
          <a href="/search" className="hover:text-gray-400 transition-colors">Search</a>
          <span className="text-gray-700">·</span>
          <a href="https://www.tiktok.com/@hashi.ai" target="_blank" rel="noreferrer" className="hover:text-gray-400 transition-colors">Contact</a>
        </div>
        <p className="text-[10px] tracking-[0.2em] uppercase text-gray-300">Created by Hashi.Ai</p>
      </footer>
      </main>
    </div>
  )
}

function UniversesCatalogRoute() {
  const [search, setSearch] = useState('')
  const [sortMode, setSortMode] = useState('latest')
  const [visibleCount, setVisibleCount] = useState(12)
  const [searchParams] = useSearchParams()
  const activeCluster = searchParams.get('cluster') || ''
  const seo = buildCatalogSeo(UNIVERSE_CATALOG, { activeCluster, sortMode: sortMode !== 'latest' ? sortMode : '' })
  const structuredData = buildCatalogStructuredData(UNIVERSE_CATALOG)
  const clusterOptions = useMemo(() => getDiscoveryClusters(UNIVERSE_CATALOG), [])
  const activeClusterMeta = clusterOptions.find((cluster) => cluster.key === activeCluster) || null
  const activeClusterFeatured = useMemo(() => {
    if (!activeCluster) return []
    return sortCatalogUniverses(filterCatalogUniverses(UNIVERSE_CATALOG, '', activeCluster), 'most-viewed').slice(0, 3)
  }, [activeCluster])

  const filtered = useMemo(() => {
    const sorted = sortCatalogUniverses(UNIVERSE_CATALOG, sortMode)
    return filterCatalogUniverses(sorted, search, activeCluster)
  }, [search, sortMode, activeCluster])

  const visible = filtered.slice(0, visibleCount)
  const canLoadMore = visibleCount < filtered.length

  return (
    <div className="min-h-screen bg-[#050508] text-white font-mono px-6 py-14">
      <SeoHead {...seo} structuredData={structuredData} />
      <main id="catalog-main" className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h1 className="text-2xl md:text-4xl font-bold uppercase tracking-tight">Universe Catalog</h1>
          <Link to="/" className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase text-gray-400 hover:text-white rounded-lg border border-white/10 hover:border-white/20 transition-colors">← Back to Archive</Link>
        </div>
        <p className="text-xs text-gray-300/80 max-w-3xl mb-4">Filter by system type, sort by latest or most viewed, or search to find any universe.</p>

        {/* Archive stats bar */}
        <div className="mb-6 flex flex-wrap justify-start gap-4 text-[10px] text-gray-400 tracking-widest uppercase">
          <span>{UNIVERSE_CATALOG.length} Universes</span>
          <span className="text-white/10">·</span>
          <span>{UNIVERSE_CATALOG.reduce((s, a) => s + (a.stats?.characters || 0), 0)} Characters</span>
          <span className="text-white/10">·</span>
          <span>{new Set(UNIVERSE_CATALOG.map((a) => a.visualizationHint)).size} System Types</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <label className="md:col-span-2 flex items-center gap-2 border border-white/10 rounded-lg px-3 bg-white/5">
            <Search className="w-4 h-4 text-gray-300/70" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search universes..." className="w-full bg-transparent h-11 text-sm outline-none" />
          </label>
          <label className="flex items-center gap-2 border border-white/10 rounded-lg px-3 bg-white/5">
            <ListFilter className="w-4 h-4 text-gray-300/70" />
            <select value={sortMode} onChange={(e) => setSortMode(e.target.value)} className="w-full bg-transparent h-11 text-sm outline-none">
              <option className="bg-black" value="latest">Latest</option>
              <option className="bg-black" value="most-viewed">Most Viewed</option>
              <option className="bg-black" value="alphabetical">Alphabetical</option>
            </select>
          </label>
        </div>

        <div className="mb-6 flex flex-nowrap md:flex-wrap gap-2 overflow-x-auto snap-x [&>*]:shrink-0">
          <Link
            to="/universes"
            className={`px-3 py-2.5 rounded-full text-[10px] uppercase tracking-[0.16em] border transition-colors ${activeCluster ? 'text-gray-400 border-white/10 bg-white/5 hover:text-white' : 'text-white border-cyan-300/60 bg-cyan-400/10'}`}
          >
            All Clusters
          </Link>
          {clusterOptions.map((cluster) => (
            <Link
              key={cluster.key}
              to={`/universes?cluster=${cluster.key}`}
              className={`px-3 py-2.5 rounded-full text-[10px] uppercase tracking-[0.16em] border transition-colors ${activeCluster === cluster.key ? 'text-white border-cyan-300/60 bg-cyan-400/10' : 'text-gray-400 border-white/10 bg-white/5 hover:text-white'}`}
            >
              {cluster.shortLabel} ({cluster.count})
            </Link>
          ))}
        </div>

        {activeClusterMeta && (
          <div className="mb-6 rounded-xl border border-cyan-300/20 bg-cyan-400/5 p-4">
            <p className="text-[10px] tracking-[0.2em] uppercase text-cyan-200">{activeClusterMeta.label}</p>
            <p className="text-xs text-gray-300 mt-1">{DISCOVERY_CLUSTERS[activeClusterMeta.key]?.description || activeClusterMeta.description}</p>
            {activeClusterFeatured.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {activeClusterFeatured.map((entry) => (
                  <Link
                    key={entry.id}
                    to={`/universe/${entry.id}`}
                    className="inline-flex min-h-[40px] items-center rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] tracking-[0.15em] uppercase text-gray-200 hover:text-white hover:bg-white/10"
                  >
                    {entry.anime}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((entry, index) => <UniverseLinkCard key={entry.id} data={entry} density="catalog" priorityImage={index < 3} />)}
        </div>

        {visible.length === 0 && (
          <p className="mt-6 text-sm text-gray-400">No universes match this filter yet. Try a different cluster or search term.</p>
        )}

        {canLoadMore && (
          <div className="mt-6">
            <button onClick={() => setVisibleCount((c) => c + 12)} className="px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] tracking-[0.2em] uppercase text-gray-300 hover:text-white">
              Load more
            </button>
          </div>
        )}

        {/* Request a Universe CTA */}
        <div className="mt-12 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-6 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300 mb-2">Missing a universe?</p>
          <p className="text-xs text-gray-400 mb-4">Know an anime that would make a great system analysis? Submit it and we'll prioritize the most-requested universes.</p>
          <a
            href="https://www.tiktok.com/@hashi.ai"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-cyan-400 text-[#020617] font-bold text-[10px] tracking-[0.2em] uppercase hover:bg-cyan-300 transition-colors"
          >
            Request on TikTok →
          </a>
        </div>
      </main>
    </div>
  )
}

class DashboardErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050508] text-white font-mono flex items-center justify-center">
          <div className="text-center px-6">
            <p className="text-[10px] tracking-[0.25em] uppercase text-red-400/80 mb-2">Failed to Load</p>
            <p className="text-sm text-gray-400">Something went wrong displaying this universe.</p>
            <a href="/" className="mt-4 inline-block text-[10px] tracking-[0.2em] uppercase text-cyan-400/60 hover:text-cyan-400 transition-colors">← Return to Archive</a>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function UniverseRoute() {
  const navigate = useNavigate()
  const { id } = useParams()
  const normalizedId = useMemo(() => (id || '').trim().toLowerCase(), [id])
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const preview = normalizedId ? UNIVERSE_CATALOG_MAP[normalizedId] : null
  const seo = buildUniverseSeo(preview)
  const structuredData = buildUniverseStructuredData(preview, {
    systemQuestions: data?.systemQuestions,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [normalizedId])

  useEffect(() => {
    if (!normalizedId) return

    const siblings = getRelatedUniverseSuggestions(UNIVERSE_CATALOG, normalizedId, 2)
      .map((row) => row.entry)

    siblings.forEach((entry) => warmUniverseBySlug(entry.id))
  }, [normalizedId])

  useEffect(() => {
    let cancelled = false

    async function resolveUniverse() {
      setIsLoading(true)
      setData(null)
      if (!normalizedId || !UNIVERSE_CATALOG_MAP[normalizedId]) {
        navigate('/', { replace: true })
        return
      }

      if (id !== normalizedId) {
        navigate(`/universe/${normalizedId}`, { replace: true })
        return
      }

      try {
        const payload = await loadUniverseBySlug(normalizedId)
        if (!payload || cancelled) return
        setData(payload)
        incrementUniverseLocalView(normalizedId)
      } catch (error) {
        console.error('[universe-load]', { id: normalizedId, error: error instanceof Error ? error.message : error })
        if (!cancelled) navigate('/', { replace: true })
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    resolveUniverse()

    return () => {
      cancelled = true
    }
  }, [id, navigate, normalizedId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050508] text-white font-mono flex items-center justify-center">
        <SeoHead {...seo} structuredData={structuredData} />
        <div className="text-center px-6">
          <p className="text-[10px] tracking-[0.25em] uppercase text-cyan-300/80 mb-2">Loading Universe</p>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight">{preview?.anime || 'Initializing Archive'}</h1>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="relative">
      <SeoHead {...seo} structuredData={structuredData} />
      <Link to="/universes" className="fixed top-6 left-6 z-50 px-4 py-2 bg-black/60 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] text-gray-300 tracking-[0.2em] uppercase">
        ← Catalog
      </Link>
      <DashboardErrorBoundary>
        <Suspense fallback={<div className="min-h-screen bg-[#050508]" />}>
          <Dashboard data={data} />
        </Suspense>
      </DashboardErrorBoundary>
    </div>
  )
}

function EntityRoute({ type }) {
  const navigate = useNavigate()
  const { id, charIndex, powerIndex, factionIndex } = useParams()
  const normalizedId = (id || '').trim().toLowerCase()
  const entityIndex = Number(charIndex ?? powerIndex ?? factionIndex ?? 0)
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const preview = normalizedId ? UNIVERSE_CATALOG_MAP[normalizedId] : null

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [normalizedId, entityIndex])

  useEffect(() => {
    let cancelled = false

    async function resolve() {
      setIsLoading(true)
      setData(null)
      if (!normalizedId || !UNIVERSE_CATALOG_MAP[normalizedId]) {
        navigate('/', { replace: true })
        return
      }
      try {
        const payload = await loadUniverseBySlug(normalizedId)
        if (!payload || cancelled) return
        setData(payload)
      } catch {
        if (!cancelled) navigate(`/universe/${normalizedId}`, { replace: true })
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    resolve()
    return () => { cancelled = true }
  }, [normalizedId, navigate])

  const canonicalUrl = `${window.location.origin}/universe/${normalizedId}/${type}`
  if (isLoading || !data || !preview) {
    return (
      <>
        <SeoHead
          title={`Loading ${type.charAt(0).toUpperCase() + type.slice(1)}...`}
          description={`Loading ${preview?.anime || 'Archive'} ${type} from Anime Architecture Archive`}
          canonicalUrl={canonicalUrl}
        />
        <div className="min-h-screen bg-[#050508] text-white font-mono flex items-center justify-center">
          <p className="text-[10px] tracking-[0.25em] uppercase text-cyan-300/80">Loading...</p>
        </div>
      </>
    )
  }

  // Defensive bounds check — prevents 404s for stale sitemap URLs with out-of-range indices
  const entities = type === 'character' ? data.characters : type === 'power' ? data.powerSystem : data.factions
  if (entityIndex < 0 || entityIndex >= entities.length) {
    navigate(`/universe/${normalizedId}`, { replace: true })
    return null
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050508]" />}>
      {type === 'character' ? <CharacterPage data={data} preview={preview} charIndex={entityIndex} /> : null}
      {type === 'power' ? <PowerSystemPage data={data} preview={preview} powerIndex={entityIndex} /> : null}
      {type === 'faction' ? <FactionPage data={data} preview={preview} factionIndex={entityIndex} /> : null}
    </Suspense>
  )
}

export default function App() {
  const location = useLocation()
  const [telemetry, setTelemetry] = useState({ SpeedInsights: null, Analytics: null })
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    if (typeof window === 'undefined') return undefined

    const token = scheduleIdleTask(async () => {
      const [speedModule, analyticsModule] = await Promise.all([
        import('@vercel/speed-insights/react'),
        import('@vercel/analytics/react')
      ])

      if (!mounted) return
      setTelemetry({
        SpeedInsights: speedModule.SpeedInsights,
        Analytics: analyticsModule.Analytics
      })
    }, 2500)

    return () => {
      mounted = false
      cancelIdleTask(token)
    }
  }, [])

  useEffect(() => {
    const token = scheduleIdleTask(() => {
      window.goatcounter?.count({
        path: location.pathname,
        title: document.title || SITE_NAME
      })
    }, 500)
    return () => cancelIdleTask(token)
  }, [location.pathname])

  // Global `/` keyboard shortcut to open search
  useEffect(() => {
    function handleKeyDown(e) {
      // Don't intercept when typing in an input/textarea/contenteditable
      const tag = document.activeElement?.tagName
      const isEditable = tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable
      if (isEditable) return

      if (e.key === '/') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <RouteScrollReset />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/universes" element={<UniversesCatalogRoute />} />
        <Route path="/insights" element={<InsightsRoute />} />
        <Route path="/insights/:slug" element={<InsightPost />} />
        <Route path="/universe/:id" element={<UniverseRoute />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/compare" element={<CompareRoute />} />
        <Route path="/universe/:id/character/:charIndex" element={<EntityRoute type="character" />} />
        <Route path="/universe/:id/power/:powerIndex" element={<EntityRoute type="power" />} />
        <Route path="/universe/:id/faction/:factionIndex" element={<EntityRoute type="faction" />} />
        <Route path="/systems/:slug" element={
          <Suspense fallback={<div className="min-h-screen bg-[#050508]" />}>
            <ThematicPage />
          </Suspense>
        } />
        <Route path="/blog" element={
          <Suspense fallback={<div className="min-h-screen bg-[#050508]" />}>
            <BlogIndex />
          </Suspense>
        } />
        <Route path="/blog/:slug" element={
          <Suspense fallback={<div className="min-h-screen bg-[#050508]" />}>
            <BlogPost />
          </Suspense>
        } />
        <Route path="/search" element={
          <Suspense fallback={<div className="min-h-screen bg-[#050508]" />}>
            <SearchResults />
          </Suspense>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Global search modal — triggered by "/" keyboard shortcut only */}
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {telemetry.SpeedInsights ? <telemetry.SpeedInsights /> : null}
      {telemetry.Analytics ? <telemetry.Analytics /> : null}
    </>
  )
}
