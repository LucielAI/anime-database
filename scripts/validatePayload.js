import fs from 'fs'
import path from 'path'
import { validateAnimePayload } from '../src/utils/validateSchema.js'

const args = process.argv.slice(2)
if (args.length === 0) {
  console.error('\n[ERROR] Provide a path to a payload JSON file.')
  console.log('Usage: npm run validate:payload <path-to-json>\n')
  process.exit(1)
}

const targetPath = path.resolve(process.cwd(), args[0])

try {
  const fileContent = fs.readFileSync(targetPath, 'utf-8')
  const payload = JSON.parse(fileContent)

  console.log(`\n======================================================`)
  console.log(`[PAYLOAD VALIDATOR] Scraping: ${path.basename(targetPath)}`)
  console.log(`======================================================\n`)

  const { errors, warnings } = validateAnimePayload(payload)

  console.log('\n--- VERDICT ---')
  if (errors.length > 0) {
    console.error(`Status: FAILED (${errors.length} Critical Violations)`)
    process.exit(1)
  } else if (warnings.length > 0) {
    console.warn(`Status: PASSED WITH WARNINGS (${warnings.length} Soft Boundary Hits)`)
    process.exit(0)
  } else {
    console.log(`Status: CLEAN PASS`)
    process.exit(0)
  }

} catch (err) {
  console.error(`\n[FATAL] Could not read or parse JSON file: ${targetPath}`)
  console.error(err.message)
  process.exit(1)
}
