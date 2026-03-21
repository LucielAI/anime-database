import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, Network, ShieldAlert, Clock3, Landmark, Repeat2, Coins } from 'lucide-react'
import SeoHead from './SeoHead'
import { THEMATIC_PAGES, getUniversesForTaxonomy, getThematicPageBySlug } from '../config/thematicPages'
import { getClassificationLabel } from '../utils/getClassificationLabel'
import { SITE_URL, SITE_NAME } from '../utils/seo'

const TAXONOMY_ICONS = {
  'relational-systems': Network,
  'counterplay-systems': ShieldAlert,
  'timeline-systems': Clock3,
  'control-systems': Landmark,
  'closed-loop-systems': Repeat2,
  'power-economy-systems': Coins,
}

const TAXONOMY_ACCENT = {
  'relational-systems': { text: 'text-cyan-400', border: 'border-cyan-400/30', bg: 'bg-cyan-400/10', glow: 'rgba(34,211,238,0.12)' },
  'counterplay-systems': { text: 'text-amber-400', border: 'border-amber-400/30', bg: 'bg-amber-400/10', glow: 'rgba(251,191,36,0.12)' },
  'timeline-systems': { text: 'text-purple-400', border: 'border-purple-400/30', bg: 'bg-purple-400/10', glow: 'rgba(196,181,253,0.12)' },
  'control-systems': { text: 'text-rose-400', border: 'border-rose-400/30', bg: 'bg-rose-400/10', glow: 'rgba(251,113,133,0.12)' },
  'closed-loop-systems': { text: 'text-emerald-400', border: 'border-emerald-400/30', bg: 'bg-emerald-400/10', glow: 'rgba(52,211,153,0.12)' },
  'power-economy-systems': { text: 'text-indigo-400', border: 'border-indigo-400/30', bg: 'bg-indigo-400/10', glow: 'rgba(129,140,248,0.12)' },
}

function UniverseCard({ entry, accent }) {
  const classLabel = getClassificationLabel(entry.visualizationHint)
  const themeColor = (entry.themeColors || {}).primary || '#374151'
  const stats = entry.stats || {}

  return (
    <Link
      to={`/universe/${entry.id}`}
      className="group flex flex-col bg-white/[0.03] rounded-xl overflow-hidden hover:-translate-y-0.5 transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
      style={{ border: `1px solid ${themeColor}40` }}
    >
      {entry.animeImageUrl && (
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9' }}>
          <img
            src={entry.animeImageUrl}
            alt={`${entry.anime} universe cover art`}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-center opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#050508] via-[#050508]/40 to-transparent" />
        </div>
      )}

      <div className="flex flex-col grow p-5">
        <span
          className={`inline-flex self-start items-center px-2 py-0.5 rounded text-[8px] font-bold tracking-[0.2em] uppercase mb-3 border ${accent.border} ${accent.text} ${accent.bg}`}
        >
          {classLabel}
        </span>

        <h3 className="text-base font-bold uppercase text-white mb-1 group-hover:text-cyan-100 transition-colors">
          {entry.anime}
        </h3>

        <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2 mb-4">
          {entry.tagline}
        </p>

        {(stats.characters || stats.powerSystem || stats.rules) && (
          <div className="flex flex-wrap gap-3 mb-4 text-[10px] text-gray-500 tracking-wide">
            {stats.characters > 0 && <span>{stats.characters} entities</span>}
            {stats.powerSystem > 0 && <span>{stats.powerSystem} power mechanics</span>}
            {stats.rules > 0 && <span>{stats.rules} rules</span>}
          </div>
        )}

        <div className={`mt-auto inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.16em] uppercase ${accent.text} group-hover:gap-2.5 transition-all`}>
          Explore this system <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </Link>
  )
}

