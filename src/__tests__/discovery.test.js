import { describe, it, expect } from 'vitest'
import {
  filterCatalogUniverses,
  getBestEntryConfig,
  getCuratedSuggestions,
  sortCatalogUniverses,
  getDiscoveryClusters,
  getRelatedUniverseSuggestions,
  getUniverseDiscoveryProfile
} from '../utils/discovery'
import { UNIVERSE_CATALOG } from '../data/catalog'
import { DISCOVERY_METADATA } from '../data/discoveryMetadata'

describe('discovery utils', () => {
  it('sorts alphabetically', () => {
    const sorted = sortCatalogUniverses(UNIVERSE_CATALOG, 'alphabetical')
    expect(sorted[0].anime <= sorted[1].anime).toBe(true)
  })

  it('returns curated suggestions capped to 3', () => {
    const suggestions = getCuratedSuggestions(UNIVERSE_CATALOG, 'deathnote')
    expect(suggestions.length).toBeLessThanOrEqual(3)
    expect(suggestions.find(s => s.id === 'deathnote')).toBeUndefined()
  })

  it('filters catalog by query', () => {
    const hits = filterCatalogUniverses(UNIVERSE_CATALOG, 'fullmetal')
    expect(hits.some(entry => entry.id === 'fmab')).toBe(true)
  })

  it('filters catalog by cluster key', () => {
    const hits = filterCatalogUniverses(UNIVERSE_CATALOG, '', 'causal-systems')
    expect(hits.length).toBeGreaterThan(0)
    expect(hits.some(entry => entry.id === 'aot')).toBe(true)
  })

  it('returns unique suggestions for a daily curation set', () => {
    const suggestions = getCuratedSuggestions(UNIVERSE_CATALOG, 'aot')
    const ids = suggestions.map(entry => entry.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('returns scored related universes with reasons', () => {
    const related = getRelatedUniverseSuggestions(UNIVERSE_CATALOG, 'jjk', 4)
    expect(related.length).toBe(4)
    expect(related[0].entry.id).not.toBe('jjk')
    expect(typeof related[0].reason).toBe('string')
  })

  it('builds discovery clusters with counts', () => {
    const clusters = getDiscoveryClusters(UNIVERSE_CATALOG)
    expect(clusters.length).toBeGreaterThan(0)
    expect(clusters[0].count).toBeGreaterThan(0)
  })

  it('derives fallback discovery profile for unknown universe ids', () => {
    const profile = getUniverseDiscoveryProfile({
      id: 'custom',
      visualizationHint: 'timeline',
      stats: { rules: 6, powerSystem: 2 }
    })
    expect(profile.clusterTags).toContain('causal-systems')
  })

  it('builds best-entry config with metadata override', () => {
    const config = getBestEntryConfig('deathnote', 'node-graph')
    expect(config.tabIndex).toBe(1)
    expect(config.label.toLowerCase()).toContain('entity database')
  })

  it('builds best-entry fallback when metadata is missing', () => {
    const config = getBestEntryConfig('unknown-slug', 'timeline')
    expect(config.tabIndex).toBe(3)
  })

  it('ensures every catalog universe has discovery metadata', () => {
    const missing = UNIVERSE_CATALOG
      .map(entry => entry.id)
      .filter(id => !Object.prototype.hasOwnProperty.call(DISCOVERY_METADATA, id))
    expect(missing).toEqual([])
  })
})
