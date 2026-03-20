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

  const intro = preview.introductionSummary ? `${preview.introductionSummary} ` : ''
  const sentence = `${preview.anime}: ${intro}${preview.tagline} Structured ${lens.toLowerCase()} analysis covering factions, causal logic, and strategic constraints${statsSummary ? ` (${statsSummary})` : ''}.`
  return truncate(sentence)
}

export function buildHomeSeo(catalog = []) {
  const description = truncate(
    `Explore anime power systems, anime analysis, and anime comparison in one archive. Compare ${catalog.length}+ anime worlds for strategy, combat logic, and worldbuilding structure.`
  )

  return {
    title: `Anime Power Systems Analysis Archive | Compare Anime Worlds`,
    description,
    keywords: 'anime power systems, anime analysis, anime comparison, best anime systems, anime worldbuilding',
    canonicalUrl: `${SITE_URL}/`,
    image: DEFAULT_OG_IMAGE,
    type: 'website',
  }
}


export function buildCatalogSeo(catalog = []) {
  const description = truncate(`Browse ${catalog.length}+ anime universes in a searchable, sortable archive catalog built for power system comparison, faction analysis, and worldbuilding study.`)

  return {
    title: `Universe Catalog | ${SITE_NAME}`,
    description,
    canonicalUrl: `${SITE_URL}/universes`,
    image: DEFAULT_OG_IMAGE,
    type: 'website',
  }
}

export function buildCatalogStructuredData(catalog = []) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${SITE_NAME} Universe Catalog`,
      description: 'Searchable and sortable catalog for anime universe analysis.',
      url: `${SITE_URL}/universes`,
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
  ]
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

export function buildHomeStructuredData(catalog = [], options = {}) {
  const featuredUniverses = options.featuredUniverses || []
  const structureGroups = options.structureGroups || []

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      description: 'A curated anime archive and reference graph for fictional universe system analysis.',
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
      '@type': 'ItemList',
      name: 'Top Featured Archive Systems',
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      numberOfItems: featuredUniverses.length,
      itemListElement: featuredUniverses.map((entry, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}/universe/${entry.id}`,
        name: entry.anime,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Explore by System Structure',
      itemListElement: structureGroups.map((group, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: `${group.label} (${group.count})`,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Hashi.Ai',
      url: `${SITE_URL}/`,
      description: 'AI-native anime architecture platform. Structured analysis of fictional universes as systems.',
      sameAs: [
        'https://www.tiktok.com/@hashi.ai',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      name: SITE_NAME,
      description: 'Machine-readable universe analyses built around characters, rules, factions, and causality.',
      url: `${SITE_URL}/`,
      creator: {
        '@type': 'Organization',
        name: 'Hashi.Ai',
      },
      license: 'https://creativecommons.org/licenses/by-nc/4.0/',
      isAccessibleForFree: true,
    },
  ]
}

export function buildUniverseStructuredData(preview, options = {}) {
  if (!preview) return []

  const pageUrl = `${SITE_URL}/universe/${preview.id}`
  const description = buildUniverseDescription(preview)
  const systemQuestions = options.systemQuestions || preview.systemQuestions || []
  const aiInsights = preview.aiInsights || []

  // Build FAQPage schema from systemQuestions
  const faqSchema = systemQuestions.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: systemQuestions.slice(0, 8).map((q) => ({
      '@type': 'Question',
      name: q.question || q.q || q.title || 'What is the ' + preview.anime + ' power system?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer || q.answerText || q.summary || q.lore || '',
      },
    })),
  } : null

  // Build HowTo schema from aiInsights
  const howToSchema = aiInsights.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to understand ${preview.anime}'s power system`,
    description: description,
    step: aiInsights.slice(0, 3).map((insight, i) => ({
      '@type': 'HowToStep',
      name: insight.title || `Step ${i + 1}`,
      text: insight.summary || insight.text || insight.casual || insight.deep || '',
    })),
  } : null

  const schemas = [
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
      license: 'https://creativecommons.org/licenses/by-nc/4.0/',
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
        name: 'Hashi.Ai',
        url: 'https://animearchive.app',
      },
      license: 'https://creativecommons.org/licenses/by-nc/4.0/',
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

  if (faqSchema) schemas.push(faqSchema)
  if (howToSchema) schemas.push(howToSchema)

  return schemas
}
