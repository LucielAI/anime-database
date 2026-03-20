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

function getSlugs() {
  return fs
    .readdirSync(DATA_DIR)
    .filter(f => f.endsWith('.json') && !f.endsWith('.extended.json'))
    .map(f => f.replace(/\.core\.json$/, '').replace(/\.json$/, ''))
    .filter((slug, i, arr) => arr.indexOf(slug) === i)
    .filter(Boolean)
    .sort()
}

function buildSitemap(slugs) {
  const lastmod = new Date().toISOString().split('T')[0]
  const urls = [
    { loc: `${BASE_URL}/`, priority: '1.0', changefreq: 'weekly', lastmod },
    { loc: `${BASE_URL}/universes`, priority: '0.9', changefreq: 'weekly', lastmod },
    ...slugs.map(slug => ({
      loc: `${BASE_URL}/universe/${slug}`,
      priority: '0.8',
      changefreq: 'weekly',
      lastmod,
    })),
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

console.log(`[sitemap] ${slugs.length} universe(s) → public/sitemap.xml`)