function OtherSystemCard({ page, isCurrent }) {
  if (isCurrent) return null
  const Icon = TAXONOMY_ICONS[page.slug] || Network
  const accent = TAXONOMY_ACCENT[page.slug] || TAXONOMY_ACCENT['relational-systems']

  return (
    <Link
      to={`/systems/${page.slug}`}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${accent.border} ${accent.bg} hover:border-white/20 transition-all duration-200 group`}
    >
      <Icon className={`w-4 h-4 shrink-0 ${accent.text}`} />
      <div className="min-w-0">
        <div className={`text-[10px] font-bold uppercase tracking-[0.16em] ${accent.text} truncate`}>{page.title}</div>
        <div className="text-[10px] text-gray-500 truncate">{page.description.slice(0, 60)}…</div>
      </div>
      <ArrowRight className="w-3 h-3 text-gray-500 group-hover:text-white ml-auto shrink-0 transition-colors" />
    </Link>
  )
}

export default function ThematicPage() {
  const { slug } = useParams()
  const page = useMemo(() => getThematicPageBySlug(slug), [slug])
  const universes = useMemo(() => (page ? getUniversesForTaxonomy(page.taxonomyKey) : []), [page])

  const accent = TAXONOMY_ACCENT[slug] || TAXONOMY_ACCENT['relational-systems']
  const Icon = TAXONOMY_ICONS[slug] || Network
  const otherPages = THEMATIC_PAGES.filter((p) => p.slug !== slug)

  const canonicalUrl = `${SITE_URL}/systems/${slug}`

  const seoTitle = page
    ? `${page.title} — Anime ${page.title} | ${SITE_NAME}`
    : `System Type | ${SITE_NAME}`

  const seoDescription = page
    ? page.description
    : 'Explore anime universes organized by system structure type.'

  const structuredData = page && universes.length > 0
    ? [
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `${page.title} | ${SITE_NAME}`,
          description: page.description,
          url: canonicalUrl,
          isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: `${SITE_URL}/` },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: page.heading,
          description: page.description,
          url: canonicalUrl,
          numberOfItems: universes.length,
          itemListElement: universes.map((entry, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: `${entry.anime} System Analysis`,
            url: `${SITE_URL}/universe/${entry.id}`,
            description: entry.tagline || '',
          })),
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Archive Home', item: `${SITE_URL}/` },
            { '@type': 'ListItem', position: 2, name: page.title, item: canonicalUrl },
          ],
        },
      ]
    : []

  if (!page) {
    return (
      <div className="min-h-screen bg-[#050508] text-white font-mono flex items-center justify-center">
        <div className="text-center">
          <p className="text-xs text-gray-500 tracking-widest uppercase mb-4">System type not found</p>
          <Link to="/" className="text-cyan-400 text-sm hover:underline">Return to archive →</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white font-mono selection:bg-cyan-500/30 overflow-x-hidden">
      <SeoHead
        title={seoTitle}
        description={seoDescription}
        keywords={page.seoKeywords}
        canonicalUrl={canonicalUrl}
        type="website"
        structuredData={structuredData}
      />

      {/* Nav */}
      <nav className="w-full px-6 py-4 flex items-center justify-between border-b border-white/5 sticky top-0 z-30 backdrop-blur-md bg-[#050508]/90">
        <Link to="/" className="text-[10px] tracking-[0.2em] uppercase text-gray-400 hover:text-white transition-colors">
          ← Archive Home
        </Link>
        <div className="flex items-center gap-4 text-[10px] text-gray-600 tracking-widest uppercase">
          <Link to="/universes" className="hover:text-white transition-colors">Browse All</Link>
          <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
        </div>
      </nav>

      {/* Hero */}
      <header
        className="relative w-full px-6 py-20 md:py-28 flex flex-col items-center text-center overflow-hidden"
        style={{ background: `radial-gradient(ellipse at center, ${accent.glow} 0%, transparent 65%), radial-gradient(ellipse at 80% 20%, ${accent.glow} 0%, transparent 50%), #050508` }}
      >
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${accent.border} ${accent.bg} mb-6`}>
          <Icon className={`w-3.5 h-3.5 ${accent.text}`} />
          <span className={`text-[9px] font-bold tracking-[0.24em] uppercase ${accent.text}`}>{page.title}</span>
        </div>

        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight uppercase text-white leading-tight max-w-4xl mb-5">
          {page.heading}
        </h1>

        <p className="text-sm md:text-base text-gray-300/80 max-w-2xl leading-relaxed mb-8">
          {page.description}
        </p>

        <div className={`inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase ${accent.text}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          {universes.length} universe{universes.length !== 1 ? 's' : ''} in this category
        </div>
      </header>

      {/* Universe Grid */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        {universes.length > 0 ? (
          <section>
            <h2 className={`text-[10px] font-bold tracking-[0.24em] uppercase ${accent.text} mb-8`}>
              Matching Universes — {universes.length} Found
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {universes.map((entry) => (
                <UniverseCard key={entry.id} entry={entry} accent={accent} />
              ))}
            </div>
          </section>
        ) : (
          <div className="text-center py-24">
            <p className="text-xs text-gray-500 tracking-widest uppercase mb-2">No universes found</p>
            <p className="text-[11px] text-gray-600">Check back as the archive grows.</p>
          </div>
        )}

        {/* Cross-links to other system types */}
        <section className="mt-24 pt-12 border-t border-white/5">
          <h2 className="text-[10px] font-bold tracking-[0.24em] uppercase text-gray-500 mb-6">
            Explore Other System Types
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {otherPages.map((otherPage) => (
              <OtherSystemCard key={otherPage.slug} page={otherPage} isCurrent={otherPage.slug === slug} />
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="mt-16 text-center">
          <p className="text-[10px] text-gray-600 tracking-widest uppercase mb-4">Want to see all anime universes?</p>
          <Link
            to="/universes"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-300 hover:border-cyan-400/40 hover:text-white transition-all"
          >
            Browse Full Catalog <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-[10px] text-gray-600 tracking-widest uppercase">
        <p>
          <Link to="/" className="hover:text-gray-400 transition-colors">{SITE_NAME}</Link>
          {' · '}
          <Link to="/about" className="hover:text-gray-400 transition-colors">About</Link>
          {' · '}
          <Link to="/universes" className="hover:text-gray-400 transition-colors">Catalog</Link>
          {' · '}
          <Link to="/blog" className="hover:text-gray-400 transition-colors">Blog</Link>
        </p>
      </footer>
    </div>
  )
}
