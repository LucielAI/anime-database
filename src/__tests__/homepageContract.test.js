import { describe, it, expect } from 'vitest'
import { UNIVERSE_CATALOG } from '../data/catalog'
import {
  getHomepageFeaturedUniverses,
  getHomepageRequestCandidates,
  getSystemStructureGroups,
  HOMEPAGE_SECTION_ORDER,
  REQUESTABLE_UNIVERSE_POOL,
  getHomepageQuickInsights,
  buildUniverseComparison,
  getHomepageHighlightLeaders,
} from '../config/homepageContract'

describe('homepage contract', () => {
  it('keeps required section order', () => {
    expect(HOMEPAGE_SECTION_ORDER).toEqual([
      'hero',
      'explore-by-system-structure',
      'featured-archive-systems',
      'quick-insights',
      'continue-next-paths',
      'browse-universes',
      'community-pulse',
      'support-footer',
    ])
  })

  it('returns deterministic top featured universes', () => {
    const first = getHomepageFeaturedUniverses(UNIVERSE_CATALOG, 3).map((entry) => entry.id)
    const second = getHomepageFeaturedUniverses(UNIVERSE_CATALOG, 3).map((entry) => entry.id)
    expect(first).toEqual(second)
    expect(first.length).toBe(3)
  })

  it('derives system structure groups from live catalog data', () => {
    const groups = getSystemStructureGroups(UNIVERSE_CATALOG, 6)
    expect(groups.length).toBeGreaterThan(0)
    expect(groups.some((group) => group.count > 0)).toBe(true)
  })

  it('filters request candidates against implemented universes', () => {
    const implemented = new Set(UNIVERSE_CATALOG.map((entry) => entry.anime.toLowerCase().replace(/[^a-z0-9]/g, '')))
    const quickVotes = getHomepageRequestCandidates(UNIVERSE_CATALOG, 8)

    const hasImplemented = quickVotes.some((candidate) => implemented.has(candidate.anime.toLowerCase().replace(/[^a-z0-9]/g, '')))
    expect(hasImplemented).toBe(false)

    const isSubsetOfPool = quickVotes.every((candidate) => REQUESTABLE_UNIVERSE_POOL.some((pool) => pool.slug === candidate.slug))
    expect(isSubsetOfPool).toBe(true)
  })

  it('builds short quick insight lines for shareable cards', () => {
    const insights = getHomepageQuickInsights(UNIVERSE_CATALOG, 3)
    expect(insights.length).toBe(3)
    expect(insights[0].insight.length).toBeGreaterThan(20)
  })

  it('builds a lightweight 2-title comparison payload', () => {
    const left = UNIVERSE_CATALOG.find((entry) => entry.id === 'jjk')
    const right = UNIVERSE_CATALOG.find((entry) => entry.id === 'aot')
    const comparison = buildUniverseComparison(left, right)
    expect(comparison.left.powerSystemType.length).toBeGreaterThan(0)
    expect(comparison.right.complexity).toBeGreaterThan(0)
  })

  it('returns engagement highlight leaders', () => {
    const leaders = getHomepageHighlightLeaders(UNIVERSE_CATALOG)
    expect(leaders.mostComplexId).toBeTruthy()
    expect(leaders.mostStrategicId).toBeTruthy()
  })
})
