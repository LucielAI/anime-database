import { DISCOVERY_METADATA, DISCOVERY_CLUSTERS } from '../data/discoveryMetadata'

const VIEW_STORAGE_KEY = 'anime-archive:view-counts:v1'
const LAST_VIEWED_STORAGE_KEY = 'anime-archive:last-viewed:v1'

const TAB_KEY_TO_INDEX = {
  'power-engine': 0,
  'entity-database': 1,
  factions: 2,
  'core-laws': 3,
}

const FALLBACK_CLUSTER_BY_HINT = {
  timeline: 'causal-systems',
  'counter-tree': 'combat-systems',
  'node-graph': 'faction-heavy',
  'affinity-matrix': 'faction-heavy',
  'standard-cards': 'hierarchy-heavy',
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
  window.localStorage.setItem(LAST_VIEWED_STORAGE_KEY, slug)
}

export function getLastViewedUniverseId() {
  if (typeof window === 'undefined') return ''
  return String(window.localStorage.getItem(LAST_VIEWED_STORAGE_KEY) || '').trim().toLowerCase()
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
  return sortCatalogUniverses(catalog, 'featured').slice(0, Math.max(1, count))
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

function getDensityBucket(value, low = 3, high = 5) {
  if (!Number.isFinite(value)) return 2
  if (value <= low) return 1
  if (value <= high) return 2
  return 3
}

function deriveFallbackClusters(entry, metadata) {
  const tags = new Set(metadata?.clusterTags || [])
  const hintTag = FALLBACK_CLUSTER_BY_HINT[entry?.visualizationHint]
  if (hintTag) tags.add(hintTag)

  const rules = entry?.stats?.rules || 0
  const power = entry?.stats?.powerSystem || 0

  if (rules >= 5) tags.add('causal-systems')
  if (power >= 4) tags.add('combat-systems')

  return [...tags]
}

export function getUniverseDiscoveryProfile(entry) {
  const metadata = DISCOVERY_METADATA[entry?.id] || {}
  const rules = entry?.stats?.rules || 0
  const powerSystem = entry?.stats?.powerSystem || 0

  return {
    metadata,
    classification: metadata.classification || entry?.visualizationHint || 'unknown',
    clusterTags: deriveFallbackClusters(entry, metadata),
    appealTags: metadata.appealTags || [],
    factionComplexity: metadata.systemProfile?.factionComplexity || getDensityBucket(rules + powerSystem, 5, 7),
    causalDensity: metadata.systemProfile?.causalDensity || (entry?.visualizationHint === 'timeline' ? 3 : getDensityBucket(rules, 3, 5)),
    powerStructure: metadata.systemProfile?.powerStructure || entry?.visualizationHint || 'mixed',
  }
}

function overlapCount(a = [], b = []) {
  const set = new Set(a)
  return b.reduce((count, value) => count + (set.has(value) ? 1 : 0), 0)
}

function getRelatedScore(currentEntry, candidateEntry) {
  const currentProfile = getUniverseDiscoveryProfile(currentEntry)
  const candidateProfile = getUniverseDiscoveryProfile(candidateEntry)
  const currentMeta = currentProfile.metadata
  const candidateMeta = candidateProfile.metadata

  let score = 0
  const reasons = []

  if (currentEntry.visualizationHint === candidateEntry.visualizationHint) {
    score += 4
    reasons.push('Shared visualization lens')
  }

  if (currentProfile.classification === candidateProfile.classification) {
    score += 3
    reasons.push('Same system classification')
  }

  const sharedClusters = overlapCount(currentProfile.clusterTags, candidateProfile.clusterTags)
  if (sharedClusters > 0) {
    score += sharedClusters * 2.5
    reasons.push(`Shared ${sharedClusters > 1 ? 'system clusters' : 'system cluster'}`)
  }

  const sharedAppeal = overlapCount(currentProfile.appealTags, candidateProfile.appealTags)
  if (sharedAppeal > 0) {
    score += sharedAppeal * 1.5
    reasons.push('Similar thematic focus')
  }

  if (currentProfile.powerStructure === candidateProfile.powerStructure) {
    score += 1.5
    reasons.push('Similar power architecture')
  }

  const factionDelta = Math.abs(currentProfile.factionComplexity - candidateProfile.factionComplexity)
  if (factionDelta === 0) score += 1.5
  else if (factionDelta === 1) score += 0.75

  const causalDelta = Math.abs(currentProfile.causalDensity - candidateProfile.causalDensity)
  if (causalDelta === 0) score += 1.5
  else if (causalDelta === 1) score += 0.75

  const popularityBoost = ((candidateMeta.popularityBaseline || 0) / 100) * 0.25
  score += popularityBoost

  return {
    score,
    reason: reasons[0] || 'Useful contrast pick',
    sharedClusters: currentProfile.clusterTags.filter((tag) => candidateProfile.clusterTags.includes(tag)),
  }
}

export function getRelatedUniverseSuggestions(catalog, currentId, count = 4) {
  const current = catalog.find(entry => entry.id === currentId)
  if (!current) return []

  return catalog
    .filter(entry => entry.id !== currentId)
    .map(entry => ({ entry, ...getRelatedScore(current, entry) }))
    .sort((a, b) => b.score - a.score || a.entry.anime.localeCompare(b.entry.anime))
    .slice(0, Math.max(1, count))
}

export function getCuratedSuggestions(catalog, currentId) {
  const related = getRelatedUniverseSuggestions(catalog, currentId, 3).map(row => row.entry)
  if (related.length >= 3) return related

  const current = catalog.find(entry => entry.id === currentId)
  const pool = catalog.filter(entry => entry.id !== currentId)
  const seen = new Set(related.map(entry => entry.id))

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

  return [...related, newest, popular, thematic].filter(Boolean).slice(0, 3)
}

export function getDiscoveryClusters(catalog) {
  const counts = {}
  const leadByCluster = {}

  for (const entry of catalog) {
    const profile = getUniverseDiscoveryProfile(entry)
    for (const tag of profile.clusterTags) {
      counts[tag] = (counts[tag] || 0) + 1
      if (!leadByCluster[tag]) leadByCluster[tag] = entry.id
    }
  }

  return Object.entries(DISCOVERY_CLUSTERS)
    .map(([key, definition]) => ({
      key,
      ...definition,
      count: counts[key] || 0,
      leadUniverseId: leadByCluster[key] || null,
    }))
    .filter(cluster => cluster.count > 0)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

export function filterCatalogUniverses(catalog, query, clusterKey = '') {
  const clusterScoped = clusterKey
    ? catalog.filter(entry => getUniverseDiscoveryProfile(entry).clusterTags.includes(clusterKey))
    : catalog

  if (!query.trim()) return clusterScoped

  const normalized = query.trim().toLowerCase()
  return clusterScoped.filter(entry => {
    const profile = getUniverseDiscoveryProfile(entry)
    const clusterText = profile.clusterTags.join(' ')
    const haystack = [entry.anime, entry.tagline, entry.visualizationHint, clusterText].filter(Boolean).join(' ').toLowerCase()
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
    label: metadata.startLabel || 'Start here for a quick overview of this universe.',
  }
}
