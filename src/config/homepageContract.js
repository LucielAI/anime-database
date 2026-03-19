import { DISCOVERY_CLUSTERS, DISCOVERY_METADATA } from '../data/discoveryMetadata'
import { preferredOrder } from '../data/catalog'
import { getFeaturedUniverses, getLastViewedUniverseId, getRelatedUniverseSuggestions, sortCatalogUniverses } from '../utils/discovery'

export const HOMEPAGE_SECTION_ORDER = [
  'hero',
  'explore-by-system-structure',
  'featured-archive-systems',
  'continue-next-paths',
  'browse-universes',
  'community-pulse',
  'support-footer',
]

const SYSTEM_STRUCTURE_TAXONOMY = [
  {
    key: 'relational-systems',
    label: 'Relational Systems',
    description: 'Power swings through alliances, betrayal, and influence.',
    matches: (entry, metadata) => ['node-graph', 'affinity-matrix'].includes(entry.visualizationHint)
      || metadata.classification === 'network'
      || metadata.systemProfile?.powerStructure === 'control',
  },
  {
    key: 'counterplay-systems',
    label: 'Counterplay Systems',
    description: 'Fights are won with counters, timing, and matchup reads.',
    matches: (entry, metadata) => entry.visualizationHint === 'counter-tree'
      || metadata.classification === 'combat'
      || metadata.clusterTags?.includes('combat-systems'),
  },
  {
    key: 'timeline-systems',
    label: 'Timeline Systems',
    description: 'Choices ripple forward through time and change everything.',
    matches: (entry, metadata) => entry.visualizationHint === 'timeline' || metadata.clusterTags?.includes('causal-systems'),
  },
  {
    key: 'control-systems',
    label: 'Control Systems',
    description: 'Power comes from command, status, and who people obey.',
    matches: (_entry, metadata) => metadata.systemProfile?.powerStructure === 'control' || metadata.clusterTags?.includes('hierarchy-heavy'),
  },
  {
    key: 'closed-loop-systems',
    label: 'Closed-Loop Systems',
    description: 'The world loops back on itself, and rules keep repeating.',
    matches: (_entry, metadata) => ['causal', 'inheritance'].includes(metadata.systemProfile?.powerStructure)
      || metadata.clusterTags?.includes('causal-systems'),
  },
  {
    key: 'power-economy-systems',
    label: 'Power Economy Systems',
    description: 'Power is a resource you earn, spend, trade, or lose.',
    matches: (_entry, metadata) => ['exchange', 'matchup', 'growth-loop', 'resource', 'suppression', 'modular', 'specialization'].includes(metadata.systemProfile?.powerStructure)
      || metadata.clusterTags?.includes('combat-systems'),
  },
]

export const REQUESTABLE_UNIVERSE_POOL = [
  { slug: 'naruto', anime: 'Naruto', priority: 100 },
  { slug: 'onepiece', anime: 'One Piece', priority: 98 },
  { slug: 'bleach', anime: 'Bleach', priority: 96 },
  { slug: 'monster', anime: 'Monster', priority: 94 },
  { slug: 'madeinabyss', anime: 'Made in Abyss', priority: 90 },
  { slug: 'rezero', anime: 'Re:ZERO -Starting Life in Another World-', priority: 88 },
  { slug: 'fatezero', anime: 'Fate/Zero', priority: 86 },
  { slug: 'worldtrigger', anime: 'World Trigger', priority: 84 },
  { slug: 'dorohedoro', anime: 'Dorohedoro', priority: 82 },
  { slug: 'psycho-pass', anime: 'Psycho-Pass', priority: 80 },
  { slug: 'hellsparadise', anime: "Hell's Paradise", priority: 76 },
  { slug: 'drstone', anime: 'Dr. Stone', priority: 74 },
]

function normalizedName(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

function getUniverseMetadata(entry) {
  return DISCOVERY_METADATA[entry.id] || { clusterTags: [] }
}

export function getSystemStructureGroups(catalog, limit = 6) {
  const groups = SYSTEM_STRUCTURE_TAXONOMY
    .map((taxonomy) => {
      const entries = catalog.filter((entry) => taxonomy.matches(entry, getUniverseMetadata(entry)))
      return {
        key: taxonomy.key,
        label: taxonomy.label,
        description: taxonomy.description,
        count: entries.length,
        leadUniverseId: entries[0]?.id || null,
      }
    })
    .filter((group) => group.count > 0)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))

  return groups.slice(0, Math.max(1, limit))
}

export function getHomepageFeaturedUniverses(catalog, count = 3) {
  return getFeaturedUniverses(catalog, count)
}

export function getHomepageRequestCandidates(catalog, count = 6) {
  const implemented = new Set(catalog.map((entry) => normalizedName(entry.anime)))

  return REQUESTABLE_UNIVERSE_POOL
    .filter((candidate) => !candidate.isArchived)
    .filter((candidate) => !implemented.has(normalizedName(candidate.anime)))
    .sort((a, b) => b.priority - a.priority || a.anime.localeCompare(b.anime))
    .slice(0, Math.max(1, count))
}

export function getHomepageContinuation(catalog) {
  const lastViewedId = getLastViewedUniverseId()
  const continueEntry = catalog.find((entry) => entry.id === lastViewedId) || null

  const nextComparisons = continueEntry
    ? getRelatedUniverseSuggestions(catalog, continueEntry.id, 2).map((row) => ({
      entry: row.entry,
      reason: row.reason,
      sharedClusters: row.sharedClusters,
    }))
    : []

  const featuredFallback = getHomepageFeaturedUniverses(catalog, 3)
  const editorPicks = (continueEntry
    ? featuredFallback.filter((entry) => entry.id !== continueEntry.id)
    : featuredFallback
  ).slice(0, 2)

  return {
    continueEntry,
    nextComparisons,
    editorPicks,
  }
}

export function getHomepageClusterLinks(catalog, limit = 4) {
  const clusterCounts = {}

  catalog.forEach((entry) => {
    const metadata = getUniverseMetadata(entry)
    ;(metadata.clusterTags || []).forEach((key) => {
      clusterCounts[key] = (clusterCounts[key] || 0) + 1
    })
  })

  return Object.entries(DISCOVERY_CLUSTERS)
    .map(([key, value]) => ({ key, ...value, count: clusterCounts[key] || 0 }))
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, Math.max(1, limit))
}

export function getHomepageBrowsePreview(catalog, sortMode = 'latest', size = 6) {
  return sortCatalogUniverses(catalog, sortMode).slice(0, Math.max(1, size))
}

export function getFeaturedSourceOfTruthSummary() {
  return {
    rankedBy: 'DISCOVERY_METADATA[slug].featuredRank',
    fallbackOrder: ['popularityBaseline desc', 'preferredOrder index', 'alphabetical anime title'],
    sourceFiles: ['src/data/discoveryMetadata.js', 'src/data/catalog.js'],
    displayCount: 3,
    rotation: 'none',
  }
}

export function getHomepageSectionOrder() {
  return [...HOMEPAGE_SECTION_ORDER]
}

export function getPreferredOrderReference() {
  return [...preferredOrder]
}
