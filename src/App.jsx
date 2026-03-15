import { useEffect, lazy, Suspense, useMemo, useState } from 'react'
import { Routes, Route, useNavigate, useParams, Link, useLocation, useSearchParams } from 'react-router-dom'
import { UNIVERSE_CATALOG, UNIVERSE_CATALOG_MAP, loadUniverseBySlug, warmUniverseBySlug } from './data/index.js'
import { ExternalLink, ArrowRight, Star, ListFilter, Search } from 'lucide-react'
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
import { getFeaturedUniverses, sortCatalogUniverses, filterCatalogUniverses, incrementUniverseLocalView, getDiscoveryClusters, getRelatedUniverseSuggestions } from './utils/discovery'
import { DISCOVERY_CLUSTERS } from './data/discoveryMetadata'

const Dashboard = lazy(() => import('./Dashboard'))
const CommunityPulse = lazy(() => import('./components/CommunityPulse'))

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

function UniverseLinkCard({ data, compact = false, density = 'default', priorityImage = false }) {
  const theme = data.themeColors || { primary: '#374151', glow: 'rgba(255,255,255,0.1)' }
  const classLabel = getClassificationLabel(data.visualizationHint)
  const isCatalogDense = density === 'catalog'
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <Link
      to={`/universe/${data.id}`}
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
      </div>

      <div className={`grow flex flex-col justify-end ${isCatalogDense ? 'p-3.5' : 'p-4'}`}>
        <div className="inline-flex items-center self-start px-2 py-0.5 rounded text-[8px] font-bold tracking-[0.2em] uppercase mb-2 border" style={{ color: theme.primary, borderColor: `${theme.primary}40`, backgroundColor: `${theme.primary}10` }}>
          {classLabel}
        </div>
        <h3 className={`font-bold uppercase text-white truncate ${isCatalogDense ? 'text-base' : 'text-lg'}`}>{data.anime}</h3>
        <p className={`text-gray-500 leading-relaxed mt-1 ${isCatalogDense ? 'text-[10px] line-clamp-2' : 'text-[11px] line-clamp-2'}`}>{data.tagline}</p>
      </div>
    </Link>
  )
}


