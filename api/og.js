import { UNIVERSE_MAP, INSIGHTS_MAP } from './og-universes.js'

const FALLBACK = {
  anime: 'Anime Architecture Archive',
  tagline: 'Fictional Universe Intelligence System',
  visualizationHint: 'standard-cards',
  themeColors: { primary: '#22d3ee' },
}

function getClassificationLabel(hint) {
  switch (hint) {
    case 'timeline':       return 'TIMELINE SYSTEM'
    case 'counter-tree':   return 'COUNTERPLAY SYSTEM'
    case 'node-graph':     return 'RELATIONAL SYSTEM'
    case 'affinity-matrix': return 'AFFINITY SYSTEM'
    case 'standard-cards': return 'CARD SYSTEM'
    default:               return 'CLASSIFIED SYSTEM'
  }
}

function normalizePreview(id) {
  const normalizedId = (id || '').trim().toLowerCase()
  return UNIVERSE_MAP[normalizedId] || FALLBACK
}

function escXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function generateSVG(title, subtitle, typeLabel, themeColor) {
  const width = 1200
  const height = 630

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&amp;display=swap');
      text { font-family: 'Roboto Mono', monospace; }
      .title { font-size: 84px; font-weight: 900; fill: #ffffff; }
      .subtitle { font-size: 26px; font-weight: bold; fill: ${escXml(themeColor)}; }
      .type-label { font-size: 28px; font-weight: bold; fill: ${escXml(themeColor)}; letter-spacing: 0.2em; }
      .footer { font-size: 24px; fill: rgba(255,255,255,0.4); letter-spacing: 0.3em; }
      .system-profile { font-size: 20px; font-weight: bold; fill: #ffffff; letter-spacing: 0.2em; }
    </style>
    <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
      <circle cx="25" cy="25" r="2" fill="rgba(255,255,255,0.05)" />
      <circle cx="75" cy="75" r="2" fill="rgba(255,255,255,0.05)" />
    </pattern>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="15" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <rect width="100%" height="100%" fill="#050508" />
  <rect width="100%" height="100%" fill="url(#grid)" />

  <rect x="40" y="40" width="1120" height="550" rx="24" fill="rgba(255,255,255,0.03)"
        stroke="rgba(255,255,255,0.1)" stroke-width="2" />

  <rect x="40" y="40" width="1120" height="550" rx="24" fill="none"
        stroke="${escXml(themeColor)}" stroke-width="2" opacity="0.2" filter="url(#glow)" />

  <text x="100" y="120" class="type-label">// ${escXml(typeLabel)}</text>

  <rect x="920" y="80" width="200" height="50" rx="25" fill="rgba(0,0,0,0.5)"
        stroke="rgba(255,255,255,0.2)" stroke-width="1" />
  <text x="1020" y="112" text-anchor="middle" class="system-profile">SYSTEM PROFILE</text>

  <text x="100" y="350" class="title">${escXml(title)}</text>
  <text x="100" y="420" class="subtitle">${escXml(subtitle)}</text>
  <text x="1100" y="590" text-anchor="end" class="footer">ANIME_ARCHITECTURE_ARCHIVE</text>
</svg>`
}

function generateInsightSVG(title, subtitle, themeColor) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&amp;display=swap');
      text { font-family: 'Roboto Mono', monospace; }
      .title { font-size: 56px; font-weight: 900; fill: #ffffff; }
      .subtitle { font-size: 22px; font-weight: bold; fill: ${escXml(themeColor)}; }
      .type-label { font-size: 24px; font-weight: bold; fill: ${escXml(themeColor)}; letter-spacing: 0.2em; }
      .footer { font-size: 20px; fill: rgba(255,255,255,0.4); letter-spacing: 0.3em; }
    </style>
    <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
      <circle cx="25" cy="25" r="2" fill="rgba(255,255,255,0.05)" />
      <circle cx="75" cy="75" r="2" fill="rgba(255,255,255,0.05)" />
    </pattern>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="12" result="blur" />
      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="#050508" />
  <rect width="100%" height="100%" fill="url(#grid)" />
  <rect x="40" y="40" width="1120" height="550" rx="24" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" stroke-width="2" />
  <rect x="40" y="40" width="1120" height="550" rx="24" fill="none" stroke="${escXml(themeColor)}" stroke-width="2" opacity="0.2" filter="url(#glow)" />
  <text x="100" y="120" class="type-label">// SYSTEM BREAKDOWN</text>
  <rect x="920" y="80" width="200" height="50" rx="25" fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
  <text x="1020" y="112" text-anchor="middle" class="type-label" style="font-size:18px">INSIGHTS</text>
  <text x="100" y="340" class="title">${escXml(title)}</text>
  <text x="100" y="410" class="subtitle">${escXml(subtitle)}</text>
  <text x="1100" y="590" text-anchor="end" class="footer">ANIME_ARCHITECTURE_INSIGHTS</text>
</svg>`
}

export const config = {
  runtime: 'edge',
}

export default async function handler(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    const insight = INSIGHTS_MAP[id]
    if (insight) {
      const svg = generateInsightSVG(
        insight.title.toUpperCase(),
        insight.tagline.toUpperCase(),
        insight.themeColor
      )
      return new Response(svg, {
        status: 200,
        headers: {
          'content-type': 'image/svg+xml',
          'cache-control': 'public, s-maxage=86400, stale-while-revalidate=604800',
        },
      })
    }

    const preview = normalizePreview(id)
    const title = preview.anime.toUpperCase()
    const subtitle = preview.tagline.toUpperCase()
    const typeLabel = `${getClassificationLabel(preview.visualizationHint).toUpperCase()} ARCHIVE`
    const themeColor = preview.themeColors?.primary || '#22d3ee'

    const svg = generateSVG(title, subtitle, typeLabel, themeColor)

    return new Response(svg, {
      status: 200,
      headers: {
        'content-type': 'image/svg+xml',
        'cache-control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    })
  } catch (error) {
    console.error('OG SVG endpoint error:', error)
    return new Response('Failed to generate OG image', { status: 500 })
  }
}
