#!/usr/bin/env node
/**
 * Generate public/feed.xml — RSS 2.0 feed for all universes + insights.
 * Run as part of prebuild step.
 */
import { writeFileSync, readdirSync, readFileSync, existsSync } from 'fs'
import { join, basename, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DATA_DIR = join(ROOT, 'src', 'data')
const BLOG_DIR = join(ROOT, 'public', 'blog')
const OUTPUT = join(ROOT, 'public', 'feed.xml')

const SITE_URL = 'https://animearchive.app'
const SITE_NAME = 'Anime Architecture Archive'
const SITE_DESC = 'Fictional Universe Intelligence System — power mechanics, factions, and system analysis for anime worlds.'

// Load universe data
function loadUniverses() {
  const files = readdirSync(DATA_DIR).filter(f => f.endsWith('.json') || f.endsWith('.core.json'))
  return files.map(f => {
    try {
      const raw = readFileSync(join(DATA_DIR, f), 'utf8')
      const d = JSON.parse(raw)
      return {
        id: d.id || f.replace('.core.json','').replace('.json',''),
        anime: d.anime || d.title || 'Unknown',
        tagline: d.tagline || d.systemDescription?.slice(0, 100) || '',
        lastModified: d._meta?.updatedAt || d._meta?.createdAt || new Date().toISOString(),
        type: 'universe',
        slug: d.slug || f.replace('.core.json','').replace('.json',''),
      }
    } catch {
      return null
    }
  }).filter(Boolean)
}

// Load insight posts from public/blog/
function loadInsights() {
  if (!existsSync(BLOG_DIR)) return []
  const files = readdirSync(BLOG_DIR).filter(f => f.endsWith('.json'))
  return files.map(f => {
    try {
      const raw = readFileSync(join(BLOG_DIR, f), 'utf8')
      const d = JSON.parse(raw)
      return {
        id: d.slug || f.replace('.json',''),
        title: d.title || 'Insight',
        tagline: d.description || d.excerpt || '',
        lastModified: d.publishedAt || d.date || new Date().toISOString(),
        type: 'insight',
        slug: d.slug || f.replace('.json',''),
      }
    } catch {
      return null
    }
  }).filter(Boolean)
}

function xmlEscape(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function rssDate(d) {
  return new Date(d).toUTCString()
}

function generate(items) {
  const now = rssDate(new Date().toISOString())
  const itemsXml = items.map(item => {
    const link = item.type === 'universe'
      ? `${SITE_URL}/universe/${item.slug}`
      : `${SITE_URL}/insights/${item.slug}`
    const desc = xmlEscape(item.tagline)
    const itemTitle = item.anime || item.title || 'Untitled'
    return `  <item>
    <title>${xmlEscape(itemTitle)}</title>
    <link>${link}</link>
    <guid isPermaLink="true">${link}</guid>
    <description>${desc}</description>
    <pubDate>${rssDate(item.lastModified)}</pubDate>
  </item>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${xmlEscape(SITE_DESC)}</description>
    <language>en</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`
}

const items = [...loadInsights(), ...loadUniverses()]
  .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))

writeFileSync(OUTPUT, generate(items), 'utf8')
console.log(`[feed] ${items.length} items → public/feed.xml`)
