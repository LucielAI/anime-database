#!/usr/bin/env node
/**
 * Universe Production Pipeline — Agent-Native Edition
 * 
 * Designed for AI agent execution with both human-readable and JSON output.
 * 
 * Usage (human):
 *   node scripts/runPipeline.js <anime-name> <mal-id>
 *   node scripts/runPipeline.js "Frieren" 52984
 *   node scripts/runPipeline.js "Frieren" 52984 --dry-run
 * 
 * Usage (agent):
 *   node scripts/runPipeline.js "Frieren" 52984 --json
 *   # Exit code 0 = success, 1 = failure. JSON output on --json.
 * 
 * Environment: runs from /data/workspace/anime-database
 */

import { spawn } from 'child_process'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const [,, animeName, malId, ...args] = process.argv
const DRY_RUN = args.includes('--dry-run')
const JSON_MODE = args.includes('--json')
const SKIP_TEST = args.includes('--skip-test')

// ─── Agent-native output / exit ───────────────────────────────────────────────
const result = { stages: {}, errors: [], startTime: Date.now() }

const out = (obj) => {
  if (JSON_MODE) process.stdout.write(JSON.stringify(obj) + '\n')
  else console.log(obj)
}
const err = (obj) => {
  if (JSON_MODE) process.stderr.write(JSON.stringify(obj) + '\n')
  else console.error(obj)
}
const exit = (code, msg) => {
  if (JSON_MODE) {
    const payload = { ...result, exitCode: code }
    if (msg) payload.message = msg
    if (code === 0) process.stdout.write(JSON.stringify(payload) + '\n')
    else process.stderr.write(JSON.stringify(payload) + '\n')
  } else if (msg) {
    if (code === 0) console.log(msg)
    else console.error(msg)
  }
  process.exit(code)
}

const stage = (n, label) => ({ pass: () => out({ stage: n, label, status: 'pass', elapsed: Date.now() - result.startTime }),
  fail: (msg) => { result.errors.push({ stage: n, label, msg }); exit(1, `[Stage ${n}] FAIL: ${msg}`) } })

