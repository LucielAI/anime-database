import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { validateAnimePayload } from '../src/utils/validateSchema.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)

if (args.length === 0) {
  console.log('\n[ERROR] Missing payload path.')
  console.log('Usage: npm run add:universe <path-to-json> [slug]\n')
  process.exit(1)
}

const sourcePath = path.resolve(process.cwd(), args[0])
let slug = args[1]

try {
  const fileContent = fs.readFileSync(sourcePath, 'utf-8')
  const payload = JSON.parse(fileContent)

  if (!slug) {
    const words = payload.anime.split(' ')
    if (words.length >= 3) {
      slug = words.map(w => w[0]).join('').toLowerCase()
    } else {
      slug = payload.anime.toLowerCase().replace(/[^a-z0-9]/g, '')
    }
  }

  console.log(`\n======================================================`)
  console.log(`[INTEGRATION PIPELINE] Ingesting: ${payload.anime}`)
  console.log(`======================================================\n`)

  // 1. Strict Validation Check
  const { errors, warnings } = validateAnimePayload(payload)
  if (errors.length > 0) {
    console.error('\n[FATAL] Payload failed validation. Integration aborted.')
    process.exit(1)
  }

  console.log(`✓ Schema Validation Passed (Warnings: ${warnings.length})`)

  // 2. Copy Payload to src/data
  const targetPath = path.resolve(__dirname, `../src/data/${slug}.json`)
  fs.writeFileSync(targetPath, JSON.stringify(payload, null, 2))
  console.log(`✓ Copied payload to src/data/${slug}.json`)

  // 3. Auto-Wire dependencies in index.js
  const indexPath = path.resolve(__dirname, '../src/data/index.js')
  let indexContent = fs.readFileSync(indexPath, 'utf-8')

  // Check if it already exists to prevent duplicate wiring
  if (indexContent.includes(`import ${slug} from './${slug}.json'`)) {
    console.log(`[WARN] ${slug} is already wired into index.js`)
  } else {
    // Insert import at the top
    const lastImportIndex = indexContent.lastIndexOf('import ')
    const insertImportPos = indexContent.indexOf('\n', lastImportIndex) + 1
    const newImport = `import ${slug} from './${slug}.json'\n`
    indexContent = indexContent.slice(0, insertImportPos) + newImport + indexContent.slice(insertImportPos)

    // Insert ID assignment before exporting
    const exportPos = indexContent.indexOf('export const ANIME_LIST')
    const newAssign = `${slug}.id = '${slug}'\n\n`
    indexContent = indexContent.slice(0, exportPos) + newAssign + indexContent.slice(exportPos)

    // Inject into the array
    indexContent = indexContent.replace(/export const ANIME_LIST = \[([\s\S]*?)\]/, (match, group) => {
      const parts = group.split(',').map(s => s.trim()).filter(s => s)
      if (!parts.includes(slug)) {
        parts.push(slug)
      }
      return `export const ANIME_LIST = [\n  ${parts.join(',\n  ')}\n]`
    })

    fs.writeFileSync(indexPath, indexContent)
    console.log(`✓ Wired ${slug} deeply into src/data/index.js (Routing + Global Access Enabled)`)
  }

  // 4. Auto-Remove from PENDING_UNIVERSES stubs
  const explorePath = path.resolve(__dirname, '../src/components/ExploreAnotherUniverse.jsx')
  if (fs.existsSync(explorePath)) {
    let exploreContent = fs.readFileSync(explorePath, 'utf-8')
    const startLength = exploreContent.length
    
    // Regex matches: { name: 'Anime Name', id: 'slug' }, or without comma
    // Escaping payload.anime might be needed if it has special characters, but usually it doesn't.
    // We'll safely replace by name string
    const escapedName = payload.anime.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pendingRegex = new RegExp(`\\s*\\{[^}]*name:\\s*['"]${escapedName}['"][^}]*\\},?`, 'g')
    exploreContent = exploreContent.replace(pendingRegex, '')
    
    // Fix any trailing commas in the array
    exploreContent = exploreContent.replace(/,\s*(?=\])/g, '\n')
    
    if (exploreContent.length !== startLength) {
      fs.writeFileSync(explorePath, exploreContent)
      console.log(`✓ Automatically removed '${payload.anime}' from PENDING_UNIVERSES stubs`)
    }
  }

  console.log(`\n[SUCCESS] ${payload.anime} is now live in the Universe Archive! Route: /universe/${slug}\n`)

} catch (err) {
  console.error(`\n[FATAL] Pipeline threw hard error:`)
  console.error(err.message)
  process.exit(1)
}
