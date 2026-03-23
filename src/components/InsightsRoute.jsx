import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Clock3, Network, Zap, Users, BookOpen, ChevronRight, Share2 } from 'lucide-react'
import SeoHead from './SeoHead'
import NewsletterCTA from './NewsletterCTA'
import { SITE_URL, SITE_NAME } from '../utils/seo'

import { INSIGHTS } from '../data/insights'

export default function InsightsRoute() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const categories = useMemo(() => {
    const cats = ['all', ...new Set(INSIGHTS.map(i => i.category))]
    return cats
  }, [])

  const filtered = useMemo(() => {
    return INSIGHTS.filter(i => {
      const matchCat = activeCategory === 'all' || i.category === activeCategory
      const matchSearch = !searchQuery ||
        i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        i.universeAnime.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCat && matchSearch
    })
  }, [activeCategory, searchQuery])

  const featured = INSIGHTS.find(i => i.featured)
  const rest = filtered.filter(i => !i.featured)

  // Show featured insight when: no filters (always show), OR featured matches the active category/term
  const featuredMatches =
    !featured ||
    (activeCategory === 'all' && !searchQuery) ||
    activeCategory === featured.category ||
    featured.tags?.some(t => t.toLowerCase() === activeCategory.toLowerCase()) ||
    (searchQuery && featured.title.toLowerCase().includes(searchQuery.toLowerCase()))
  const showFeatured = featured && featuredMatches

  const canonicalUrl = `${SITE_URL}/insights`

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${SITE_NAME} Insights`,
      description: 'Deep dives into how anime worlds actually work. Power mechanics, causal logic, and the systems behind the fights.',
      url: canonicalUrl,
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: `${SITE_URL}/` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'System Breakdowns',
      description: 'Anime universe system analysis insights',
      numberOfItems: INSIGHTS.length,
      itemListElement: INSIGHTS.map((insight, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: insight.title,
        url: `${SITE_URL}/insights/${insight.slug}`,
      })),
    },
  ]

  return (
    <div className="min-h-screen bg-[#050508] text-white font-mono">
      <SeoHead
        title="System Breakdowns — Anime Intelligence Archive"
        description="Deep dives into how anime worlds actually work. Power mechanics, causal logic, and the systems behind the fights."
        canonicalUrl={canonicalUrl}
        image="https://animearchive.app/api/og?id=insights"
        structuredData={structuredData}
      />
      {/* Header */}
      <header className="w-full py-16 px-6 text-center border-b border-white/5" style={{ background: 'radial-gradient(ellipse at center, #101634 0%, #050508 100%)' }}>
        <p className="text-[10px] text-cyan-300/80 tracking-[0.24em] uppercase font-bold mb-3">Deep Dives & Analysis</p>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-3">System Breakdowns</h1>
        <p className="text-xs text-gray-400 max-w-xl mx-auto leading-relaxed">
          How anime worlds actually work — power mechanics, causal logic, and the systems behind the fights.
        </p>
        {/* Search */}
        <div className="mt-6 max-w-md mx-auto flex gap-2">
          <input
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search insights..."
            className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[11px] text-white placeholder-gray-600 outline-none focus:border-cyan-400/40 transition-colors"
          />
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'System Breakdowns — Anime Archive', url: window.location.href })
              } else {
                navigator.clipboard.writeText(window.location.href)
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2.5 border border-white/10 rounded-xl hover:border-cyan-400/40 transition-colors text-gray-400 hover:text-white"
            title="Share insights"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.14em] border transition-colors ${
                activeCategory === cat
                  ? 'border-cyan-400/60 bg-cyan-400/10 text-cyan-300'
                  : 'border-white/10 text-gray-500 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured insight */}
        {showFeatured && (
          <Link
            to={`/insights/${featured.slug}`}
            className="block mb-10 group"
          >
            <div className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/8 to-transparent p-6 hover:border-cyan-400/40 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-cyan-400/20 text-cyan-300 text-[9px] uppercase tracking-widest font-bold rounded">Featured</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">{featured.universeAnime}</span>
                <span className="text-[10px] text-gray-600">·</span>
                <span className="flex items-center gap-1 text-[10px] text-gray-500">
                  <Clock3 className="w-3 h-3" /> {featured.readTime}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-2 group-hover:text-cyan-300 transition-colors">
                {featured.title}
              </h2>
              <p className="text-xs text-gray-400 mb-4">{featured.subtitle}</p>
              <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-3 mb-4">
                {featured.teaser}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-bold uppercase tracking-widest">
                Read analysis <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </Link>
        )}

        {/* Insights grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rest.map(insight => (
            <Link
              key={insight.slug}
              to={`/insights/${insight.slug}`}
              className="group"
            >
              <article className="h-full rounded-xl border border-white/10 p-5 hover:border-white/20 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-white/5 text-gray-400">
                    {{
                      'World Analysis': <Network className="w-4 h-4" />,
                      'System Analysis': <Users className="w-4 h-4" />,
                      'Mechanics': <Zap className="w-4 h-4" />,
                      'Thematic Analysis': <BookOpen className="w-4 h-4" />,
                      'Combat Analysis': <Zap className="w-4 h-4" />,
                    }[insight.category] ?? <Zap className="w-4 h-4" />}
                  </div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">{insight.universeAnime}</span>
                  <span className="flex items-center gap-1 text-[10px] text-gray-600 ml-auto">
                    <Clock3 className="w-3 h-3" />{insight.readTime}
                  </span>
                </div>
                <h3 className="text-sm font-black uppercase tracking-tight mb-1 group-hover:text-cyan-300 transition-colors leading-snug">
                  {insight.title}
                </h3>
                <p className="text-[11px] text-gray-500 mb-3 line-clamp-2 leading-relaxed">{insight.subtitle}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {insight.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-white/5 text-[9px] text-gray-600 rounded uppercase tracking-wider">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-600 group-hover:text-cyan-400 transition-colors">
                  Read <ChevronRight className="w-3 h-3" />
                </div>
              </article>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-600">
            <p className="text-xs uppercase tracking-widest">No insights found.</p>
          </div>
        )}
      </div>

      {/* Bottom CTA with Newsletter */}
      <div className="max-w-xl mx-auto px-6 pb-8">
        <div className="rounded-2xl border border-cyan-400/20 bg-gradient-to-b from-cyan-400/5 to-transparent p-6 mb-6">
          <p className="text-[10px] uppercase tracking-widest text-cyan-400/70 mb-2 font-bold">Get new insights every week</p>
          <p className="text-[11px] text-gray-500 mb-4 leading-relaxed">Weekly dives into anime system mechanics. No fluff, just architecture.</p>
          <NewsletterCTA />
        </div>
      </div>
    </div>
  )
}
