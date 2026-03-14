import { describe, it, expect } from 'vitest'
import { filterCatalogUniverses, getBestEntryConfig, getCuratedSuggestions, sortCatalogUniverses } from '../utils/discovery'
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

  it('returns unique suggestions for a daily curation set', () => {
    const suggestions = getCuratedSuggestions(UNIVERSE_CATALOG, 'aot')
    const ids = suggestions.map(entry => entry.id)
    expect(new Set(ids).size).toBe(ids.length)
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
