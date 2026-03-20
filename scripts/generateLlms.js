#!/usr/bin/env node
/**
 * Generate llms.txt — a lightweight text sitemap for AI crawlers.
 * Run at build time: node scripts/generateLlms.js
 */
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { UNIVERSE_CATALOG } from '../src/data/catalog.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const SITE_URL = 'https://animearchive.app'

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
  '## Key Pages',
  '',
  `Homepage: ${SITE_URL}/`,
  `Universe Catalog: ${SITE_URL}/universes`,
  `Compare Universes: ${SITE_URL}/compare`,
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
console.log(`[llms] ${UNIVERSE_CATALOG.length} universes → public/llms.txt`)
