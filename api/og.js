export const config = {
  runtime: 'edge',
}

// Minimal self-contained mapping
const UNIVERSE_MAP = {
  aot: {
    anime: 'Attack on Titan',
    tagline: 'A brutal deterministic closed-loop temporal matrix',
    visualizationHint: 'timeline',
    themeColors: { primary: '#6b7280' }
  },
  jjk: {
    anime: 'Jujutsu Kaisen',
    tagline: 'Negative Energy Economy & Algorithmic Combat',
    visualizationHint: 'counter-tree',
    themeColors: { primary: '#4f46e5' }
  },
  chainsawman: {
    anime: 'Chainsaw Man',
    tagline: 'A fear-fed devil economy where control networks weaponize trauma, contracts, and identity erasure.',
    visualizationHint: 'node-graph',
    themeColors: { primary: '#dc2626' }
  },
  demonslayer: {
    anime: 'Demon Slayer: Kimetsu no Yaiba',
    tagline: 'A nocturnal immortality network versus humans burning their own lifespan for solar-grade kill windows.',
    visualizationHint: 'counter-tree',
    themeColors: { primary: '#dc2626' }
  },
  hxh: {
    anime: 'Hunter x Hunter',
    tagline: 'Contractual Power Economy & Asymmetric Information Warfare',
    visualizationHint: 'node-graph',
    themeColors: { primary: '#059669' }
  },
  vinlandsaga: {
    anime: 'Vinland Saga',
    tagline: 'A deterministic economy of retributive violence',
    visualizationHint: 'node-graph',
    themeColors: { primary: '#d97706' }
  },
  steinsgate: {
    anime: 'Steins;Gate',
    tagline: 'A deterministic attractor-field prison where convergence cannot be outrun — only rewritten',
    visualizationHint: 'timeline',
    themeColors: { primary: '#22d3ee' }
  },
  deathnote: {
    anime: 'Death Note',
    tagline: 'An asymmetric information war where anonymous execution power collides with probabilistic deanonymization — and psychology leaks what cryptography cannot',
    visualizationHint: 'node-graph',
    themeColors: { primary: '#dc2626' }
  },
  fmab: {
    anime: 'Fullmetal Alchemist: Brotherhood',
    tagline: 'A closed thermodynamic system where every act of creation demands an equal destruction — and a 400-year parasite has been rigging the ledger from beneath the earth',
    visualizationHint: 'node-graph',
    themeColors: { primary: '#d97706' }
  },
  codegeass: {
    anime: 'Code Geass: Hangyaku no Lelouch',
    tagline: 'An occupied nation becomes a control-war between imperial hierarchy, masked insurgency, and a will-hacking anomaly that turns strategy into governance engineering.',
    visualizationHint: 'node-graph',
    themeColors: { primary: '#7c3aed' }
  },
  mha: {
    anime: 'My Hero Academia',
    tagline: 'Mutating biological power collides with state-managed hero capitalism.',
    visualizationHint: 'node-graph',
    themeColors: { primary: '#0ea5e9' }
  },
  frieren: {
    anime: 'Sousou no Frieren',
    tagline: 'A post-war fantasy where mana deception, lifespan asymmetry, and visualization limits decide who survives.',
    visualizationHint: 'timeline',
    themeColors: { primary: '#0f766e' }
  },
  sololeveling: {
    anime: 'Solo Leveling',
    tagline: 'A fixed-rank hunter economy is broken by one player running an infinite growth protocol.',
    visualizationHint: 'node-graph',
    themeColors: { primary: '#1d4ed8' }
  },
  goblinslayer: {
    anime: 'Goblin Slayer',
    tagline: 'A low-prestige extermination niche becomes the hidden maintenance layer that keeps a fantasy civilization from collapsing.',
    visualizationHint: 'node-graph',
    themeColors: { primary: '#065f46' }
  },
  mushokutensei: {
    anime: 'Mushoku Tensei: Jobless Reincarnation',
    tagline: 'A reincarnation-driven fate system where mana growth, bloodline factors, and looping causality decide civilization-scale outcomes.',
    visualizationHint: 'timeline',
    themeColors: { primary: '#0f766e' }
  },
  naruto: {
    anime: 'Naruto',
    tagline: 'A shinobi world where political loyalty, inter-village competition, and bloodline hierarchies define power more than any individual combat outcome.',
    visualizationHint: 'node-graph',
    themeColors: { primary: '#f59e0b' }
  },
  dragonballz: {
    anime: 'Dragon Ball Z',
    tagline: 'A vertical ki hierarchy where exponential transformation tiers, power levels, and the brutal arithmetic of who can destroy what define every combat outcome.',
    visualizationHint: 'counter-tree',
    themeColors: { primary: '#f97316' }
  },
  'one-piece': {
    anime: 'One Piece',
    tagline: 'An empire-faction control network where rubber physiology, haki willpower, and devil fruit economics determine who owns the seas.',
    visualizationHint: 'node-graph',
    themeColors: { primary: '#dc2626' }
  }
}

const FALLBACK = {
  anime: 'Anime Architecture Archive',
  tagline: 'Fictional Universe Intelligence System',
  visualizationHint: 'standard-cards',
  themeColors: { primary: '#22d3ee' },
}

function getClassificationLabel(hint) {
  switch (hint) {
    case 'timeline': return 'TIMELINE SYSTEM'
    case 'counter-tree': return 'COUNTERPLAY SYSTEM'
    case 'node-graph': return 'RELATIONAL SYSTEM'
    case 'affinity-matrix': return 'AFFINITY SYSTEM'
    case 'standard-cards': return 'CARD SYSTEM'
    default: return 'CLASSIFIED SYSTEM'
  }
}

function normalizePreview(id) {
  const normalizedId = (id || '').trim().toLowerCase()
  return UNIVERSE_MAP[normalizedId] || FALLBACK
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