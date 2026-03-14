import { DISCOVERY_METADATA } from '../data/discoveryMetadata'

const VIEW_STORAGE_KEY = 'anime-archive:view-counts:v1'

function safeParse(raw, fallback) {
  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function getLocalViewMap() {
  if (typeof window === 'undefined') return {}
  return safeParse(window.localStorage.getItem(VIEW_STORAGE_KEY) || '{}', {})
}

function parseAddedAt(entry, index) {
  const ts = Date.parse(DISCOVERY_METADATA[entry.id]?.addedAt || '')
  return Number.isFinite(ts) ? ts : index
}

function getPopularity(entry, index, total, localViewMap) {
  const baseline = DISCOVERY_METADATA[entry.id]?.popularityBaseline ?? (total - index)
  const localViews = Number(localViewMap[entry.id] || 0)
  return baseline + localViews
}

export function incrementUniverseLocalView(slug) {
  if (!slug || typeof window === 'undefined') return
  const current = getLocalViewMap()
  current[slug] = Number(current[slug] || 0) + 1
  window.localStorage.setItem(VIEW_STORAGE_KEY, JSON.stringify(current))
}

export function sortCatalogUniverses(catalog, mode = 'latest') {
  const localViewMap = getLocalViewMap()
  const total = catalog.length
  const rows = catalog.map((entry, index) => ({
    ...entry,
    _addedAtTs: parseAddedAt(entry, index),
    _popularity: getPopularity(entry, index, total, localViewMap),
    _featuredRank: DISCOVERY_METADATA[entry.id]?.featuredRank ?? 99,
  }))

  const sorter = {
    latest: (a, b) => b._addedAtTs - a._addedAtTs || a.anime.localeCompare(b.anime),
    alphabetical: (a, b) => a.anime.localeCompare(b.anime),
    'most-viewed': (a, b) => b._popularity - a._popularity || b._addedAtTs - a._addedAtTs,
    featured: (a, b) => a._featuredRank - b._featuredRank || b._popularity - a._popularity,
  }[mode] || ((a, b) => b._addedAtTs - a._addedAtTs)

  return rows.sort(sorter)
}

export function getFeaturedUniverses(catalog, count = 3) {
  return sortCatalogUniverses(catalog, 'featured').slice(0, count)
}

function deterministicPick(items, seed) {
  if (!items.length) return null
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 2147483647
  }
  return items[hash % items.length]
}

export function getCuratedSuggestions(catalog, currentId) {
  const current = catalog.find(entry => entry.id === currentId)
  const pool = catalog.filter(entry => entry.id !== currentId)
  const seen = new Set()

  const newest = sortCatalogUniverses(pool, 'latest').find(entry => !seen.has(entry.id))
  if (newest) seen.add(newest.id)

  const popular = sortCatalogUniverses(pool, 'most-viewed').find(entry => !seen.has(entry.id))
  if (popular) seen.add(popular.id)

  const thematicPool = pool.filter(entry => entry.visualizationHint === current?.visualizationHint && !seen.has(entry.id))
  const fallbackPool = pool.filter(entry => !seen.has(entry.id))
  const seed = `${currentId || 'archive'}:${new Date().toISOString().slice(0, 10)}`
  const thematic = deterministicPick(thematicPool.length ? thematicPool : fallbackPool, seed)

  return [newest, popular, thematic].filter(Boolean).slice(0, 3)
}

export function filterCatalogUniverses(catalog, query) {
  if (!query.trim()) return catalog
  const normalized = query.trim().toLowerCase()
  return catalog.filter(entry => {
    const haystack = [entry.anime, entry.tagline, entry.visualizationHint].filter(Boolean).join(' ').toLowerCase()
    return haystack.includes(normalized)
  })
}
