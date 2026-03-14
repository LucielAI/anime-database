/* global process */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { UNIVERSE_CATALOG } from '../src/data/catalog.js'
import { buildHomeSeo, buildUniverseSeo } from '../src/utils/seo.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')

const sitemapPath = path.join(repoRoot, 'public/sitemap.xml')
const robotsPath = path.join(repoRoot, 'public/robots.txt')
const indexHtmlPath = path.join(repoRoot, 'index.html')
const appPath = path.join(repoRoot, 'src/App.jsx')

const expectedUniverseUrls = new Set(
  UNIVERSE_CATALOG.map((entry) => `https://animearchive.app/universe/${entry.id}`)
)

const failures = []

if (!fs.existsSync(sitemapPath)) {
  failures.push('Missing public/sitemap.xml')
} else {
  const xml = fs.readFileSync(sitemapPath, 'utf8')
  const urls = new Set([...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]))

  if (!urls.has('https://animearchive.app/')) failures.push('Sitemap missing homepage URL')
  if (!urls.has('https://animearchive.app/universes')) failures.push('Sitemap missing catalog URL')
  for (const universeUrl of expectedUniverseUrls) {
    if (!urls.has(universeUrl)) failures.push(`Sitemap missing universe URL: ${universeUrl}`)
  }
}

if (!fs.existsSync(robotsPath)) {
  failures.push('Missing public/robots.txt')
} else {
  const robots = fs.readFileSync(robotsPath, 'utf8')
  if (!robots.includes('Sitemap: https://animearchive.app/sitemap.xml')) failures.push('robots.txt missing sitemap directive')
  if (robots.includes('Disallow: /')) failures.push('robots.txt blocks entire site')
}

if (!fs.existsSync(indexHtmlPath)) {
  failures.push('Missing index.html')
} else {
  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8')
  if (!indexHtml.includes('rel="canonical" href="https://animearchive.app/"')) failures.push('index.html missing homepage canonical link')
  if (!indexHtml.includes('property="og:image"')) failures.push('index.html missing fallback OG image')
}

if (!fs.existsSync(appPath)) {
  failures.push('Missing src/App.jsx')
} else {
  const app = fs.readFileSync(appPath, 'utf8')
  if (!app.includes('path="/universe/:id"')) failures.push('Universe route missing in App.jsx')
  if (!app.includes('path="/universes"')) failures.push('Universes catalog route missing in App.jsx')
  if (!app.includes('<SeoHead')) failures.push('SEO head injection missing in App.jsx')
}

const homeSeo = buildHomeSeo(UNIVERSE_CATALOG)
if (!homeSeo.title || !homeSeo.description || !homeSeo.canonicalUrl) {
  failures.push('Homepage SEO defaults are incomplete')
}

const seenTitles = new Set()
for (const entry of UNIVERSE_CATALOG) {
  const seo = buildUniverseSeo(entry)
  if (!seo.title || !seo.description || !seo.canonicalUrl || !seo.image) {
    failures.push(`Universe SEO incomplete for slug: ${entry.id}`)
    continue
  }

  if (seenTitles.has(seo.title)) {
    failures.push(`Universe SEO title is not unique: ${seo.title}`)
  }
  seenTitles.add(seo.title)

  if (seo.description.length < 80) {
    failures.push(`Universe SEO description too short for slug: ${entry.id}`)
  }
}

if (failures.length > 0) {
  console.error('[validate:indexing] FAILED')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log('[validate:indexing] PASS')
console.log(`- verified universes: ${UNIVERSE_CATALOG.length}`)
