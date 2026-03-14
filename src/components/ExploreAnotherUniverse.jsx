import { Link } from 'react-router-dom'
import { Compass, TrendingUp, Clock3, ArrowRight } from 'lucide-react'
import { UNIVERSE_CATALOG } from '../data/index'
import { getCuratedSuggestions, sortCatalogUniverses } from '../utils/discovery'

export default function ExploreAnotherUniverse({ currentId, isSystemMode, theme }) {
  const accentColor = isSystemMode ? (theme?.secondary || '#22d3ee') : (theme?.primary || '#8b5cf6')
  const suggestions = getCuratedSuggestions(UNIVERSE_CATALOG, currentId)
  const newestId = sortCatalogUniverses(UNIVERSE_CATALOG, 'latest')[0]?.id
  const mostViewedId = sortCatalogUniverses(UNIVERSE_CATALOG, 'most-viewed')[0]?.id

  return (
    <section className="w-full max-w-5xl mx-auto px-6 py-16 mt-8 font-mono border-t border-white/5" aria-labelledby="related-universes-heading">
      <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
        <div className="flex items-center gap-3">
          <Compass className="w-5 h-5" style={{ color: accentColor }} />
          <h2 id="related-universes-heading" className="text-sm md:text-base font-bold tracking-[0.2em] uppercase text-white">
            Explore Another Universe
          </h2>
        </div>

        <p className="text-xs text-gray-500 max-w-3xl leading-relaxed">
          Suggestions are intentionally curated for fast discovery: one recent archive entry, one high-signal popular pick, and one thematic wildcard to expand comparative analysis.
        </p>

        <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full" aria-label="Suggested universes">
          {suggestions.map((entry, idx) => {
            const cardAccent = isSystemMode ? (entry.themeColors?.secondary || accentColor) : (entry.themeColors?.primary || accentColor)
            const label = idx === 0 ? 'RECENT' : idx === 1 ? 'POPULAR' : 'WILDCARD'
            const Icon = idx === 0 ? Clock3 : idx === 1 ? TrendingUp : Compass
            return (
              <li key={entry.id}>
                <Link
                  to={`/universe/${entry.id}`}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'auto' })}
                  className="group block rounded-xl border border-white/10 bg-white/5 p-5 h-full hover:-translate-y-1 hover:border-white/30 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold tracking-[0.2em] uppercase" style={{ color: cardAccent }}>
                      <Icon className="w-3 h-3" /> {label}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-sm font-bold uppercase text-white mb-2">{entry.anime}</h3>
                  <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">{entry.tagline}</p>
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="flex flex-wrap items-center gap-3 mt-1">
          <Link
            to="/universes"
            className="px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-300 hover:text-white transition-all"
          >
            Browse All Universes
          </Link>
          {newestId && (
            <Link to={`/universe/${newestId}`} className="text-[10px] tracking-[0.15em] uppercase text-gray-500 hover:text-white transition-colors">
              Jump to newest
            </Link>
          )}
          {mostViewedId && (
            <Link to={`/universe/${mostViewedId}`} className="text-[10px] tracking-[0.15em] uppercase text-gray-500 hover:text-white transition-colors">
              Jump to popular
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
