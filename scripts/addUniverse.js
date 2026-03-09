import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { validateCorePayload, validateExtendedDataset } from '../src/utils/validateSchema.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)

if (args.length === 0) {
  console.log('\n[ERROR] Missing payload path.')
  console.log('Usage: npm run add:universe <core-or-legacy-json> [slug] [extended-json] [--layered]\n')
  process.exit(1)
}

const positionalArgs = args.filter(arg => !arg.startsWith('--'))
const flags = new Set(args.filter(arg => arg.startsWith('--')))

const sourceCorePath = path.resolve(process.cwd(), positionalArgs[0])
let slug = positionalArgs[1]
const sourceExtendedPath = positionalArgs[2] ? path.resolve(process.cwd(), positionalArgs[2]) : null

const forceLayeredOutput = flags.has('--layered')
const inferLayeredOutput = sourceCorePath.endsWith('.core.json')
const outputMode = forceLayeredOutput || inferLayeredOutput ? 'layered' : 'legacy'

try {
  const corePayload = JSON.parse(fs.readFileSync(sourceCorePath, 'utf-8'))

  if (!slug) {
    const words = corePayload.anime.split(' ')
    slug = words.length >= 3
      ? words.map(w => w[0]).join('').toLowerCase()
      : corePayload.anime.toLowerCase().replace(/[^a-z0-9]/g, '')
  }

  console.log(`\n======================================================`)
  console.log(`[INTEGRATION PIPELINE] Ingesting: ${corePayload.anime}`)
  console.log(`[MODE] ${outputMode.toUpperCase()} (${outputMode === 'legacy' ? 'writes slug.json' : 'writes slug.core.json'})`)
  console.log(`======================================================\n`)

  const coreValidation = validateCorePayload(corePayload)
  if (coreValidation.errors.length > 0) {
    console.error('\n[FATAL] Core payload failed validation. Integration aborted.')
    process.exit(1)
  }

  console.log(`✓ Core schema validation passed (Warnings: ${coreValidation.warnings.length})`)

  const legacyTargetPath = path.resolve(__dirname, `../src/data/${slug}.json`)
  const coreTargetPath = path.resolve(__dirname, `../src/data/${slug}.core.json`)

  if (outputMode === 'legacy') {
    fs.writeFileSync(legacyTargetPath, JSON.stringify(corePayload, null, 2))
    console.log(`✓ Copied payload to src/data/${slug}.json (legacy-compatible mode)`)
  } else {
    fs.writeFileSync(coreTargetPath, JSON.stringify(corePayload, null, 2))
    console.log(`✓ Copied core payload to src/data/${slug}.core.json`)
    if (fs.existsSync(legacyTargetPath)) {
      console.log(`✓ Preserved existing legacy file src/data/${slug}.json (core file takes precedence in runtime registry)`)
    }
  }

  if (sourceExtendedPath) {
    const extendedPayload = JSON.parse(fs.readFileSync(sourceExtendedPath, 'utf-8'))
    const extendedValidation = validateExtendedDataset(extendedPayload)

    if (extendedValidation.errors.length > 0) {
      console.error('\n[FATAL] Extended dataset failed validation. Integration aborted.')
      process.exit(1)
    }

    const extendedTargetPath = path.resolve(__dirname, `../src/data/${slug}.extended.json`)
    fs.writeFileSync(extendedTargetPath, JSON.stringify(extendedPayload, null, 2))
    console.log(`✓ Copied extended dataset to src/data/${slug}.extended.json`)
    console.log(`✓ Extended validation passed (Warnings: ${extendedValidation.warnings.length})`)
  }

  const explorePath = path.resolve(__dirname, '../src/components/ExploreAnotherUniverse.jsx')
  if (fs.existsSync(explorePath)) {
    const exploreContent = fs.readFileSync(explorePath, 'utf-8')
    const escapedName = corePayload.anime.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pendingRegex = new RegExp(`\\s*\\{[^}]*name:\\s*['"]${escapedName}['"][^}]*\\},?`, 'g')
    const updatedContent = exploreContent
      .replace(pendingRegex, '')
      .replace(/,\s*(?=\])/g, '\n')

    if (updatedContent !== exploreContent) {
      fs.writeFileSync(explorePath, updatedContent)
      console.log(`✓ Automatically removed '${corePayload.anime}' from PENDING_UNIVERSES stubs`)
    }
  }

  console.log(`\n[SUCCESS] ${corePayload.anime} is now live in the Universe Archive! Route: /universe/${slug}\n`)

} catch (err) {
  console.error('\n[FATAL] Pipeline threw hard error:')
  console.error(err.message)
  process.exit(1)
}
