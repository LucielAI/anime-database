import fs from 'fs'
import path from 'path'
import { validateCorePayload } from '../src/utils/validateSchema.js'

const dataDir = path.resolve(process.cwd(), 'src/data')
const strictWarnings = process.argv.includes('--strict-warnings')

const files = fs.readdirSync(dataDir)
  .filter((file) => file.endsWith('.json') && !file.endsWith('.extended.json'))
  .sort()

if (files.length === 0) {
  console.error('[audit:payloads] No payload files found in src/data/')
  process.exit(1)
}

let totalErrors = 0
let totalWarnings = 0

console.log(`\n[audit:payloads] Auditing ${files.length} payload(s) from src/data/\n`)

for (const file of files) {
  const fullPath = path.join(dataDir, file)
  const payload = JSON.parse(fs.readFileSync(fullPath, 'utf-8'))
  const { errors, warnings } = validateCorePayload(payload)

  totalErrors += errors.length
  totalWarnings += warnings.length

  const status = errors.length > 0
    ? 'FAILED'
    : warnings.length > 0
      ? 'WARN'
      : 'PASS'

  console.log(`${status.padEnd(6)} ${file.padEnd(24)} errors=${String(errors.length).padStart(2)} warnings=${String(warnings.length).padStart(2)}`)
}

console.log('\n[audit:payloads] Summary')
console.log(`- files: ${files.length}`)
console.log(`- errors: ${totalErrors}`)
console.log(`- warnings: ${totalWarnings}`)

if (totalErrors > 0) {
  process.exit(1)
}

if (strictWarnings && totalWarnings > 0) {
  process.exit(2)
}

process.exit(0)
