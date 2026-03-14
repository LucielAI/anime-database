import { DISCOVERY_METADATA } from '../data/discoveryMetadata'

const VIEW_STORAGE_KEY = 'anime-archive:view-counts:v1'

const TAB_KEY_TO_INDEX = {
  'power-engine': 0,
  'entity-database': 1,
  factions: 2,
  'core-laws': 3,
}

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

function getFeaturedRank(entry) {
  return DISCOVERY_METADATA[entry.id]?.featuredRank ?? 99
}

function getDailySeed() {
  return new Date().toISOString().slice(0, 10)
}

function seededHash(seed) {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 2147483647
  }
  return hash
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
    _featuredRank: getFeaturedRank(entry),
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
  const featuredPool = sortCatalogUniverses(catalog, 'featured').slice(0, Math.max(count, 3))
  if (featuredPool.length <= count) return featuredPool

  const [primary] = featuredPool
  const secondaryPool = featuredPool.slice(1)
  const offset = seededHash(getDailySeed()) % secondaryPool.length
  const rotated = secondaryPool.slice(offset).concat(secondaryPool.slice(0, offset))

  return [primary, ...rotated.slice(0, count - 1)]
}

function deterministicPick(items, seed) {
  if (!items.length) return null
  const hash = seededHash(seed)
  return items[hash % items.length]
}

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(token => token.length >= 4)
}

function getThematicScore(candidate, current, currentTokens) {
  if (!candidate || !current) return 0

  let score = 0
  if (candidate.visualizationHint === current.visualizationHint) score += 4

  const candidateTokens = new Set(tokenize(candidate.tagline))
  for (const token of currentTokens) {
    if (candidateTokens.has(token)) score += 1
  }

  const currentClass = DISCOVERY_METADATA[current.id]?.classification
  const candidateClass = DISCOVERY_METADATA[candidate.id]?.classification
  if (currentClass && candidateClass && currentClass === candidateClass) score += 2

  return score
}

export function getCuratedSuggestions(catalog, currentId) {
  const current = catalog.find(entry => entry.id === currentId)
  const pool = catalog.filter(entry => entry.id !== currentId)
  const seen = new Set()

  const newest = sortCatalogUniverses(pool, 'latest').find(entry => !seen.has(entry.id))
  if (newest) seen.add(newest.id)

  const popular = sortCatalogUniverses(pool, 'most-viewed').find(entry => !seen.has(entry.id))
  if (popular) seen.add(popular.id)

  const currentTokens = tokenize(current?.tagline)
  const fallbackPool = pool.filter(entry => !seen.has(entry.id))
  const thematicPool = fallbackPool
    .map(entry => ({
      entry,
      score: getThematicScore(entry, current, currentTokens),
    }))
    .filter(row => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(row => row.entry)

  const seed = `${currentId || 'archive'}:${getDailySeed()}`
  const themedCandidates = thematicPool.slice(0, 4)
  const thematic = deterministicPick(themedCandidates.length ? themedCandidates : fallbackPool, seed)

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

export function getBestEntryConfig(universeId, visualizationHint) {
  const metadata = DISCOVERY_METADATA[universeId] || {}
  const fallbackKey = visualizationHint === 'timeline'
    ? 'core-laws'
    : visualizationHint === 'counter-tree'
      ? 'power-engine'
      : visualizationHint === 'node-graph' || visualizationHint === 'affinity-matrix'
        ? 'entity-database'
        : 'power-engine'

  const tabKey = TAB_KEY_TO_INDEX[metadata.startTab] != null ? metadata.startTab : fallbackKey
  const tabIndex = TAB_KEY_TO_INDEX[tabKey] ?? 0

  return {
    tabKey,
    tabIndex,
    label: metadata.startLabel || 'Start here for the fastest strategic orientation.',
  }
}
