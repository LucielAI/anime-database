import { validateCorePayload } from '../utils/validateSchema'
import { preferredOrder, UNIVERSE_CATALOG, UNIVERSE_CATALOG_MAP } from './catalog'

const dataLoaders = import.meta.glob(['./*.json', '!./*.extended.json'])

const cache = new Map()

function normalizePayload(payload, slug) {
  return { ...payload, id: slug }
}

function getCandidatePaths(slug) {
  return [`./${slug}.core.json`, `./${slug}.json`]
}

export async function loadUniverseBySlug(slug) {
  if (!slug) return null
  if (cache.has(slug)) return cache.get(slug)

  for (const filePath of getCandidatePaths(slug)) {
    const loader = dataLoaders[filePath]
    if (!loader) continue

    const mod = await loader()
    const payload = normalizePayload(mod.default || mod, slug)
    const { errors } = validateCorePayload(payload)
    if (errors.length > 0) {
      throw new Error(`Invalid payload for ${slug}: ${errors.join(' | ')}`)
    }

    cache.set(slug, payload)
    return payload
  }

  return null
}

export const UNIVERSE_SLUGS = [
  ...preferredOrder.filter(slug => UNIVERSE_CATALOG_MAP[slug]),
  ...UNIVERSE_CATALOG.map(entry => entry.id).filter(slug => !preferredOrder.includes(slug)).sort()
]

export { preferredOrder, UNIVERSE_CATALOG, UNIVERSE_CATALOG_MAP }
