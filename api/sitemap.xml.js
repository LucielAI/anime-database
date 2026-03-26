// Dynamic sitemap.xml API route — serves all universe + entity pages
// Vercel serverless function: /api/sitemap.xml
// Replicates the same logic as scripts/generateSitemap.js but returns HTTP response

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE_URL = 'https://animearchive.app'
const DATA_DIR = join(__dirname, '../src/data')
const BLOG_DIR = join(__dirname, '../content/blog')

const THEMATIC_SLUGS = [
  'relational-systems',
  'counterplay-systems',
  'timeline-systems',
  'control-systems',
  'closed-loop-systems',
  'power-economy-systems',
]

function getSlugs() {
  return readdirSync(DATA_DIR)
    .filter(f => f.endsWith('.json') && !f.endsWith('.extended.json'))
    .map(f => f.replace(/\.core\.json$/, '').replace(/\.json$/, ''))
    .filter((slug, i, arr) => arr.indexOf(slug) === i)
    .filter(Boolean)
    .sort()
}

function getPayload(slug) {
  const candidates = [
    join(DATA_DIR, `${slug}.core.json`),
    join(DATA_DIR, `${slug}.json`),
  ]
  for (const p of candidates) {
    if (existsSync(p)) {
      try {
        return JSON.parse(readFileSync(p, 'utf8'))
      } catch {
        return null
      }
    }
  }
  return null
}

function getBlogSlugs() {
  if (!existsSync(BLOG_DIR)) return []
  return readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.md') || f.endsWith('.mdx') || f.endsWith('.json'))
    .map(f => f.replace(/\.(md|mdx|json)$/, ''))
    .filter(Boolean)
    .sort()
}

function getInsightSlugs() {
  const INSIGHT_SRC = join(__dirname, '../src/data/insights-content.js')
  if (!existsSync(INSIGHT_SRC)) return []
  try {
    const s = readFileSync(INSIGHT_SRC, 'utf8')
    const keys1 = [...s.matchAll(/^  '([^']+)':/gm)].map(m => m[1])
    const keys2 = [...s.matchAll(/^  "([^"]+)":/gm)].map(m => m[1])
    return [...new Set([...keys1, ...keys2])]
  } catch {
    return []
  }
}

function buildSitemapXml() {
  const lastmod = new Date().toISOString().split('T')[0]
  const slugs = getSlugs()
  const blogSlugs = getBlogSlugs()
  const insightSlugs = getInsightSlugs()

  const urls = []

  // Static pages
  urls.push(
    { loc: `${BASE_URL}/`, priority: '1.0', changefreq: 'weekly', lastmod },
    { loc: `${BASE_URL}/universes`, priority: '0.9', changefreq: 'weekly', lastmod },
    { loc: `${BASE_URL}/compare`, priority: '0.7', changefreq: 'monthly', lastmod },
    { loc: `${BASE_URL}/search`, priority: '0.7', changefreq: 'weekly', lastmod },
    { loc: `${BASE_URL}/about`, priority: '0.5', changefreq: 'monthly', lastmod },
    { loc: `${BASE_URL}/privacy`, priority: '0.3', changefreq: 'yearly', lastmod },
    { loc: `${BASE_URL}/insights`, priority: '0.8', changefreq: 'weekly', lastmod },
  )

  // Blog pages
  if (blogSlugs.length > 0) {
    urls.push({ loc: `${BASE_URL}/blog`, priority: '0.8', changefreq: 'weekly', lastmod })
    for (const slug of blogSlugs) {
      urls.push({ loc: `${BASE_URL}/blog/${slug}`, priority: '0.7', changefreq: 'monthly', lastmod })
    }
  }

  // Insights/post slugs
  for (const slug of insightSlugs) {
    urls.push({ loc: `${BASE_URL}/insights/${slug}`, priority: '0.7', changefreq: 'monthly', lastmod })
  }

  // Thematic/systems pages
  for (const slug of THEMATIC_SLUGS) {
    urls.push({ loc: `${BASE_URL}/systems/${slug}`, priority: '0.7', changefreq: 'monthly', lastmod })
  }

  // Universe index pages
  for (const slug of slugs) {
    urls.push({ loc: `${BASE_URL}/universe/${slug}`, priority: '0.8', changefreq: 'weekly', lastmod })
  }

  // Per-entity deep links: characters, powers, factions
  for (const slug of slugs) {
    const payload = getPayload(slug)
    if (!payload) continue

    const characters = Array.isArray(payload.characters) ? payload.characters : []
    const powerSystem = Array.isArray(payload.powerSystem) ? payload.powerSystem : []
    const factions = Array.isArray(payload.factions) ? payload.factions : []

    for (let i = 0; i < characters.length; i++) {
      urls.push({ loc: `${BASE_URL}/universe/${slug}/character/${i}`, priority: '0.5', changefreq: 'monthly', lastmod })
    }
    for (let i = 0; i < powerSystem.length; i++) {
      urls.push({ loc: `${BASE_URL}/universe/${slug}/power/${i}`, priority: '0.5', changefreq: 'monthly', lastmod })
    }
    for (let i = 0; i < factions.length; i++) {
      urls.push({ loc: `${BASE_URL}/universe/${slug}/faction/${i}`, priority: '0.5', changefreq: 'monthly', lastmod })
    }
  }

  const entries = urls
    .map(({ loc, priority, changefreq, lastmod: modified }) =>
      `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${modified}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`
}

export default function handler(req, res) {
  try {
    const xml = buildSitemapXml()
    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600')
    res.status(200).send(xml)
  } catch (err) {
    console.error('[sitemap-api] Error generating sitemap:', err)
    res.status(500).send('Internal Server Error')
  }
}
