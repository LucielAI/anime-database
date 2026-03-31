import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { UNIVERSE_CATALOG, preferredOrder } from '../src/data/catalog.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const dataDir = path.join(repoRoot, 'src/data')

const dataSlugs = fs.readdirSync(dataDir)
  .filter((file) => file.endsWith('.json') && !file.endsWith('.extended.json'))
  .map((file) => file.replace(/\.core\.json$/, '').replace(/\.json$/, ''))

const uniqueDataSlugs = [...new Set(dataSlugs)]
const catalogIds = UNIVERSE_CATALOG.map((entry) => entry.id)
const uniqueCatalogIds = [...new Set(catalogIds)]

const failures = []

if (catalogIds.length !== uniqueCatalogIds.length) {
  const duplicates = catalogIds.filter((id, idx) => catalogIds.indexOf(id) !== idx)
  failures.push(`Duplicate ids in UNIVERSE_CATALOG: ${[...new Set(duplicates)].join(', ')}`)
}

const missingInCatalog = uniqueDataSlugs.filter((slug) => !uniqueCatalogIds.includes(slug))
if (missingInCatalog.length > 0) {
  failures.push(`Payload slugs missing from UNIVERSE_CATALOG: ${missingInCatalog.join(', ')}`)
}

const orphanedCatalogEntries = uniqueCatalogIds.filter((id) => !uniqueDataSlugs.includes(id))
if (orphanedCatalogEntries.length > 0) {
  failures.push(`UNIVERSE_CATALOG ids without payload files: ${orphanedCatalogEntries.join(', ')}`)
}

if (preferredOrder.length !== [...new Set(preferredOrder)].length) {
  const duplicates = preferredOrder.filter((id, idx) => preferredOrder.indexOf(id) !== idx)
  failures.push(`Duplicate ids in preferredOrder: ${[...new Set(duplicates)].join(', ')}`)
}

const missingFromPreferredOrder = uniqueCatalogIds.filter((id) => !preferredOrder.includes(id))
if (missingFromPreferredOrder.length > 0) {
  failures.push(`UNIVERSE_CATALOG ids missing from preferredOrder: ${missingFromPreferredOrder.join(', ')}`)
}

const unknownPreferredOrderIds = preferredOrder.filter((id) => !uniqueCatalogIds.includes(id))
if (unknownPreferredOrderIds.length > 0) {
  failures.push(`preferredOrder ids missing from UNIVERSE_CATALOG: ${unknownPreferredOrderIds.join(', ')}`)
}

if (!uniqueCatalogIds.includes('chainsawman')) {
  failures.push('UNIVERSE_CATALOG is missing required slug: chainsawman')
}

if (failures.length > 0) {
  console.error('[validate:catalog] FAILED')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log('[validate:catalog] PASS')
console.log(`- payload slugs: ${uniqueDataSlugs.length}`)
console.log(`- catalog ids: ${uniqueCatalogIds.length}`)
console.log(`- preferred order entries: ${preferredOrder.length}`)
