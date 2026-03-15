import { Link } from 'react-router-dom'
import { Compass, ArrowRight, Sparkles } from 'lucide-react'
import { UNIVERSE_CATALOG } from '../data/index'
import { DISCOVERY_CLUSTERS } from '../data/discoveryMetadata'
import { getRelatedUniverseSuggestions, sortCatalogUniverses, getUniverseDiscoveryProfile } from '../utils/discovery'

export default function ExploreAnotherUniverse({ currentId, isSystemMode, theme }) {
  const accentColor = isSystemMode ? (theme?.secondary || '#22d3ee') : (theme?.primary || '#8b5cf6')
  const related = getRelatedUniverseSuggestions(UNIVERSE_CATALOG, currentId, 3)
  const nextRead = sortCatalogUniverses(UNIVERSE_CATALOG.filter(entry => entry.id !== currentId), 'most-viewed')[0]

  return (
    <section className="w-full max-w-5xl mx-auto px-6 py-14 mt-8 font-mono border-t border-white/5" aria-labelledby="related-universes-heading">
      <div className="flex flex-col items-start gap-4">
        <div className="flex items-center gap-3">
          <Compass className="w-5 h-5" style={{ color: accentColor }} />
          <h2 id="related-universes-heading" className="text-sm md:text-base font-bold tracking-[0.2em] uppercase text-white">
            Related Universes
          </h2>
        </div>

        <p className="text-xs text-gray-500 max-w-3xl leading-relaxed">
          Continue through the archive with one close structural match and two comparable universe profiles.
        </p>

        <ul className="w-full space-y-3" aria-label="Related universes">
          {related.map(({ entry, reason, sharedClusters }, idx) => {
            const cardAccent = isSystemMode ? (entry.themeColors?.secondary || accentColor) : (entry.themeColors?.primary || accentColor)
            const profile = getUniverseDiscoveryProfile(entry)
            const leadCluster = sharedClusters?.[0] || profile.clusterTags?.[0]
            const clusterLabel = DISCOVERY_CLUSTERS[leadCluster]?.shortLabel

            return (
              <li key={entry.id}>
                <Link
                  to={`/universe/${entry.id}`}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'auto' })}
                  className="group block rounded-xl border border-white/10 bg-[#0a0d16] p-4 md:p-5 min-h-[64px] hover:border-white/25 transition-all duration-300"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold uppercase text-white">{entry.anime}</h3>
                      <p className="text-[11px] text-gray-400 mt-1 line-clamp-1 md:line-clamp-2">{entry.tagline}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors shrink-0" />
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold tracking-[0.16em] uppercase" style={{ color: cardAccent }}>
                      <Sparkles className="w-3 h-3" /> {idx === 0 ? 'Best Match' : reason}
                    </span>
                    {clusterLabel && (
                      <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-2 py-1 text-[9px] tracking-[0.16em] uppercase text-gray-300">
                        {clusterLabel}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-cyan-200/80">Where to Go Next</p>
            <p className="text-xs text-gray-300 mt-1">If you want one clear follow-up, continue with {nextRead?.anime || 'a popular universe profile'}.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {nextRead && (
              <Link to={`/universe/${nextRead.id}`} className="px-3 py-2 min-h-[40px] rounded-full border border-cyan-300/30 bg-cyan-400/10 hover:bg-cyan-400/20 text-[10px] font-bold tracking-[0.2em] uppercase text-cyan-100 inline-flex items-center">
                Open {nextRead.anime}
              </Link>
            )}
            <Link
              to="/universes"
              className="px-3 py-2 min-h-[40px] rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-300 hover:text-white transition-all inline-flex items-center"
            >
              Browse Archive
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