function FeaturedPrimaryCard({ entry, className = '', priority = false }) {
  if (!entry) return null
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <Link
      to={`/universe/${entry.id}`}
      className={`group rounded-xl border border-white/10 bg-white/5 overflow-hidden transition-all hover:border-cyan-400/40 ${className}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 h-full min-h-[320px]">
        <div className="relative h-full min-h-[220px] md:min-h-[320px]" style={{ aspectRatio: '4/3' }}>
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
            <p className="text-[10px] text-cyan-300 tracking-[0.2em] uppercase mb-2">Primary Feature</p>
            <h3 className="text-xl md:text-2xl font-bold uppercase mb-2 leading-tight">{entry.anime}</h3>
            <p className="text-xs text-gray-400 leading-relaxed">{entry.tagline}</p>
          </div>
          <span className="mt-4 inline-flex items-center gap-2 text-xs text-white/80 uppercase tracking-[0.15em]">Enter archive <ArrowRight className="w-3.5 h-3.5" /></span>
        </div>
      </div>
    </Link>
  )
}

function Home() {
  const [sortMode, setSortMode] = useState('latest')
  const seo = buildHomeSeo(UNIVERSE_CATALOG)
  const structuredData = buildHomeStructuredData(UNIVERSE_CATALOG)
  const [deferSecondary, setDeferSecondary] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const token = scheduleIdleTask(() => setDeferSecondary(true), 1200)
    return () => cancelIdleTask(token)
  }, [])

  const sortedUniverses = useMemo(() => sortCatalogUniverses(UNIVERSE_CATALOG, sortMode), [sortMode])
  const previewUniverses = sortedUniverses.slice(0, 6)
  const featuredUniverses = useMemo(() => getFeaturedUniverses(UNIVERSE_CATALOG, 3), [])
  const primaryFeatured = featuredUniverses[0]
  const secondaryFeatured = featuredUniverses.slice(1)
  const discoveryClusters = useMemo(() => getDiscoveryClusters(UNIVERSE_CATALOG).slice(0, 4), [])

  const totalEntities = UNIVERSE_CATALOG.reduce((sum, a) => sum + (a.stats?.characters || 0), 0)

  return (
    <div className="min-h-screen bg-[#050508] text-white font-mono selection:bg-cyan-500/30 overflow-x-hidden relative">
      <SeoHead {...seo} structuredData={structuredData} />

      <header className="w-full relative py-20 md:py-24 px-6 border-b border-white/5 flex flex-col items-center text-center" style={{ background: 'radial-gradient(ellipse at center, #0d0d1f 0%, #050508 100%)' }}>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter uppercase mb-3 bg-linear-to-b from-white to-white/60 bg-clip-text text-transparent">
          Anime Architecture Archive
        </h1>
        <p className="text-sm md:text-base text-cyan-400/60 tracking-[0.25em] uppercase font-bold">Fictional Universe Intelligence System</p>
        <p className="mt-6 text-xs md:text-sm text-gray-300/80 max-w-2xl leading-relaxed">
          Browse a structured archive of fictional universe systems. Discover power mechanics, faction topology, and causal constraints through curated paths that stay fast as the catalog grows.
        </p>
        <div className="mt-8 text-[10px] text-white/30 tracking-widest uppercase flex flex-wrap justify-center gap-4">
          <span>[{UNIVERSE_CATALOG.length}] Universes</span>
          <span>[{totalEntities}] Entities</span>
          <span><Link to="/universes" className="text-cyan-300 hover:text-white transition-colors">Open Universe Catalog →</Link></span>
        </div>
      </header>

      <main id="main-content">
      <section className="max-w-6xl mx-auto px-6 py-10" aria-labelledby="featured-archives-heading">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-4 h-4 text-cyan-300" />
          <h2 id="featured-archives-heading" className="text-sm font-bold tracking-[0.2em] uppercase">Featured Archive Systems</h2>
        </div>

        {primaryFeatured && (
          <>
            <div className="hidden lg:grid grid-cols-1 lg:grid-cols-3 gap-4">
              <FeaturedPrimaryCard entry={primaryFeatured} className="lg:col-span-2" priority />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {secondaryFeatured.map((entry, index) => <UniverseLinkCard key={entry.id} data={entry} compact priorityImage={index === 0} />)}
              </div>
            </div>

            <div className="lg:hidden -mx-1 px-1 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex gap-3 w-max pr-1">
                <FeaturedPrimaryCard entry={primaryFeatured} priority className="snap-start w-[88vw] max-w-[460px] shrink-0" />
                {secondaryFeatured.map((entry, index) => (
                  <div key={entry.id} className="snap-start w-[78vw] max-w-[360px] shrink-0">
                    <UniverseLinkCard data={entry} compact priorityImage={index === 0} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </section>



      <section className="max-w-6xl mx-auto px-6 pb-2" aria-labelledby="cluster-pathways-heading">
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 md:px-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h2 id="cluster-pathways-heading" className="text-sm text-cyan-300 tracking-[0.2em] uppercase font-bold">Browse by System Cluster</h2>
            <Link to="/universes" className="text-[10px] tracking-[0.16em] uppercase text-gray-400 hover:text-white">View full catalog →</Link>
          </div>
          <p className="text-[11px] text-gray-400 mb-3">Quick pathways into related universes without opening the full directory.</p>
          <div className="flex flex-wrap gap-2">
            {discoveryClusters.map(cluster => (
              <Link
                key={cluster.key}
                to={`/universes?cluster=${cluster.key}`}
                className="inline-flex items-center gap-2 min-h-[40px] px-3 py-2 rounded-full border border-white/10 bg-[#090b14] hover:border-cyan-300/40 text-[10px] tracking-[0.16em] uppercase text-gray-200 transition-colors"
              >
                <span>{cluster.shortLabel}</span>
                <span className="text-gray-500">{cluster.count}</span>
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
          <CommunityPulse />
        </Suspense>
      )}

      <footer className="mt-12 pb-10 flex flex-col items-center gap-4 font-mono relative z-10">
        <div className="flex flex-wrap justify-center gap-3">
          <a href="https://www.tiktok.com/@hashi.ai" target="_blank" rel="noreferrer" className="group flex items-center gap-2.5 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/30 rounded-full transition-all duration-300">
            <span className="text-[10px] font-bold tracking-[0.2em] text-gray-300 group-hover:text-white transition-colors uppercase">@HASHI.AI</span>
            <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-cyan-400 transition-colors" />
          </a>
          <a href={SUPPORT_URL} target="_blank" rel="noreferrer" className="group flex items-center gap-2.5 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-400/30 rounded-full transition-all duration-300">
            <span className="text-[10px] font-bold tracking-[0.2em] text-gray-300 group-hover:text-white transition-colors uppercase">Support the archive</span>
            <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-emerald-400 transition-colors" />
          </a>
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
  const seo = buildCatalogSeo(UNIVERSE_CATALOG)
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

  useEffect(() => {
    setVisibleCount(12)
  }, [search, sortMode, activeCluster])

  return (
    <div className="min-h-screen bg-[#050508] text-white font-mono px-6 py-14">
      <SeoHead {...seo} structuredData={structuredData} />
      <main id="catalog-main" className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h1 className="text-2xl md:text-4xl font-bold uppercase tracking-tight">Universe Catalog</h1>
          <Link to="/" className="text-[10px] tracking-[0.2em] uppercase text-gray-400 hover:text-white">← Back Home</Link>
        </div>
        <p className="text-xs text-gray-300/80 max-w-3xl mb-6">Search and sort the archive using lightweight catalog metadata only. Universe payloads still lazy-load when you open a route.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <label className="md:col-span-2 flex items-center gap-2 border border-white/10 rounded-lg px-3 bg-white/5">
            <Search className="w-4 h-4 text-gray-300/70" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search universe, thesis, or tagline..." className="w-full bg-transparent h-11 text-sm outline-none" />
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

        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            to="/universes"
            className={`px-3 py-2 rounded-full text-[10px] uppercase tracking-[0.16em] border transition-colors ${activeCluster ? 'text-gray-400 border-white/10 bg-white/5 hover:text-white' : 'text-white border-cyan-300/60 bg-cyan-400/10'}`}
          >
            All Clusters
          </Link>
          {clusterOptions.map((cluster) => (
            <Link
              key={cluster.key}
              to={`/universes?cluster=${cluster.key}`}
              className={`px-3 py-2 rounded-full text-[10px] uppercase tracking-[0.16em] border transition-colors ${activeCluster === cluster.key ? 'text-white border-cyan-300/60 bg-cyan-400/10' : 'text-gray-400 border-white/10 bg-white/5 hover:text-white'}`}
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
      </main>
    </div>
  )
}

function UniverseRoute() {
  const navigate = useNavigate()
  const { id } = useParams()
  const normalizedId = (id || '').trim().toLowerCase()
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const preview = normalizedId ? UNIVERSE_CATALOG_MAP[normalizedId] : null
  const seo = buildUniverseSeo(preview)
  const structuredData = buildUniverseStructuredData(preview)

  useEffect(() => {
    if (!normalizedId) return

    const siblings = getRelatedUniverseSuggestions(UNIVERSE_CATALOG, normalizedId, 2)
      .map((row) => row.entry)

    siblings.forEach((entry) => warmUniverseBySlug(entry.id))
  }, [normalizedId])

  useEffect(() => {
    let cancelled = false

    async function resolveUniverse() {
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
      <Suspense fallback={<div className="min-h-screen bg-[#050508]" />}>
        <Dashboard data={data} />
      </Suspense>
    </div>
  )
}

export default function App() {
  const location = useLocation()
  const [telemetry, setTelemetry] = useState({ SpeedInsights: null, Analytics: null })

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
    if (window.goatcounter) {
      window.goatcounter.count({
        path: location.pathname,
        title: document.title || SITE_NAME
      })
    }
  }, [location.pathname])

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/universes" element={<UniversesCatalogRoute />} />
        <Route path="/universe/:id" element={<UniverseRoute />} />
      </Routes>
      {telemetry.SpeedInsights && <telemetry.SpeedInsights />}
      {telemetry.Analytics && <telemetry.Analytics />}
    </>
  )
}
