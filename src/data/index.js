import { validateCorePayload } from '../utils/validateSchema'

// Runtime registry loader for layered universe data.
// Non-breaking resolution order per slug: .core.json -> legacy .json.
// Keep the runtime bundle scoped to renderer-facing payloads only.
// Extended research datasets stay out of eager client imports.
const dataFiles = import.meta.glob(['./*.json', '!./*.extended.json'], {
  eager: true
})

function extractSlug(filePath) {
  const fileName = filePath.split('/').pop() || ''
  return fileName
    .replace(/\.extended\.json$/, '')
    .replace(/\.core\.json$/, '')
    .replace(/\.json$/, '')
}

const groupedBySlug = Object.entries(dataFiles).reduce((acc, [filePath, mod]) => {
  const payload = mod.default || mod
  const slug = extractSlug(filePath)

  if (!acc[slug]) {
    acc[slug] = { slug, legacy: null, core: null }
  }

  if (filePath.endsWith('.core.json')) {
    acc[slug].core = payload
  } else {
    acc[slug].legacy = payload
  }

  return acc
}, {})

// Preserve familiar homepage ordering for current live universes.
const preferredOrder = ['aot', 'jjk', 'demonslayer', 'hxh', 'vinlandsaga', 'steinsgate', 'deathnote', 'fmab', 'codegeass', 'mha']
const discoveredSlugs = Object.keys(groupedBySlug)
const slugs = [
  ...preferredOrder.filter(slug => discoveredSlugs.includes(slug)),
  ...discoveredSlugs.filter(slug => !preferredOrder.includes(slug)).sort()
]

export const UNIVERSE_DATA_REGISTRY = slugs.reduce((acc, slug) => {
  const entry = groupedBySlug[slug]
  const rawCorePayload = entry.core || entry.legacy

  if (!rawCorePayload) return acc

  const corePayload = { ...rawCorePayload, id: slug }

  acc[slug] = {
    slug,
    core: corePayload,
    source: entry.core ? 'core' : 'legacy'
  }

  return acc
}, {})

// UI always renders from core payloads to keep renderer contract stable.
export const ANIME_LIST = slugs
  .map(slug => UNIVERSE_DATA_REGISTRY[slug]?.core)
  .filter(Boolean)

ANIME_LIST.forEach(validateCorePayload)
