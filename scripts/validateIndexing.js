/* global process */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { UNIVERSE_CATALOG } from '../src/data/catalog.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')

const sitemapPath = path.join(repoRoot, 'public/sitemap.xml')
const robotsPath = path.join(repoRoot, 'public/robots.txt')
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

  if (!urls.has('https://animearchive.app/')) {
    failures.push('Sitemap missing homepage URL')
  }

  for (const universeUrl of expectedUniverseUrls) {
    if (!urls.has(universeUrl)) {
      failures.push(`Sitemap missing universe URL: ${universeUrl}`)
    }
  }
}

if (!fs.existsSync(robotsPath)) {
  failures.push('Missing public/robots.txt')
} else {
  const robots = fs.readFileSync(robotsPath, 'utf8')
  if (!robots.includes('Sitemap: https://animearchive.app/sitemap.xml')) {
    failures.push('robots.txt missing sitemap directive')
  }
  if (robots.includes('Disallow: /')) {
    failures.push('robots.txt blocks entire site')
  }
}

if (!fs.existsSync(appPath)) {
  failures.push('Missing src/App.jsx')
} else {
  const app = fs.readFileSync(appPath, 'utf8')
  if (!app.includes('path="/universe/:id"')) {
    failures.push('Universe route missing in App.jsx')
  }
  if (!app.includes('<SeoHead')) {
    failures.push('SEO head injection missing in App.jsx')
  }
}

if (failures.length > 0) {
  console.error('[validate:indexing] FAILED')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log('[validate:indexing] PASS')
console.log(`- verified universes: ${UNIVERSE_CATALOG.length}`)
