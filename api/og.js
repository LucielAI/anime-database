import { UNIVERSE_CATALOG_MAP } from '../src/data/catalog.js'
import { getClassificationLabel } from '../src/utils/getClassificationLabel.js'

export const config = {
  runtime: 'edge',
}

const FALLBACK = {
  anime: 'Anime Architecture Archive',
  tagline: 'Fictional Universe Intelligence System',
  visualizationHint: 'standard-cards',
  themeColors: { primary: '#22d3ee' },
}

function normalizePreview(id) {
  const normalizedId = (id || '').trim().toLowerCase()
  return UNIVERSE_CATALOG_MAP[normalizedId] || FALLBACK
}

function generateSVG(title, subtitle, typeLabel, themeColor) {
  const width = 1200
  const height = 630
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap');
      text { font-family: 'Roboto Mono', monospace; }
      .title { font-size: 84px; font-weight: 900; fill: #ffffff; }
      .subtitle { font-size: 26px; font-weight: bold; fill: ${themeColor}; }
      .type-label { font-size: 28px; font-weight: bold; fill: ${themeColor}; letter-spacing: 0.2em; }
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
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="#050508" />
  <rect width="100%" height="100%" fill="url(#grid)" />
  
  <!-- Main container -->
  <rect x="40" y="40" width="1120" height="550" rx="24" fill="rgba(255,255,255,0.03)" 
        stroke="rgba(255,255,255,0.1)" stroke-width="2" />
  
  <!-- Glow effect -->
  <rect x="40" y="40" width="1120" height="550" rx="24" fill="none" 
        stroke="${themeColor}" stroke-width="2" opacity="0.2" filter="url(#glow)" />
  
  <!-- Type label -->
  <text x="100" y="120" class="type-label">// ${typeLabel}</text>
  
  <!-- System profile badge -->
  <rect x="920" y="80" width="200" height="50" rx="25" fill="rgba(0,0,0,0.5)" 
        stroke="rgba(255,255,255,0.2)" stroke-width="1" />
  <text x="1020" y="112" text-anchor="middle" class="system-profile">SYSTEM PROFILE</text>
  
  <!-- Title -->
  <text x="100" y="350" class="title">${title}</text>
  
  <!-- Subtitle -->
  <text x="100" y="420" class="subtitle">${subtitle}</text>
  
  <!-- Footer -->
  <text x="1100" y="590" text-anchor="end" class="footer">ANIME_ARCHITECTURE_ARCHIVE</text>
</svg>`
}

export default async function handler(request) {
  try {
    const { searchParams } = new URL(request.url)
    const preview = normalizePreview(searchParams.get('id'))

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