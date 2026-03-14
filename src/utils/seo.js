import { getClassificationLabel } from './getClassificationLabel.js'

export const SITE_NAME = 'Anime Architecture Archive'
export const SITE_URL = 'https://animearchive.app'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/api/og`

function truncate(text, limit = 160) {
  if (!text) return ''
  if (text.length <= limit) return text
  return `${text.slice(0, limit - 1).trimEnd()}…`
}

function buildUniverseDescription(preview) {
  const lens = getClassificationLabel(preview.visualizationHint)
  const stats = preview.stats || {}
  const statsSummary = [
    stats.characters ? `${stats.characters} entities` : null,
    stats.powerSystem ? `${stats.powerSystem} power mechanics` : null,
    stats.rules ? `${stats.rules} governing rules` : null,
  ].filter(Boolean).join(' • ')

  const sentence = `${preview.anime}: ${preview.tagline} Structured ${lens.toLowerCase()} analysis covering factions, causal logic, and strategic constraints${statsSummary ? ` (${statsSummary})` : ''}.`
  return truncate(sentence)
}

export function buildHomeSeo(catalog = []) {
  const description = truncate(
    `Structured archive of anime universe system analyses. Explore ${catalog.length}+ machine-readable breakdowns of power economies, causal chains, factions, and governing rules.`
  )

  return {
    title: SITE_NAME,
    description,
    canonicalUrl: `${SITE_URL}/`,
    image: DEFAULT_OG_IMAGE,
    type: 'website',
  }
}

export function buildUniverseSeo(preview) {
  if (!preview) return buildHomeSeo()

  return {
    title: `${preview.anime} System Analysis | ${SITE_NAME}`,
    description: buildUniverseDescription(preview),
    canonicalUrl: `${SITE_URL}/universe/${preview.id}`,
    image: `${SITE_URL}/api/og?id=${preview.id}`,
    type: 'article',
  }
}

export function buildHomeStructuredData(catalog = []) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      description: 'A structured archive of fictional universe system analyses.',
      inLanguage: 'en',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${SITE_NAME} Universe Index`,
      url: `${SITE_URL}/`,
      isPartOf: {
        '@type': 'WebSite',
        name: SITE_NAME,
        url: `${SITE_URL}/`,
      },
      hasPart: catalog.map((entry) => ({
        '@type': 'CreativeWork',
        name: `${entry.anime} System Analysis`,
        url: `${SITE_URL}/universe/${entry.id}`,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      name: SITE_NAME,
      description: 'Machine-readable universe analyses built around characters, rules, factions, and causality.',
      url: `${SITE_URL}/`,
      creator: {
        '@type': 'Organization',
        name: SITE_NAME,
      },
      isAccessibleForFree: true,
    },
  ]
}

export function buildUniverseStructuredData(preview) {
  if (!preview) return []

  const pageUrl = `${SITE_URL}/universe/${preview.id}`
  const description = buildUniverseDescription(preview)

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: `${preview.anime} System Architecture Profile`,
      description,
      url: pageUrl,
      about: preview.anime,
      isPartOf: {
        '@type': 'CreativeWorkSeries',
        name: SITE_NAME,
        url: `${SITE_URL}/`,
      },
      inLanguage: 'en',
      genre: 'Analytical reference',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      name: `${preview.anime} System Dataset`,
      description,
      url: pageUrl,
      isPartOf: `${SITE_URL}/`,
      measurementTechnique: ['lore analysis', 'system analysis', 'causal mapping'],
      creator: {
        '@type': 'Organization',
        name: SITE_NAME,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Archive Home',
          item: `${SITE_URL}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: preview.anime,
          item: pageUrl,
        },
      ],
    },
  ]
}
