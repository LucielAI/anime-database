#!/usr/bin/env node
/**
 * Generate llms.txt — a lightweight text sitemap for AI crawlers.
 * Run at build time: node scripts/generateLlms.js
 */
import { writeFileSync, readdirSync, readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { UNIVERSE_CATALOG } from '../src/data/catalog.js'
import { INSIGHTS } from '../src/data/insights-content.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const SITE_URL = 'https://animearchive.app'
const BLOG_DIR = join(root, 'content', 'blog')
const PUBLIC_BLOG_DIR = join(root, 'public', 'blog')

// Thematic/systems pages — mirrors src/config/thematicPages.js
const THEMATIC_PAGES = [
  { slug: 'relational-systems', title: 'Relational Systems', description: 'Universes where alliances, betrayal, and influence networks determine who wins.' },
  { slug: 'counterplay-systems', title: 'Counterplay Systems', description: 'Universes where fights are decided by matchup reads, counters, and technical timing.' },
  { slug: 'timeline-systems', title: 'Timeline Systems', description: 'Universes driven by cause-and-effect, time loops, and deterministic causality.' },
  { slug: 'control-systems', title: 'Control Systems', description: 'Universes where institutional control, status, and authority structures determine outcomes.' },
  { slug: 'closed-loop-systems', title: 'Closed-Loop Systems', description: 'Universes with self-reinforcing rules that create inescapable cycles.' },
  { slug: 'power-economy-systems', title: 'Power Economy Systems', description: 'Universes where abilities are resources that can be earned, spent, traded, or permanently lost.' },
]

function getBlogPosts() {
  const fromContent = existsSync(BLOG_DIR)
    ? readdirSync(BLOG_DIR)
        .filter(f => f.endsWith('.md') || f.endsWith('.mdx') || f.endsWith('.json'))
        .map(f => {
          const slug = f.replace(/\.(md|mdx|json)$/, '')
          const title = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
          return { slug, title, source: 'blog' }
        })
    : []
  const fromPublic = existsSync(PUBLIC_BLOG_DIR)
    ? readdirSync(PUBLIC_BLOG_DIR)
        .filter(f => f.endsWith('.json'))
        .map(f => {
          try {
            const content = JSON.parse(readFileSync(join(PUBLIC_BLOG_DIR, f), 'utf8'))
            const slug = content.slug || f.replace(/\.json$/, '')
            const source = slug in INSIGHTS ? 'insights' : 'blog'
            return { slug, title: content.title || '', source }
          } catch {
            return null
          }
        })
        .filter(Boolean)
    : []
  return [...fromContent, ...fromPublic].sort((a, b) => a.slug.localeCompare(b.slug))
}

const blogPosts = getBlogPosts()

const LINES = [
  '# Anime Architecture Archive',
  '',
  'The Anime Architecture Archive maps fictional anime universes as structured systems — not summarizing plots, but analyzing the underlying mechanics that make each world function.',
  '',
  '## What This Archive Provides',
  '',
  'Each universe is structured as a dual-mode experience:',
  '- Lore View: For casual exploration of characters, factions, and events',
  '- System Mode: For deep analysis of power mechanics, governing rules, and causal chains',
  '',
  '## Available Universes',
  '',
  ...UNIVERSE_CATALOG.map(
    (u) => `### ${u.anime} | /universe/${u.id} | ${u.tagline}`
  ),
  '',
  '## Systems / Thematic Pages',
  '',
  ...THEMATIC_PAGES.map(
    (p) => `### ${p.title} | /systems/${p.slug} | ${p.description}`
  ),
  '',
  ...(blogPosts.length > 0
    ? [
        '## Insights',
        '',
        `Insights Index: ${SITE_URL}/insights`,
        ...blogPosts.map((p) => {
          const url = p.source === 'insights' ? `/insights/${p.slug}` : `/blog/${p.slug}`
          return `### ${p.title} | ${url}`
        }),
        '',
      ]
    : []),
  '## Entity Pages',
  '',
  'Each universe page exposes deep-link pages for individual entities:',
  '- Characters: /universe/:id/character/:index',
  '- Power Systems: /universe/:id/power/:index',
  '- Factions: /universe/:id/faction/:index',
  '',
  '## Key Pages',
  '',
  `Homepage: ${SITE_URL}/`,
  `Universe Catalog: ${SITE_URL}/universes`,
  `Compare Universes: ${SITE_URL}/compare`,
  `Search: ${SITE_URL}/search`,
  `About: ${SITE_URL}/about`,
  `Privacy Policy: ${SITE_URL}/privacy`,
  '',
  '## Structure',
  '',
  'The archive uses these system types:',
  '- TIMELINE SYSTEM: For universes where causality and temporal structure are the central mechanic',
  '- COUNTERPLAY SYSTEM: For universes where ability matchups and tactical counters drive conflict',
  '- RELATIONAL SYSTEM: For universes where faction networks, alliances, and betrayals determine outcomes',
  '',
  '## Content Notes',
  '',
  'All content is unofficial fan analysis. No affiliation with anime studios or creators.',
  'Creative Commons BY-NC 4.0 for structured data.',
  `Tagline: Decode power systems. Map causal chains. Explore the hidden architecture of anime universes.`,
]

const output = LINES.join('\n')
writeFileSync(join(root, 'public', 'llms.txt'), output, 'utf8')
console.log(`[llms] ${UNIVERSE_CATALOG.length} universes, ${THEMATIC_PAGES.length} thematic pages, ${blogPosts.length} blog post(s) → public/llms.txt`)
