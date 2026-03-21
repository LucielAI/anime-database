import { UNIVERSE_CATALOG } from '../data/catalog'
import { DISCOVERY_METADATA } from '../data/discoveryMetadata'

export const THEMATIC_PAGES = [
  {
    slug: 'relational-systems',
    title: 'Relational Systems',
    heading: 'Anime Where Power Flows Through Relationships',
    description: 'Universes where alliances, betrayal, and influence networks determine who wins. Compare structural relationship maps.',
    seoKeywords: 'anime relationships, anime alliances, best anime with betrayal, anime power through connections',
    taxonomyKey: 'relational-systems',
  },
  {
    slug: 'counterplay-systems',
    title: 'Counterplay Systems',
    heading: 'Anime With Counter-Based Combat Systems',
    description: 'Universes where fights are decided by matchup reads, counters, and technical timing. Compare combat architectures.',
    seoKeywords: 'anime power systems, anime combat analysis, best anime fights, anime matchups',
    taxonomyKey: 'counterplay-systems',
  },
  {
    slug: 'timeline-systems',
    title: 'Timeline Systems',
    heading: 'Anime Where Time Itself Is The Battlefield',
    description: 'Universes driven by cause-and-effect, time loops, and deterministic causality. Compare temporal architectures.',
    seoKeywords: 'anime time travel, anime timeline, best anime with time manipulation, anime causality',
    taxonomyKey: 'timeline-systems',
  },
  {
    slug: 'control-systems',
    title: 'Control Systems',
    heading: 'Anime Where Command Hierarchy Is Power',
    description: 'Universes where institutional control, status, and authority structures determine outcomes.',
    seoKeywords: 'anime politics, anime hierarchy, anime authority, anime control',
    taxonomyKey: 'control-systems',
  },
  {
    slug: 'closed-loop-systems',
    title: 'Closed-Loop Systems',
    heading: 'Anime Worlds That Loop Back On Themselves',
    description: 'Universes with self-reinforcing rules that create inescapable cycles.',
    seoKeywords: 'anime loops, anime deterministic worlds, anime fate, anime closed systems',
    taxonomyKey: 'closed-loop-systems',
  },
  {
    slug: 'power-economy-systems',
    title: 'Power Economy Systems',
    heading: 'Anime Where Power Is Currency',
    description: 'Universes where abilities are resources that can be earned, spent, traded, or permanently lost.',
    seoKeywords: 'anime power systems ranked, anime abilities, anime resource systems, best anime powers',
    taxonomyKey: 'power-economy-systems',
  },
]

// Matching logic mirrors SYSTEM_STRUCTURE_TAXONOMY in homepageContract.js
const TAXONOMY_MATCHERS = {
  'relational-systems': (entry, metadata) =>
    ['node-graph', 'affinity-matrix'].includes(entry.visualizationHint)
    || metadata.classification === 'network'
    || metadata.systemProfile?.powerStructure === 'control',

  'counterplay-systems': (entry, metadata) =>
    entry.visualizationHint === 'counter-tree'
    || metadata.classification === 'combat'
    || metadata.clusterTags?.includes('combat-systems'),

  'timeline-systems': (entry, metadata) =>
    entry.visualizationHint === 'timeline'
    || metadata.clusterTags?.includes('causal-systems'),

  'control-systems': (_entry, metadata) =>
    metadata.systemProfile?.powerStructure === 'control'
    || metadata.clusterTags?.includes('hierarchy-heavy'),

  'closed-loop-systems': (_entry, metadata) =>
    ['causal', 'inheritance'].includes(metadata.systemProfile?.powerStructure)
    || metadata.clusterTags?.includes('causal-systems'),

  'power-economy-systems': (_entry, metadata) =>
    ['exchange', 'matchup', 'growth-loop', 'resource', 'suppression', 'modular', 'specialization'].includes(
      metadata.systemProfile?.powerStructure
    )
    || metadata.clusterTags?.includes('combat-systems'),
}

function getUniverseMetadata(entry) {
  return DISCOVERY_METADATA[entry.id] || { clusterTags: [] }
}

export function getUniversesForTaxonomy(taxonomyKey) {
  const matcher = TAXONOMY_MATCHERS[taxonomyKey]
  if (!matcher) return []
  return UNIVERSE_CATALOG.filter((entry) => matcher(entry, getUniverseMetadata(entry)))
}

export function getThematicPageBySlug(slug) {
  return THEMATIC_PAGES.find((page) => page.slug === slug) || null
}
