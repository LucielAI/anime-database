export const SITE_NAME = 'Anime Architecture Archive'
export const SITE_URL = 'https://animearchive.app'

function truncate(text, limit = 160) {
  if (!text) return ''
  if (text.length <= limit) return text
  return `${text.slice(0, limit - 1).trimEnd()}…`
}

export function buildHomeSeo(catalog = []) {
  const description = truncate(
    `Structured analysis archive of anime universes. Explore ${catalog.length}+ system breakdowns spanning power economies, causal chains, factions, and rule architectures.`
  )

  return {
    title: SITE_NAME,
    description,
    canonicalUrl: `${SITE_URL}/`,
    image: `${SITE_URL}/og/default.png`,
    type: 'website',
  }
}

export function buildUniverseSeo(preview) {
  if (!preview) return buildHomeSeo()

  const description = truncate(
    `${preview.anime}: ${preview.tagline} Explore system mechanics, causal structure, factions, and ranked entities in the Anime Architecture Archive.`
  )

  return {
    title: `${preview.anime} Universe Analysis | ${SITE_NAME}`,
    description,
    canonicalUrl: `${SITE_URL}/universe/${preview.id}`,
    image: preview.animeImageUrl || `${SITE_URL}/og/default.png`,
    type: 'article',
  }
}

export function buildHomeStructuredData(catalog = []) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      name: SITE_NAME,
      description: 'A machine-readable archive of structured anime universe analyses and system-level mechanics.',
      url: `${SITE_URL}/`,
      creator: {
        '@type': 'Organization',
        name: SITE_NAME,
      },
      isAccessibleForFree: true,
      keywords: ['anime analysis', 'fictional systems', 'power systems', 'causal graphs', 'universe index'],
      distribution: catalog.map((entry) => ({
        '@type': 'DataDownload',
        name: entry.anime,
        contentUrl: `${SITE_URL}/universe/${entry.id}`,
        encodingFormat: 'text/html',
      })),
    },
  ]
}

export function buildUniverseStructuredData(preview) {
  if (!preview) return []

  const pageUrl = `${SITE_URL}/universe/${preview.id}`
  const description = `${preview.anime} system architecture profile in the Anime Architecture Archive.`

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
      keywords: [preview.anime, preview.visualizationHint, 'anime universe analysis', 'fictional system architecture'],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: `${preview.anime} Universe Analysis`,
      description,
      mainEntityOfPage: pageUrl,
      author: {
        '@type': 'Organization',
        name: SITE_NAME,
      },
      image: preview.animeImageUrl || undefined,
      dateModified: new Date().toISOString(),
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
