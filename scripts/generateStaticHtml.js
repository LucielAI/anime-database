/**
 * generateStaticHtml.js
 *
 * Generates pre-rendered static HTML files for all known routes.
 * Each HTML file contains:
 *   - Correct <title> and <meta> description tags
 *   - Full pre-rendered page content (visible to Googlebot immediately)
 *   - Inline JSON data for the SPA to consume on hydration
 *
 * Vercel serves public/ files directly before the SPA rewrite.
 * So /universe/naruto/ → serves public/universe/naruto/index.html (with real meta + content)
 * rather than rewriting to /index.html (SPA shell with generic meta).
 *
 * Run: node scripts/generateStaticHtml.js
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const PUBLIC_DIR = join(ROOT, 'public')
const DATA_DIR = join(ROOT, 'src', 'data')

const SITE_NAME = 'Anime Architecture Archive'
const SITE_URL = 'https://animearchive.app'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function truncate(str = '', limit = 160) {
  if (!str) return ''
  if (str.length <= limit) return str
  return str.slice(0, limit - 1).trimEnd() + '…'
}

function systemLabel(hint) {
  const map = {
    'timeline': 'Temporal-Causal',
    'node-graph': 'Relational Network',
    'counter-tree': 'Counter-Hierarchy',
    'hierarchy': 'Pure Hierarchy',
    'dual-axis': 'Dual-Axis',
  }
  return map[hint] || 'System Analysis'
}

function dangerLabel(level) {
  if (level >= 9) return 'CRITICAL'
  if (level >= 7) return 'HIGH'
  if (level >= 5) return 'MODERATE'
  if (level >= 3) return 'LOW'
  return 'MINIMAL'
}

// ---------------------------------------------------------------------------
// Data loading
// ---------------------------------------------------------------------------

async function loadCatalog() {
  try {
    const mod = await import(join(DATA_DIR, 'catalog.js'))
    return mod.UNIVERSE_CATALOG || []
  } catch {
    return []
  }
}

// ---------------------------------------------------------------------------
// HTML page templates
// ---------------------------------------------------------------------------

function buildHtml({ title, description, canonicalUrl, content, jsonData = null, ogImage }) {
  const escapedTitle = escapeHtml(title)
  const escapedDesc = escapeHtml(description)
  const escapedCanonical = escapeHtml(canonicalUrl)
  const escapedOg = escapeHtml(ogImage || `${SITE_URL}/og-fallback.png`)

  const jsonScript = jsonData
    ? `<script type="application/json" id="__ssr_data__">${JSON.stringify(jsonData)}</script>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapedTitle}</title>
  <meta name="description" content="${escapedDesc}" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <meta property="og:title" content="${escapedTitle}" />
  <meta property="og:description" content="${escapedDesc}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${escapedCanonical}" />
  <meta property="og:image" content="${escapedOg}" />
  <meta property="og:site_name" content="${SITE_NAME}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapedTitle}" />
  <meta name="twitter:description" content="${escapedDesc}" />
  <meta name="twitter:image" content="${escapedOg}" />
  <link rel="canonical" href="${escapedCanonical}" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #050508;
      color: #e2e8f0;
      font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
      min-height: 100vh;
    }
    .ssr-nav {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      background: rgba(5,5,8,0.95);
      position: sticky; top: 0; z-index: 30;
      backdrop-filter: blur(12px);
    }
    .ssr-nav-brand {
      font-size: 0.65rem; font-weight: 900; letter-spacing: 0.25em;
      text-transform: uppercase;
      background: linear-gradient(135deg, #22d3ee, #a855f7);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .ssr-nav-links { display: flex; gap: 1.5rem; }
    .ssr-nav-links a {
      font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase;
      color: #64748b; text-decoration: none;
    }
    .ssr-nav-links a:hover { color: #e2e8f0; }
    .ssr-container { max-width: 64rem; margin: 0 auto; padding: 2rem 1rem; }
    .ssr-hero {
      text-align: center; padding: 3rem 1rem 2rem;
      border-bottom: 1px solid rgba(255,255,255,0.05); margin-bottom: 2rem;
    }
    .ssr-hero-eyebrow {
      font-size: 0.6rem; letter-spacing: 0.3em; text-transform: uppercase;
      color: #22d3ee; margin-bottom: 0.75rem;
    }
    .ssr-hero-title {
      font-size: clamp(1.5rem, 4vw, 2.5rem);
      font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em;
      background: linear-gradient(135deg, #22d3ee 0%, #a855f7 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      line-height: 1.1; margin-bottom: 0.75rem;
    }
    .ssr-hero-desc {
      font-size: 0.8rem; color: #94a3b8; max-width: 42rem;
      margin: 0 auto; line-height: 1.7;
    }
    .ssr-badge-row { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; margin-top: 1rem; }
    .ssr-badge {
      font-size: 0.55rem; letter-spacing: 0.15em; text-transform: uppercase;
      padding: 0.25rem 0.6rem; border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.04); color: #64748b;
    }
    .ssr-badge.accent { border-color: rgba(34,211,238,0.3); color: #22d3ee; background: rgba(34,211,238,0.08); }
    .ssr-section-title {
      font-size: 0.6rem; letter-spacing: 0.3em; text-transform: uppercase;
      color: #475569; margin-bottom: 1rem; padding-bottom: 0.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .ssr-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
      gap: 0.75rem; margin-bottom: 2rem;
    }
    .ssr-card {
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 0.75rem; padding: 1rem;
      background: rgba(255,255,255,0.02);
      transition: border-color 0.2s;
    }
    .ssr-card:hover { border-color: rgba(34,211,238,0.3); }
    .ssr-card-name { font-size: 0.75rem; font-weight: 700; color: #e2e8f0; margin-bottom: 0.25rem; }
    .ssr-card-sub { font-size: 0.6rem; color: #64748b; margin-bottom: 0.5rem; }
    .ssr-card-bio { font-size: 0.65rem; color: #94a3b8; line-height: 1.6; }
    .ssr-danger {
      display: inline-flex; align-items: center; gap: 0.25rem;
      font-size: 0.55rem; letter-spacing: 0.15em; text-transform: uppercase;
      padding: 0.2rem 0.5rem; border-radius: 999px;
    }
    .ssr-danger.low { background: rgba(34,197,94,0.1); color: #4ade80; border: 1px solid rgba(34,197,94,0.2); }
    .ssr-danger.moderate { background: rgba(234,179,8,0.1); color: #facc15; border: 1px solid rgba(234,179,8,0.2); }
    .ssr-danger.high { background: rgba(249,115,22,0.1); color: #fb923c; border: 1px solid rgba(249,115,22,0.2); }
    .ssr-danger.critical { background: rgba(239,68,68,0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.2); }
    .ssr-footer {
      text-align: center; padding: 2rem 1rem;
      border-top: 1px solid rgba(255,255,255,0.05); margin-top: 3rem;
    }
    .ssr-footer p { font-size: 0.6rem; color: #475569; }
    .ssr-footer a { color: #64748b; text-decoration: none; }
    .ssr-footer a:hover { color: #22d3ee; }
    .ssr-loading {
      display: flex; align-items: center; justify-content: center;
      min-height: 60vh; flex-direction: column; gap: 1rem;
    }
    .ssr-spinner {
      width: 2rem; height: 2rem; border: 2px solid rgba(255,255,255,0.1);
      border-top-color: #22d3ee; border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .ssr-loading-text { font-size: 0.65rem; color: #475569; letter-spacing: 0.2em; text-transform: uppercase; }
  </style>
</head>
<body>
  <nav class="ssr-nav">
    <span class="ssr-nav-brand">Anime Architecture Archive</span>
    <div class="ssr-nav-links">
      <a href="${SITE_URL}/">Archive</a>
      <a href="${SITE_URL}/universes">Universes</a>
      <a href="${SITE_URL}/compare">Compare</a>
      <a href="${SITE_URL}/blog">Blog</a>
    </div>
  </nav>
  ${content}
  <footer class="ssr-footer">
    <p><a href="${SITE_URL}">Anime Architecture Archive</a> — Structured analysis of anime power systems, factions, and causal logic.</p>
  </footer>
  ${jsonScript}
</body>
</html>`
}

function universeContent(preview, data) {
  const chars = (data?.characters || []).slice(0, 6)
  const factions = (data?.factions || []).slice(0, 6)
  const powers = (data?.powerSystem || []).slice(0, 4)
  const charRows = chars.map(c => `
    <div class="ssr-card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.5rem;">
        <div>
          <div class="ssr-card-name">${escapeHtml(c.name)}</div>
          <div class="ssr-card-sub">${escapeHtml(c.title || c.rank || c.role || '')}</div>
        </div>
        ${c.dangerLevel ? `<span class="ssr-danger ${c.dangerLevel >= 8 ? 'critical' : c.dangerLevel >= 5 ? 'moderate' : 'low'}">${dangerLabel(c.dangerLevel)}</span>` : ''}
      </div>
      <div class="ssr-card-bio">${escapeHtml(truncate(c.loreBio || c.description || '', 120))}</div>
    </div>`).join('')

  const factionRows = factions.map(f => `
    <div class="ssr-card">
      <div class="ssr-card-name">${escapeHtml(f.name)}</div>
      <div class="ssr-card-sub">${escapeHtml(f.role || '')}</div>
      <div class="ssr-card-bio">${escapeHtml(truncate(f.loreDesc || f.systemDesc || '', 100))}</div>
    </div>`).join('')

  const powerRows = powers.map(p => `
    <div class="ssr-card">
      <div class="ssr-card-name">${escapeHtml(p.name)}</div>
      <div class="ssr-card-sub">${escapeHtml(p.subtitle || '')}</div>
      <div class="ssr-card-bio">${escapeHtml(truncate(p.loreDesc || '', 100))}</div>
    </div>`).join('')

  return `
  <main class="ssr-container">
    <div class="ssr-hero">
      <div class="ssr-hero-eyebrow">System Analysis</div>
      <h1 class="ssr-hero-title">${escapeHtml(preview.anime)}</h1>
      <p class="ssr-hero-desc">${escapeHtml(preview.tagline)}</p>
      <div class="ssr-badge-row">
        <span class="ssr-badge accent">${escapeHtml(systemLabel(preview.visualizationHint))}</span>
        <span class="ssr-badge">${preview.stats?.characters || 0} entities</span>
        <span class="ssr-badge">${preview.stats?.powerSystem || 0} mechanics</span>
        <span class="ssr-badge">${preview.stats?.rules || 0} rules</span>
      </div>
    </div>

    ${charRows ? `<section style="margin-bottom:2rem;">
      <div class="ssr-section-title">Key Characters</div>
      <div class="ssr-grid">${charRows}</div>
    </section>` : ''}

    ${factionRows ? `<section style="margin-bottom:2rem;">
      <div class="ssr-section-title">Factions</div>
      <div class="ssr-grid">${factionRows}</div>
    </section>` : ''}

    ${powerRows ? `<section style="margin-bottom:2rem;">
      <div class="ssr-section-title">Power Mechanics</div>
      <div class="ssr-grid">${powerRows}</div>
    </section>` : ''}
  </main>`
}

function characterContent(preview, character, charIndex) {
  const danger = character.dangerLevel ? dangerLabel(character.dangerLevel) : null
  const dangerClass = !danger ? '' : (character.dangerLevel >= 8 ? 'critical' : character.dangerLevel >= 5 ? 'moderate' : 'low')

  return `
  <main class="ssr-container">
    <div class="ssr-hero">
      <div class="ssr-hero-eyebrow">Character Analysis — ${escapeHtml(preview.anime)}</div>
      <h1 class="ssr-hero-title">${escapeHtml(character.name)}</h1>
      <p class="ssr-hero-desc">${escapeHtml(character.title || character.rank || character.role || '')}</p>
      <div class="ssr-badge-row">
        ${danger ? `<span class="ssr-danger ${dangerClass}">${danger} THREAT</span>` : ''}
        <span class="ssr-badge">${escapeHtml(preview.anime)}</span>
        <span class="ssr-badge accent">${escapeHtml(systemLabel(preview.visualizationHint))}</span>
      </div>
    </div>

    ${character.loreBio ? `<section style="margin-bottom:2rem;">
      <div class="ssr-section-title">Lore Profile</div>
      <div class="ssr-card" style="max-width:42rem;margin:0 auto;">
        <div class="ssr-card-bio" style="font-size:0.75rem;line-height:1.8;">${escapeHtml(character.loreBio)}</div>
      </div>
    </section>` : ''}

    ${character.systemBio ? `<section style="margin-bottom:2rem;">
      <div class="ssr-section-title">System Analysis</div>
      <div class="ssr-card" style="max-width:42rem;margin:0 auto;">
        <div class="ssr-card-bio" style="font-size:0.75rem;line-height:1.8;">${escapeHtml(character.systemBio)}</div>
      </div>
    </section>` : ''}

    ${character.primaryAbility ? `<section style="margin-bottom:2rem;">
      <div class="ssr-section-title">Primary Ability</div>
      <div class="ssr-card" style="max-width:42rem;margin:0 auto;">
        <div class="ssr-card-bio">${escapeHtml(character.primaryAbility)}</div>
      </div>
    </section>` : ''}
  </main>`
}

function factionContent(preview, faction) {
  return `
  <main class="ssr-container">
    <div class="ssr-hero">
      <div class="ssr-hero-eyebrow">Faction Analysis — ${escapeHtml(preview.anime)}</div>
      <h1 class="ssr-hero-title">${escapeHtml(faction.name)}</h1>
      <p class="ssr-hero-desc">${escapeHtml(faction.role || '')}</p>
      <div class="ssr-badge-row">
        <span class="ssr-badge">${escapeHtml(preview.anime)}</span>
        ${faction.memberCount ? `<span class="ssr-badge">${faction.memberCount} members</span>` : ''}
      </div>
    </div>

    ${faction.loreDesc ? `<section style="margin-bottom:2rem;">
      <div class="ssr-section-title">Role in the Universe</div>
      <div class="ssr-card" style="max-width:42rem;margin:0 auto;">
        <div class="ssr-card-bio" style="font-size:0.75rem;line-height:1.8;">${escapeHtml(faction.loreDesc)}</div>
      </div>
    </section>` : ''}

    ${faction.systemDesc ? `<section style="margin-bottom:2rem;">
      <div class="ssr-section-title">System Analysis</div>
      <div class="ssr-card" style="max-width:42rem;margin:0 auto;">
        <div class="ssr-card-bio" style="font-size:0.75rem;line-height:1.8;">${escapeHtml(faction.systemDesc)}</div>
      </div>
    </section>` : ''}
  </main>`
}

function powerContent(preview, power) {
  return `
  <main class="ssr-container">
    <div class="ssr-hero">
      <div class="ssr-hero-eyebrow">Power Mechanics — ${escapeHtml(preview.anime)}</div>
      <h1 class="ssr-hero-title">${escapeHtml(power.name)}</h1>
      <p class="ssr-hero-desc">${escapeHtml(power.subtitle || '')}</p>
      <div class="ssr-badge-row">
        <span class="ssr-badge">${escapeHtml(preview.anime)}</span>
      </div>
    </div>

    ${power.loreDesc ? `<section style="margin-bottom:2rem;">
      <div class="ssr-section-title">How It Works</div>
      <div class="ssr-card" style="max-width:42rem;margin:0 auto;">
        <div class="ssr-card-bio" style="font-size:0.75rem;line-height:1.8;">${escapeHtml(power.loreDesc)}</div>
      </div>
    </section>` : ''}

    ${power.systemDesc ? `<section style="margin-bottom:2rem;">
      <div class="ssr-section-title">System Analysis</div>
      <div class="ssr-card" style="max-width:42rem;margin:0 auto;">
        <div class="ssr-card-bio" style="font-size:0.75rem;line-height:1.8;">${escapeHtml(power.systemDesc)}</div>
      </div>
    </section>` : ''}
  </main>`
}

function catalogContent(catalog) {
  const cards = catalog.map(u => `
    <div class="ssr-card">
      <div class="ssr-card-name">${escapeHtml(u.anime)}</div>
      <div class="ssr-card-sub">${escapeHtml(truncate(u.tagline, 70))}</div>
      <div class="ssr-badge-row" style="margin-top:0.5rem;">
        <span class="ssr-badge accent">${escapeHtml(systemLabel(u.visualizationHint))}</span>
        <span class="ssr-badge">${u.stats?.characters || 0} entities</span>
      </div>
    </div>`).join('')

  return `
  <main class="ssr-container">
    <div class="ssr-hero">
      <div class="ssr-hero-eyebrow">Anime Universe Catalog</div>
      <h1 class="ssr-hero-title">30 Universe Analyses</h1>
      <p class="ssr-hero-desc">Browse every anime universe mapped as an engineered system — power hierarchies, faction networks, combat rules, and causal logic.</p>
    </div>
    <div class="ssr-grid">${cards}</div>
  </main>`
}

function blogIndexContent(posts) {
  const cards = posts.slice(0, 12).map(post => `
    <div class="ssr-card">
      <div class="ssr-card-name" style="font-size:0.8rem;margin-bottom:0.5rem;">${escapeHtml(post.title)}</div>
      <div class="ssr-card-bio">${escapeHtml(truncate(post.description || '', 120))}</div>
      <div class="ssr-badge-row" style="margin-top:0.75rem;">
        <span class="ssr-badge">${escapeHtml(post.date || '')}</span>
        ${(post.tags || []).slice(0,2).map(t => `<span class="ssr-badge accent">${escapeHtml(t)}</span>`).join('')}
      </div>
    </div>`).join('')

  return `
  <main class="ssr-container">
    <div class="ssr-hero">
      <div class="ssr-hero-eyebrow">Analysis Blog</div>
      <h1 class="ssr-hero-title">Anime System Analyses</h1>
      <p class="ssr-hero-desc">Deep dives into anime power systems, worldbuilding structure, and universe mechanics. Expert analysis written for fans who love the craft behind the story.</p>
    </div>
    <div class="ssr-grid">${cards}</div>
  </main>`
}

function renderBlogBlock(block, catalogMap) {
  switch (block.type) {
    case 'paragraph':
      return `<p style="font-size:0.8rem;line-height:1.8;color:#cbd5e1;margin-bottom:1.25rem;max-width:42rem;">${escapeHtml(block.text)}</p>`
    case 'heading':
      return `<h2 style="font-size:1.1rem;font-weight:800;uppercase;letter-spacing:0.05em;color:#fff;margin-top:2rem;margin-bottom:0.75rem;">${escapeHtml(block.text)}</h2>`
    case 'section-header':
      return `<p style="font-size:0.6rem;letter-spacing:0.25em;text-transform:uppercase;color:#64748b;margin-top:1.5rem;margin-bottom:0.5rem;border-bottom:1px solid rgba(255,255,255,0.05);padding-bottom:0.25rem;">${escapeHtml(block.text)}</p>`
    case 'universe-block': {
      const entry = catalogMap[block.slug]
      if (!entry) return ''
      return `<div style="border:1px solid rgba(255,255,255,0.08);border-left:3px solid ${entry.themeColors?.primary || '#22d3ee'};border-radius:0.75rem;padding:1rem;margin:1.5rem 0;background:rgba(255,255,255,0.02);">
        <p style="font-size:0.65rem;letter-spacing:0.2em;text-transform:uppercase;color:${entry.themeColors?.primary || '#22d3ee'};margin-bottom:0.5rem;">Universe Analysis</p>
        <p style="font-size:0.9rem;font-weight:700;color:#fff;margin-bottom:0.25rem;">${escapeHtml(entry.anime)}</p>
        <p style="font-size:0.7rem;color:#64748b;">${escapeHtml(truncate(entry.tagline, 80))}</p>
      </div>`
    }
    default:
      return ''
  }
}

function blogPostContent(post, catalogMap) {
  const blocks = (post.content || []).map(b => renderBlogBlock(b, catalogMap)).join('\n')

  return `
  <main class="ssr-container" style="max-width:46rem;">
    <div class="ssr-hero" style="text-align:left;padding:2rem 0;">
      <p style="font-size:0.65rem;letter-spacing:0.2em;text-transform:uppercase;color:#64748b;margin-bottom:0.75rem;">
        ${escapeHtml(post.date || '')} · ${escapeHtml(post.author || 'Anime Architecture Archive')}
      </p>
      <h1 style="font-size:clamp(1.4rem,4vw,2.2rem);font-weight:900;uppercase;letter-spacing:0.05em;background:linear-gradient(135deg,#22d3ee,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1.1;margin-bottom:1rem;">
        ${escapeHtml(post.title)}
      </h1>
      <p style="font-size:0.85rem;color:#94a3b8;max-width:36rem;line-height:1.7;margin-bottom:1rem;">
        ${escapeHtml(post.description || '')}
      </p>
      ${(post.tags || []).length > 0 ? `<div class="ssr-badge-row" style="justify-content:flex-start;">
        ${post.tags.map(t => `<span class="ssr-badge accent">${escapeHtml(t)}</span>`).join('')}
      </div>` : ''}
    </div>
    <div style="margin-top:1rem;">
      ${blocks}
    </div>
  </main>`
}

// ---------------------------------------------------------------------------
// Main generation
// ---------------------------------------------------------------------------

async function generate() {
  console.log('[static-html] Starting static HTML generation...')

  // Load catalog
  let catalog = []
  try {
    const mod = await import(join(DATA_DIR, 'catalog.js'))
    catalog = mod.UNIVERSE_CATALOG || []
  } catch (e) {
    console.error('[static-html] Could not load catalog:', e.message)
    process.exit(1)
  }

  const universeFiles = []
  try {
    const { readdirSync } = await import('fs')
    universeFiles.push(...readdirSync(DATA_DIR).filter(f => f.endsWith('.core.json') || f.endsWith('.json')))
  } catch (e) {
    console.error('[static-html] Could not read data dir:', e.message)
  }

  const dataCache = {}
  for (const file of universeFiles) {
    try {
      const raw = readFileSync(join(DATA_DIR, file), 'utf-8')
      dataCache[file] = JSON.parse(raw)
    } catch {}
  }

  let pagesGenerated = 0

  // NOTE: We do NOT pre-render SPA-only routes (/universes, /about, /compare, /privacy).
  // Pre-rendering these causes content mismatch on refresh: the static HTML shows briefly,
  // then React swaps to its own content. Universe pages and blog posts ARE pre-rendered
  // because they have complex visualizations and are important for SEO.

  // --- Universe pages + sub-pages ---
  for (const preview of catalog) {
    const universeId = preview.id
    const dataFile = Object.values(dataCache).find(d => d.anime === preview.anime || d.anime === preview.anime?.replace(': ', ': '))
    const data = dataCache[`${universeId}.core.json`] || dataCache[`${universeId}.json`] || dataFile || null

    // Universe index page
    try {
      const content = universeContent(preview, data)
      const desc = truncate(preview.tagline || `${preview.anime} — system architecture analysis.`, 160)
      const html = buildHtml({
        title: `${preview.anime} System Analysis | ${SITE_NAME}`,
        description: desc,
        canonicalUrl: `${SITE_URL}/universe/${universeId}`,
        ogImage: `${SITE_URL}/api/og?id=${universeId}`,
        content,
        jsonData: data,
      })
      const outPath = join(PUBLIC_DIR, 'universe', universeId, 'index.html')
      mkdirSync(dirname(outPath), { recursive: true })
      writeFileSync(outPath, html)
      pagesGenerated++
      console.log(`[static-html] Generated /universe/${universeId}/`)
    } catch (e) {
      console.error(`[static-html] Failed universe ${universeId}:`, e.message)
    }

    // Character pages
    const characters = data?.characters || []
    for (let i = 0; i < characters.length; i++) {
      const char = characters[i]
      try {
        const content = characterContent(preview, char, i)
        const desc = truncate(
          char.loreBio
            ? `${char.name} — ${char.title || char.rank || ''}: ${char.loreBio}`
            : `${char.name}: ${char.role || 'character'} in ${preview.anime}. Ranked within the universe's power hierarchy, faction structure, and combat logic.`,
          160
        )
        const html = buildHtml({
          title: `${char.name} — ${preview.anime} | ${SITE_NAME}`,
          description: desc,
          canonicalUrl: `${SITE_URL}/universe/${universeId}/character/${i}`,
          ogImage: `${SITE_URL}/api/og?id=${universeId}`,
          content,
        })
        const outPath = join(PUBLIC_DIR, 'universe', universeId, 'character', String(i), 'index.html')
        mkdirSync(dirname(outPath), { recursive: true })
        writeFileSync(outPath, html)
        pagesGenerated++
      } catch (e) {
        console.error(`[static-html] Failed char ${universeId}/${i}:`, e.message)
      }
    }

    // Faction pages
    const factions = data?.factions || []
    for (let i = 0; i < factions.length; i++) {
      const faction = factions[i]
      try {
        const content = factionContent(preview, faction)
        const desc = truncate(
          faction.loreDesc
            ? `${faction.name} (${faction.role}): ${faction.loreDesc}`
            : `${faction.name}: a ${faction.role || 'faction'} in ${preview.anime}. Structural role within the power hierarchy.`,
          160
        )
        const html = buildHtml({
          title: `${faction.name} — ${preview.anime} | ${SITE_NAME}`,
          description: desc,
          canonicalUrl: `${SITE_URL}/universe/${universeId}/faction/${i}`,
          ogImage: `${SITE_URL}/api/og?id=${universeId}`,
          content,
        })
        const outPath = join(PUBLIC_DIR, 'universe', universeId, 'faction', String(i), 'index.html')
        mkdirSync(dirname(outPath), { recursive: true })
        writeFileSync(outPath, html)
        pagesGenerated++
      } catch (e) {
        console.error(`[static-html] Failed faction ${universeId}/${i}:`, e.message)
      }
    }

    // Power pages
    const powers = data?.powerSystem || []
    for (let i = 0; i < powers.length; i++) {
      const power = powers[i]
      try {
        const content = powerContent(preview, power)
        const desc = truncate(
          power.loreDesc
            ? `${power.name} — ${power.subtitle || ''}: ${power.loreDesc}`
            : `${power.name}: a power mechanic in ${preview.anime}. Combat applications and system logic analyzed.`,
          160
        )
        const html = buildHtml({
          title: `${power.name} — ${preview.anime} | ${SITE_NAME}`,
          description: desc,
          canonicalUrl: `${SITE_URL}/universe/${universeId}/power/${i}`,
          ogImage: `${SITE_URL}/api/og?id=${universeId}`,
          content,
        })
        const outPath = join(PUBLIC_DIR, 'universe', universeId, 'power', String(i), 'index.html')
        mkdirSync(dirname(outPath), { recursive: true })
        writeFileSync(outPath, html)
        pagesGenerated++
      } catch (e) {
        console.error(`[static-html] Failed power ${universeId}/${i}:`, e.message)
      }
    }
  }

  // --- Blog index + blog posts ---
  try {
    const { readdirSync, readFileSync: rf } = await import('fs')
    const blogFiles = readdirSync(join(PUBLIC_DIR, 'blog', 'data')).filter(f => f.endsWith('.json'))
    const blogPosts = blogFiles.map(f => {
      try { return JSON.parse(rf(join(PUBLIC_DIR, 'blog', 'data', f), 'utf-8')) } catch { return null }
    }).filter(Boolean)

    // Build catalog map for universe links
    const catalogMap = {}
    for (const entry of catalog) catalogMap[entry.id] = entry

    // Blog index page
    try {
      const content = blogIndexContent(blogPosts)
      const html = buildHtml({
        title: `Anime Analysis Blog — Power Systems, Worldbuilding & More | ${SITE_NAME}`,
        description: `Deep dives into anime power systems, worldbuilding structure, and universe mechanics. Expert analysis written for fans who love the craft behind the story.`,
        canonicalUrl: `${SITE_URL}/blog`,
        ogImage: `${SITE_URL}/og-fallback.png`,
        content,
      })
      const outPath = join(PUBLIC_DIR, 'blog', 'index.html')
      mkdirSync(dirname(outPath), { recursive: true })
      writeFileSync(outPath, html)
      pagesGenerated++
      console.log(`[static-html] Generated /blog/index`)
    } catch (e) {
      console.error('[static-html] Failed /blog:', e.message)
    }

    // Individual blog post pages
    for (const post of blogPosts) {
      try {
        const slug = post.slug || post.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'post'
        const content = blogPostContent(post, catalogMap)
        const html = buildHtml({
          title: `${post.title} | ${SITE_NAME}`,
          description: post.description || '',
          canonicalUrl: `${SITE_URL}/blog/${slug}`,
          ogImage: post.coverImage || `${SITE_URL}/og-fallback.png`,
          content,
        })
        const outPath = join(PUBLIC_DIR, 'blog', slug, 'index.html')
        mkdirSync(dirname(outPath), { recursive: true })
        writeFileSync(outPath, html)
        pagesGenerated++
      } catch (e) {
        console.error(`[static-html] Failed blog post ${post.slug}:`, e.message)
      }
    }
  } catch (e) {
    console.error('[static-html] Failed blog generation:', e.message)
  }

  console.log(`[static-html] Done. Generated ${pagesGenerated} static HTML pages.`)
}

generate().catch(e => {
  console.error('[static-html] Fatal:', e)
  process.exit(1)
})
