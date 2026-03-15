import { Link } from 'react-router-dom'
import { Compass, ArrowRight, Sparkles } from 'lucide-react'
import { UNIVERSE_CATALOG } from '../data/index'
import { DISCOVERY_CLUSTERS } from '../data/discoveryMetadata'
import { getRelatedUniverseSuggestions, sortCatalogUniverses, getUniverseDiscoveryProfile } from '../utils/discovery'

export default function ExploreAnotherUniverse({ currentId, isSystemMode, theme }) {
  const accentColor = isSystemMode ? (theme?.secondary || '#22d3ee') : (theme?.primary || '#8b5cf6')
  const related = getRelatedUniverseSuggestions(UNIVERSE_CATALOG, currentId, 4)
  const nextRead = sortCatalogUniverses(UNIVERSE_CATALOG.filter(entry => entry.id !== currentId), 'most-viewed')[0]

  return (
    <section className="w-full max-w-5xl mx-auto px-6 py-16 mt-8 font-mono border-t border-white/5" aria-labelledby="related-universes-heading">
      <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
        <div className="flex items-center gap-3">
          <Compass className="w-5 h-5" style={{ color: accentColor }} />
          <h2 id="related-universes-heading" className="text-sm md:text-base font-bold tracking-[0.2em] uppercase text-white">
            Explore Similar Systems
          </h2>
        </div>

        <p className="text-xs text-gray-500 max-w-3xl leading-relaxed">
          Continue through structurally related universes: same lens, similar system density, and matching reader appeal.
        </p>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full" aria-label="Related universes">
          {related.map(({ entry, reason, sharedClusters }) => {
            const cardAccent = isSystemMode ? (entry.themeColors?.secondary || accentColor) : (entry.themeColors?.primary || accentColor)
            const profile = getUniverseDiscoveryProfile(entry)
            const leadCluster = sharedClusters?.[0] || profile.clusterTags?.[0]
            const clusterLabel = DISCOVERY_CLUSTERS[leadCluster]?.shortLabel

            return (
              <li key={entry.id}>
                <Link
                  to={`/universe/${entry.id}`}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'auto' })}
                  className="group block rounded-xl border border-white/10 bg-white/5 p-4 h-full hover:-translate-y-1 hover:border-white/30 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold tracking-[0.2em] uppercase" style={{ color: cardAccent }}>
                      <Sparkles className="w-3 h-3" /> {reason}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-colors shrink-0" />
                  </div>
                  <h3 className="text-sm font-bold uppercase text-white mb-2">{entry.anime}</h3>
                  <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">{entry.tagline}</p>
                  {clusterLabel && (
                    <span className="mt-3 inline-flex rounded-full border border-white/15 bg-white/5 px-2 py-1 text-[9px] tracking-[0.16em] uppercase text-gray-300">
                      {clusterLabel}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="w-full rounded-xl border border-white/10 bg-[#090b14] px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-cyan-200/80">Next Read Path</p>
            <p className="text-xs text-gray-300 mt-1">If you want one high-signal next jump, continue with {nextRead?.anime || 'the most-viewed system'}.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {nextRead && (
              <Link to={`/universe/${nextRead.id}`} className="px-3 py-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 hover:bg-cyan-400/20 text-[10px] font-bold tracking-[0.2em] uppercase text-cyan-100">
                Open {nextRead.anime}
              </Link>
            )}
            <Link
              to="/universes"
              className="px-3 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-300 hover:text-white transition-all"
            >
              Browse All
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
