// Generates public/search-index.json from all universe payloads in src/data/.
// Runs at build time: node scripts/generateSearchIndex.js
// Also runs automatically as part of `npm run build`.

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '../src/data')
const OUT_FILE = path.join(__dirname, '../public/search-index.json')

function truncate(str, max = 200) {
  if (!str || typeof str !== 'string') return ''
  return str.length > max ? str.slice(0, max).trimEnd() + '…' : str
}

function getSlugFromFilename(filename) {
  return filename
    .replace(/\.core\.json$/, '')
    .replace(/\.json$/, '')
}

function getDataFiles() {
  return fs
    .readdirSync(DATA_DIR)
    .filter(f => f.endsWith('.json') && !f.endsWith('.extended.json'))
    .sort()
}

function buildIndex() {
  const files = getDataFiles()
  const entries = []

  const stats = {
    universes: 0,
    characters: 0,
    powers: 0,
    factions: 0,
    rules: 0,
    total: 0,
  }

  const seenSlugs = new Set()

  for (const filename of files) {
    const slug = getSlugFromFilename(filename)

    // Deduplicate: if both slug.json and slug.core.json exist, prefer .core.json
    if (seenSlugs.has(slug)) continue
    seenSlugs.add(slug)

    const filePath = path.join(DATA_DIR, filename)
    let payload
    try {
      payload = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    } catch (err) {
      console.warn(`[search-index] Skipping ${filename}: ${err.message}`)
      continue
    }

    const anime = payload.anime || slug
    const tagline = payload.tagline || ''

    // Universe-level entry
    entries.push({
      type: 'universe',
      id: `universe:${slug}`,
      slug,
      name: anime,
      anime,
      title: tagline,
      ability: '',
      description: truncate(tagline, 200),
      url: `/universe/${slug}`,
    })
    stats.universes++

    // Characters
    const characters = Array.isArray(payload.characters) ? payload.characters : []
    characters.forEach((char, index) => {
      if (!char || !char.name) return
      entries.push({
        type: 'character',
        id: `character:${slug}:${index}`,
        slug,
        index,
        name: char.name || '',
        anime,
        title: char.title || '',
        ability: char.primaryAbility || '',
        description: truncate(char.loreBio || '', 200),
        dangerLevel: char.dangerLevel || 0,
        imageUrl: char.imageUrl || null,
        url: `/universe/${slug}/character/${index}`,
      })
      stats.characters++
    })

    // Power systems
    const powerSystem = Array.isArray(payload.powerSystem) ? payload.powerSystem : []
    powerSystem.forEach((power, index) => {
      if (!power || !power.name) return
      entries.push({
        type: 'power',
        id: `power:${slug}:${index}`,
        slug,
        index,
        name: power.name || '',
        anime,
        title: power.subtitle || '',
        ability: '',
        description: truncate(power.loreDesc || '', 200),
        url: `/universe/${slug}/power/${index}`,
      })
      stats.powers++
    })

    // Factions
    const factions = Array.isArray(payload.factions) ? payload.factions : []
    factions.forEach((faction, index) => {
      if (!faction || !faction.name) return
      entries.push({
        type: 'faction',
        id: `faction:${slug}:${index}`,
        slug,
        index,
        name: faction.name || '',
        anime,
        title: faction.role || '',
        ability: faction.leader || '',
        description: truncate(faction.loreDesc || '', 200),
        url: `/universe/${slug}/faction/${index}`,
      })
      stats.factions++
    })

    // Rules
    const rules = Array.isArray(payload.rules) ? payload.rules : []
    rules.forEach((rule, index) => {
      if (!rule || !rule.name) return
      entries.push({
        type: 'rule',
        id: `rule:${slug}:${index}`,
        slug,
        index,
        name: rule.name || '',
        anime,
        title: rule.severity || '',
        ability: '',
        description: truncate(rule.loreDesc || '', 200),
        url: `/universe/${slug}`,
      })
      stats.rules++
    })
  }

  stats.total = entries.length
  return { entries, stats }
}

const { entries, stats } = buildIndex()
fs.writeFileSync(OUT_FILE, JSON.stringify(entries, null, 0), 'utf8')

console.log('[search-index] Generated public/search-index.json')
console.log(`  Universes : ${stats.universes}`)
console.log(`  Characters: ${stats.characters}`)
console.log(`  Powers    : ${stats.powers}`)
console.log(`  Factions  : ${stats.factions}`)
console.log(`  Rules     : ${stats.rules}`)
console.log(`  Total     : ${stats.total} entries`)
