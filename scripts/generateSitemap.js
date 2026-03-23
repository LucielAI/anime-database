// Generates public/sitemap.xml from the universe slugs in src/data/.
// Runs automatically: before every `vite build` and after `add:universe`.
// Manual: node scripts/generateSitemap.js

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = 'https://animearchive.app'
const DATA_DIR = path.join(__dirname, '../src/data')
const OUT_FILE = path.join(__dirname, '../public/sitemap.xml')
const BLOG_DIR = path.join(__dirname, '../content/blog')

// Thematic page slugs — mirrors THEMATIC_PAGES in src/config/thematicPages.js
const THEMATIC_SLUGS = [
  'relational-systems',
  'counterplay-systems',
  'timeline-systems',
  'control-systems',
  'closed-loop-systems',
  'power-economy-systems',
]

function getSlugs() {
  return fs
    .readdirSync(DATA_DIR)
    .filter(f => f.endsWith('.json') && !f.endsWith('.extended.json'))
    .map(f => f.replace(/\.core\.json$/, '').replace(/\.json$/, ''))
    .filter((slug, i, arr) => arr.indexOf(slug) === i)
    .filter(Boolean)
    .sort()
}

function getPayload(slug) {
  const candidates = [
    path.join(DATA_DIR, `${slug}.core.json`),
    path.join(DATA_DIR, `${slug}.json`),
  ]
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      try {
        return JSON.parse(fs.readFileSync(p, 'utf8'))
      } catch {
        return null
      }
    }
  }
  return null
}

function getBlogSlugs() {
  if (!fs.existsSync(BLOG_DIR)) return []
  return fs
    .readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.md') || f.endsWith('.mdx') || f.endsWith('.json'))
    .map(f => f.replace(/\.(md|mdx|json)$/, ''))
    .filter(Boolean)
    .sort()
}

function buildSitemap(slugs) {
  const lastmod = new Date().toISOString().split('T')[0]
  const blogSlugs = getBlogSlugs()

  const staticUrls = [
    { loc: `${BASE_URL}/`, priority: '1.0', changefreq: 'weekly', lastmod },
    { loc: `${BASE_URL}/universes`, priority: '0.9', changefreq: 'weekly', lastmod },
    { loc: `${BASE_URL}/compare`, priority: '0.7', changefreq: 'monthly', lastmod },
    { loc: `${BASE_URL}/search`, priority: '0.7', changefreq: 'weekly', lastmod },
    { loc: `${BASE_URL}/about`, priority: '0.5', changefreq: 'monthly', lastmod },
    { loc: `${BASE_URL}/privacy`, priority: '0.3', changefreq: 'yearly', lastmod },
    { loc: `${BASE_URL}/insights`, priority: '0.8', changefreq: 'weekly', lastmod },
  ]

  // Insights/post slugs — from INSIGHTS_BY_SLUG keys in src/data/insights-content.js
  const INSIGHT_SRC = path.join(__dirname, '../src/data/insights-content.js')
  let insightSlugs = []
  try {
    const s = fs.readFileSync(INSIGHT_SRC, 'utf8')
    const keys1 = [...s.matchAll(/^  '([^']+)':/gm)].map(m => m[1])
    const keys2 = [...s.matchAll(/^  "([^"]+)":/gm)].map(m => m[1])
    insightSlugs = [...new Set([...keys1, ...keys2])]
  } catch {
    insightSlugs = []
  }
  const insightUrls = insightSlugs.map(slug => ({
    loc: `${BASE_URL}/insights/${slug}`,
    priority: '0.7',
    changefreq: 'monthly',
    lastmod,
  }))

  // Blog pages
  const blogUrls = blogSlugs.length > 0
    ? [
        { loc: `${BASE_URL}/blog`, priority: '0.8', changefreq: 'weekly', lastmod },
        ...blogSlugs.map(slug => ({
          loc: `${BASE_URL}/blog/${slug}`,
          priority: '0.7',
          changefreq: 'monthly',
          lastmod,
        })),
      ]
    : []

  // Thematic/systems pages
  const thematicUrls = THEMATIC_SLUGS.map(slug => ({
    loc: `${BASE_URL}/systems/${slug}`,
    priority: '0.7',
    changefreq: 'monthly',
    lastmod,
  }))

  // Universe index pages
  const universeUrls = slugs.map(slug => ({
    loc: `${BASE_URL}/universe/${slug}`,
    priority: '0.8',
    changefreq: 'weekly',
    lastmod,
  }))

  // Per-entity deep links
  const entityUrls = []
  for (const slug of slugs) {
    const payload = getPayload(slug)
    if (!payload) continue

    const characters = Array.isArray(payload.characters) ? payload.characters : []
    const powerSystem = Array.isArray(payload.powerSystem) ? payload.powerSystem : []
    const factions = Array.isArray(payload.factions) ? payload.factions : []

    characters.forEach((_, i) => {
      entityUrls.push({
        loc: `${BASE_URL}/universe/${slug}/character/${i}`,
        priority: '0.5',
        changefreq: 'monthly',
        lastmod,
      })
    })

    powerSystem.forEach((_, i) => {
      entityUrls.push({
        loc: `${BASE_URL}/universe/${slug}/power/${i}`,
        priority: '0.5',
        changefreq: 'monthly',
        lastmod,
      })
    })

    factions.forEach((_, i) => {
      entityUrls.push({
        loc: `${BASE_URL}/universe/${slug}/faction/${i}`,
        priority: '0.5',
        changefreq: 'monthly',
        lastmod,
      })
    })
  }

  const urls = [
    ...staticUrls,
    ...blogUrls,
    ...thematicUrls,
    ...universeUrls,
    ...insightUrls,
    ...entityUrls,
  ]

  const entries = urls
    .map(
      ({ loc, priority, changefreq, lastmod: modified }) =>
        `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${modified}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`
}

const slugs = getSlugs()
const xml = buildSitemap(slugs)
fs.writeFileSync(OUT_FILE, xml, 'utf8')

const blogSlugs = getBlogSlugs()
const INSIGHT_SRC = path.join(__dirname, '../src/data/insights-content.js')
let insightSlugs = []
try {
  const s = fs.readFileSync(INSIGHT_SRC, 'utf8')
  const keys1 = [...s.matchAll(/^  '([^']+)':/gm)].map(m => m[1])
  const keys2 = [...s.matchAll(/^  "([^"]+)":/gm)].map(m => m[1])
  insightSlugs = [...new Set([...keys1, ...keys2])]
} catch {}
console.log(`[sitemap] ${slugs.length} universe(s), ${THEMATIC_SLUGS.length} thematic page(s), ${insightSlugs.length} insight(s), ${blogSlugs.length} blog post(s) → public/sitemap.xml`)
