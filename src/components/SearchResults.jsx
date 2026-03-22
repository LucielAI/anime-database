import { useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { Search, User, Zap, Users, ShieldAlert, Globe, ArrowLeft } from 'lucide-react'
import { useSearch } from '../hooks/useSearch'
import SeoHead from './SeoHead'
import { SITE_URL, SITE_NAME } from '../utils/seo'

const TYPE_META = {
  universe: {
    label: 'Universe',
    icon: Globe,
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10 border-cyan-400/30',
    sectionColor: 'border-cyan-400/30',
  },
  character: {
    label: 'Character',
    icon: User,
    color: 'text-violet-400',
    bg: 'bg-violet-400/10 border-violet-400/30',
    sectionColor: 'border-violet-400/30',
  },
  power: {
    label: 'Power',
    icon: Zap,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10 border-amber-400/30',
    sectionColor: 'border-amber-400/30',
  },
  faction: {
    label: 'Faction',
    icon: Users,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10 border-emerald-400/30',
    sectionColor: 'border-emerald-400/30',
  },
  rule: {
    label: 'Rule',
    icon: ShieldAlert,
    color: 'text-rose-400',
    bg: 'bg-rose-400/10 border-rose-400/30',
    sectionColor: 'border-rose-400/30',
  },
}

const GROUP_ORDER = ['universe', 'character', 'power', 'faction', 'rule']

function TypeBadge({ type }) {
  const meta = TYPE_META[type] || TYPE_META.universe
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold tracking-[0.15em] uppercase border ${meta.bg} ${meta.color}`}>
      {meta.label}
    </span>
  )
}

function ResultCard({ item }) {
  const meta = TYPE_META[item.type] || TYPE_META.universe
  const Icon = meta.icon

  return (
    <Link
      to={item.url}
      className="flex items-start gap-4 px-5 py-4 rounded-xl border border-white/8 bg-white/3 hover:bg-white/6 hover:border-white/15 transition-all group"
    >
      <div className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${meta.bg}`}>
        <Icon className={`w-4 h-4 ${meta.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-sm font-bold text-white group-hover:text-cyan-100 transition-colors">{item.name}</span>
          <TypeBadge type={item.type} />
          {item.title && item.type !== 'universe' && (
            <span className="text-[10px] text-gray-500 italic">{item.title}</span>
          )}
        </div>
        {item.anime && item.type !== 'universe' && (
          <p className="text-[10px] tracking-[0.14em] uppercase text-gray-500 mb-1">{item.anime}</p>
        )}
        {item.description && (
          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{item.description}</p>
        )}
      </div>
    </Link>
  )
}

function ResultSection({ type, items }) {
  if (!items || items.length === 0) return null
  const meta = TYPE_META[type]
  const Icon = meta.icon

  return (
    <section className={`border-l-2 pl-4 ${meta.sectionColor}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${meta.color}`} />
        <h2 className={`text-[10px] font-bold tracking-[0.22em] uppercase ${meta.color}`}>
          {meta.label}s
          <span className="ml-2 text-gray-600 font-normal">({items.length})</span>
        </h2>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <ResultCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const navigate = useNavigate()
  const { query, setQuery, grouped, isLoading, isReady, loadIndex, results } = useSearch()

  // Load index on mount
  useEffect(() => {
    loadIndex()
  }, [loadIndex])

  // Sync URL param → hook query
  useEffect(() => {
    if (q !== query) setQuery(q)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const hasResults = GROUP_ORDER.some((type) => grouped[type]?.length > 0)
  const totalResults = results.length

  function handleSubmit(e) {
    e.preventDefault()
    if (query.trim()) {
      setSearchParams({ q: query.trim() })
    }
  }

  const seoTitle = q
    ? `Search: "${q}" — Anime Architecture Archive`
    : 'Search — Anime Architecture Archive'
  const seoDescription = q
    ? `${totalResults} result${totalResults !== 1 ? 's' : ''} for "${q}" across all anime universes.`
    : 'Search across all 15 anime universes for characters, power systems, factions, and rules.'

  const canonicalUrl = `https://animearchive.app/search${q ? `?q=${encodeURIComponent(q)}` : ''}`

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'SearchResultsPage',
      name: seoTitle,
      description: seoDescription,
      url: canonicalUrl,
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: `${SITE_URL}/` },
    },
  ]

  return (
    <div className="min-h-screen bg-[#050508] text-white font-mono px-6 py-14">
      <SeoHead
        title={seoTitle}
        description={seoDescription}
        canonicalUrl={canonicalUrl}
        structuredData={structuredData}
      />

      <main className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
          <Link to="/universes" className="text-[10px] tracking-[0.2em] uppercase text-gray-400 hover:text-white transition-colors">
            Browse Catalog
          </Link>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight mb-2">
          {q ? <>Results for <span className="text-cyan-400">"{q}"</span></> : 'Cross-Universe Search'}
        </h1>
        <p className="text-xs text-gray-400 mb-8">
          {isLoading && !isReady
            ? 'Loading search index…'
            : q && hasResults
            ? `${totalResults} result${totalResults !== 1 ? 's' : ''} across all universes`
            : q && !hasResults && isReady
            ? 'No results found'
            : 'Search across characters, powers, factions, and rules from all 15 universes'}
        </p>

        {/* Search form */}
        <form onSubmit={handleSubmit} className="mb-10">
          <label className="flex items-center gap-3 border border-cyan-400/40 rounded-xl px-4 py-3 bg-white/5 focus-within:border-cyan-400/80 transition-colors">
            <Search className="w-4 h-4 text-cyan-400 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search characters, powers, factions, rules..."
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none tracking-wide"
              autoComplete="off"
              spellCheck={false}
            />
            {query && (
              <button
                type="submit"
                className="text-[9px] tracking-[0.2em] uppercase text-cyan-400 hover:text-cyan-300 transition-colors shrink-0"
              >
                Search
              </button>
            )}
          </label>
        </form>

        {/* Empty state */}
        {!q && (
          <div className="text-center py-16 border border-white/5 rounded-2xl bg-white/2">
            <Search className="w-10 h-10 text-gray-700 mx-auto mb-4" />
            <p className="text-sm text-gray-500 mb-2">Enter a search term above</p>
            <p className="text-[10px] tracking-[0.14em] uppercase text-gray-700">Characters · Powers · Factions · Rules · Universes</p>
          </div>
        )}

        {/* No results */}
        {q && !isLoading && isReady && !hasResults && (
          <div className="text-center py-16 border border-white/5 rounded-2xl">
            <p className="text-sm text-gray-400 mb-2">No results for <span className="text-white">"{q}"</span></p>
            <p className="text-xs text-gray-600 mb-6">Try a different term — character names, anime titles, or power types work well</p>
            <Link
              to="/universes"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-[10px] tracking-[0.2em] uppercase text-gray-300 hover:text-white hover:border-white/20 transition-colors"
            >
              Browse all universes
            </Link>
          </div>
        )}

        {/* Loading */}
        {isLoading && !isReady && q && (
          <div className="text-center py-16">
            <p className="text-sm text-gray-500">Loading index…</p>
          </div>
        )}

        {/* Results grouped by type */}
        {hasResults && (
          <div className="flex flex-col gap-8">
            {GROUP_ORDER.map((type) => (
              <ResultSection key={type} type={type} items={grouped[type]} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