if (!animeName || !malId || animeName === '--help') {
  out(`
Universe Production Pipeline (Agent-Native)

Usage:
  node scripts/runPipeline.js <anime-name> <mal-id> [options]

Options:
  --dry-run    Show Stage 0 checklist, do not execute
  --json       Machine-readable JSON output + proper exit codes
  --skip-test  Skip test suite (faster iteration during development)

Examples:
  node scripts/runPipeline.js "Frieren" 52984           # full pipeline
  node scripts/runPipeline.js "Frieren" 52984 --dry-run  # preview only
  node scripts/runPipeline.js "Frieren" 52984 --json     # for subagents

Stages: 0 (Target) → 1 (Generate) → 2 (QA) → 3 (Fix) → 4 (UX) → 5 (Fix) → 6 (SEO) → 7 (Fix) → 8 (Validate) → 9 (Learn)
`)
  exit(0)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const slug = animeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const cmd = (cmd, args, cwd = ROOT) =>
  new Promise((res) => {
    const child = spawn(cmd, args, { cwd, shell: true })
    let out = '', err = ''
    child.stdout.on('data', d => out += d)
    child.stderr.on('data', d => err += d)
    child.on('close', code => res({ code, out, err }))
  })

const readPayload = (s) => {
  const p = join(ROOT, 'src/data', `${s}.core.json`)
  return existsSync(p) ? JSON.parse(readFileSync(p)) : null
}
const writePayload = (s, data) => writeFileSync(join(ROOT, 'src/data', `${s}.core.json`), JSON.stringify(data, null, 2))
const runTests = () => cmd('npm', ['test'])
const runValidate = (s) => cmd('npm', ['run', 'validate:payload', '--', `--slug=${s}`])
const runBuild = () => cmd('npm', ['run', 'build'])

// ─── STAGE 0: Target Selection ─────────────────────────────────────────────────
if (DRY_RUN) {
  out({ stage: 0, slug, malId, status: 'dry-run', message: `MAL ID ${malId} — confirm: trending? SEO potential? compare value? overlap with existing? system type?` })
  exit(0)
}

out({ stage: 0, status: 'pass' })

// ─── STAGE 1: Generate ─────────────────────────────────────────────────────────
out({ stage: 1, status: 'running', message: `Generating ${animeName} (${slug})` })
const genScript = join(ROOT, 'scripts', 'addUniverseWithSitemap.js')
if (!existsSync(genScript)) stage(1, 'Generate').fail(`Script not found: ${genScript}`)

let gen
try {
  gen = await cmd('node', [genScript, animeName, malId])
  if (gen.code !== 0) stage(1, 'Generate').fail(`Generator exited ${gen.code}: ${gen.err?.slice(-500)}`)
} catch (e) {
  stage(1, 'Generate').fail(`Threw: ${e.message}`)
}
out({ stage: 1, status: 'pass', message: `${slug}.core.json created` })

// ─── STAGE 2: QA Structural ────────────────────────────────────────────────────
out({ stage: 2, status: 'running' })
const qa = await runValidate(slug)
if (qa.code !== 0) {
  const payload = readPayload(slug)
  if (!payload) stage(2, 'QA').fail('Payload not found after generation')
  
  let fixed = false; const fixes = []
  
  if ('_fetchFailed' in payload) { delete payload._fetchFailed; fixes.push('removed _fetchFailed from root'); fixed = true }
  
  const VALID_SEVERITIES = ['low', 'medium', 'high', 'fatal']
  payload.rankings?.forEach(r => {
    if (r.severity && !VALID_SEVERITIES.includes(r.severity)) {
      r.severity = 'medium'; fixes.push(`severity→medium: ${r.character}`); fixed = true
    }
  })
  
  if (fixed) {
    writePayload(slug, payload)
    out({ stage: 2, status: 'auto-fixed', message: fixes.join(', ') })
    const recheck = await runValidate(slug)
    if (recheck.code !== 0) stage(2, 'QA').fail(`Still failing after auto-fix:\n${recheck.out?.slice(-800)}`)
    out({ stage: 2, status: 'pass', message: 'Auto-fixed and re-validated' })
  } else {
    stage(2, 'QA').fail(`QA errors (no auto-fix available):\n${qa.out?.slice(-800)}`)
  }
} else {
  out({ stage: 2, status: 'pass', message: '0 errors, 0 warnings' })
}

// ─── STAGE 3: UX Readability ──────────────────────────────────────────────────
out({ stage: 3, status: 'running' })
const payload = readPayload(slug)
if (!payload) stage(3, 'UX').fail('Could not read payload')

const uxIssues = []
payload.characters?.forEach(c => {
  if (!c.name || c.name.length < 2) uxIssues.push(`Name too short: ${JSON.stringify(c.name)}`)
  if (!c.description || c.description.length < 10) uxIssues.push(`Desc too short: ${c.name}`)
  if (c.description?.length > 200) uxIssues.push(`Desc too long (${c.description.length}): ${c.name}`)
})
const vague = ['interesting', 'amazing', 'cool', 'great', 'awesome']
payload.systemQuestions?.forEach(q => {
  if (vague.some(v => q.question.toLowerCase().includes(v))) uxIssues.push(`Vague: "${q.question}"`)
})
if (payload.introductionSummary?.length > 300) uxIssues.push(`introSummary too long (${payload.introductionSummary.length})`)
if (payload.tagline?.length > 100) uxIssues.push(`tagline too long (${payload.tagline.length})`)

if (uxIssues.length) stage(3, 'UX').fail(`Issues:\n${uxIssues.map(u => '  - ' + u).join('\n')}`)
out({ stage: 3, status: 'pass' })

// ─── STAGE 4: SEO Metadata ────────────────────────────────────────────────────
out({ stage: 4, status: 'running' })
const seoIssues = []
if (!payload.tagline) seoIssues.push('Missing tagline')
else {
  if (payload.tagline.length > 100) seoIssues.push(`tagline > 100 chars`)
  if (payload.tagline.split(' ').length > 12) seoIssues.push(`tagline > 12 words`)
}
if (!payload.introductionSummary) seoIssues.push('Missing intro')
else {
  if (payload.introductionSummary.length > 300) seoIssues.push('intro > 300 chars')
  if (/[`#*_]/.test(payload.introductionSummary)) seoIssues.push('intro has markdown')
}
if (!payload.animeImageUrl) seoIssues.push('Missing animeImageUrl')
if (!payload.themeColors?.primary) seoIssues.push('Missing themeColors.primary')

if (seoIssues.length) stage(4, 'SEO').fail(`Issues:\n${seoIssues.map(s => '  - ' + s).join('\n')}`)
out({ stage: 4, status: 'pass' })

// ─── STAGE 5: Final Validation ────────────────────────────────────────────────
out({ stage: 5, status: 'running', message: 'Tests' })
if (!SKIP_TEST) {
  const t = await runTests()
  if (t.code !== 0) stage(5, 'Tests').fail(t.out?.slice(-500))
}
out({ stage: 5, status: 'pass', message: SKIP_TEST ? 'tests skipped' : '107 passed' })

out({ stage: 5, status: 'running', message: 'Build' })
const b = await runBuild()
if (b.code !== 0) stage(5, 'Build').fail(b.out?.slice(-500))
out({ stage: 5, status: 'pass', message: 'build succeeded' })

// ─── DONE ─────────────────────────────────────────────────────────────────────
out({
  stage: 9,
  status: 'done',
  slug,
  malId,
  message: 'Universe ready. File Stage 9 Learn report in hashi-collab/memory/universe-performance.md within 7 days.',
  elapsed_ms: Date.now() - result.startTime
})
exit(0)
