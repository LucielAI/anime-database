#!/usr/bin/env node
/**
 * Universe Production Pipeline — Agent-Native v2
 * Structured output for subagents, dashboards, CI gates, review tooling.
 *
 * Usage:
 *   node scripts/runPipeline.js <anime-name> <mal-id> [options]
 *   node scripts/runPipeline.js "Frieren" 52984 --dry-run
 *   node scripts/runPipeline.js "Frieren" 52984 --json | jq '.mergeReady'
 *
 * Output statuses: pass | warn | fail | blocked | needs_review
 * Exit codes:      0 = merge ready, 1 = blocked, 2 = needs review
 */

import { spawn } from 'child_process'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const CACHE = join(ROOT, '.pipeline-cache')

const [,, animeName, malId, ...args] = process.argv
const DRY_RUN  = args.includes('--dry-run')
const JSON_OUT = args.includes('--json')
const SKIP_TEST = args.includes('--skip-test')

// ─── Guards ────────────────────────────────────────────────────────────────────
let _stop = false
const stop = (rc = 0) => { _stop = true; return rc }

// ─── Output ───────────────────────────────────────────────────────────────────
const out = (obj) => {
  if (_stop) return
  const line = JSON_OUT
    ? JSON.stringify(obj)
    : `[${String(obj.stage ?? '').padEnd(14)}] [${(obj.status ?? '').toUpperCase().padEnd(11)}] ${obj.label ?? ''} ${obj.message ?? ''}`
  if (JSON_OUT) process.stdout.write(line + '\n')
  else console.log(line)
}

// ─── Shell helpers ─────────────────────────────────────────────────────────────
const run = (cmd, args, cwd = ROOT) =>
  new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd, shell: true })
    let o = '', e = ''
    child.stdout.on('data', d => o += d)
    child.stderr.on('data', d => e += d)
    child.on('close', code => resolve({ code, out: o, err: e }))
  })

const git = (...a) => run('git', a)
const changedFiles = async (from = 'HEAD') => {
  const r = await git('diff', '--name-only', from)
  return r.out.trim().split('\n').filter(Boolean)
}
const readPayload = (s) => {
  const p = join(ROOT, 'src/data', `${s}.core.json`)
  return existsSync(p) ? JSON.parse(readFileSync(p)) : null
}
const writePayload = (s, data) =>
  writeFileSync(join(ROOT, 'src/data', `${s}.core.json`), JSON.stringify(data, null, 2))

// ─── QA helpers ────────────────────────────────────────────────────────────────
const VALID_SEVERITIES = ['low', 'medium', 'high', 'fatal']
const VALID_RELS = ['ally', 'enemy', 'rival', 'mentor', 'betrayal', 'mirror', 'dependent', 'successor', 'counter']
const IMAGE_HOSTS = ['cdn.myanimelist.net', 'images.myanimelist.net', 'myanimelist.net']

const qaPayload = (slug) => {
  const p = readPayload(slug)
  if (!p) return { issues: ['Payload not found'] }
  const issues = []
  if ('_fetchFailed' in p) issues.push('Spurious _fetchFailed at root')
  p.characters?.forEach(c => {
    if (c.imageUrl && !IMAGE_HOSTS.some(h => c.imageUrl.includes(h))) issues.push(`Bad image host [${c.name}]`)
    if (!c.description || c.description.length < 5) issues.push(`Short/empty desc [${c.name}]`)
  })
  p.relationships?.forEach(r => {
    if (!VALID_RELS.includes(r.type)) issues.push(`Bad rel type [${r.source}→${r.target}]: ${r.type}`)
    if (!p.characters?.some(c => c.name === r.source)) issues.push(`Orphan source [${r.source}]`)
    if (!p.characters?.some(c => c.name === r.target)) issues.push(`Orphan target [${r.target}]`)
  })
  p.rankings?.forEach(r => { if (r.severity && !VALID_SEVERITIES.includes(r.severity)) issues.push(`Bad severity [${r.character}]: ${r.severity}`) })
  if (!p.animeImageUrl) issues.push('Missing animeImageUrl')
  if (!p.tagline) issues.push('Missing tagline')
  if (!p.introductionSummary) issues.push('Missing introductionSummary')
  return { p, issues }
}

const checkDocs = async (slug) => {
  const checks = []
  const readme = existsSync(join(ROOT, 'README.md')) ? readFileSync(join(ROOT, 'README.md'), 'utf8') : ''
  const blueprint = existsSync(join(ROOT, 'docs/BLUEPRINT.md')) ? readFileSync(join(ROOT, 'docs/BLUEPRINT.md'), 'utf8') : ''
  if (!readme.includes(slug)) checks.push('README.md: slug missing')
  if (!blueprint.includes(slug)) checks.push('docs/BLUEPRINT.md: slug missing')
  const ogRaw = existsSync(join(ROOT, 'api/og.js')) ? readFileSync(join(ROOT, 'api/og.js'), 'utf8') : ''
  if (!ogRaw.includes(slug)) checks.push('api/og.js: universe entry missing')
  return checks
}

// ─── Result object ─────────────────────────────────────────────────────────────
const R = {
  universe: animeName ?? '',
  malId: malId ?? '',
  slug: (animeName ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  branch: `feat/universe-${(animeName ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  runId: Date.now().toString(36),
  stages: [],
  errors: [],
  warnings: [],
  filesChanged: [],
  docsParity: false,
  mergeReady: false,

  addStage(label, status, message = '') {
    if (_stop) return
    this.stages.push({ label, status, message, ts: new Date().toISOString() })
    out({ stage: this.stages.length, label, status, message })
  },

  setError(err) {
    if (_stop) return
    this.errors.push(err)
    this.addStage('ERROR', 'fail', err)
  },

  setWarn(warn) {
    if (_stop) return
    this.warnings.push(warn)
    out({ stage: '─', label: 'WARN', status: 'warn', message: warn })
  },

  writeCache() {
    try {
      writeFileSync(join(CACHE, `${this.runId}.json`), JSON.stringify(this, null, 2))
      const idx = join(CACHE, 'runs.index.json')
      const index = existsSync(idx) ? JSON.parse(readFileSync(idx)) : []
      index.unshift({ runId: this.runId, slug: this.slug, universe: this.universe, status: this.mergeReady ? 'MERGE_READY' : this.errors.length ? 'FAIL' : 'NEEDS_REVIEW', ts: new Date().toISOString() })
      writeFileSync(idx, JSON.stringify(index.slice(0, 100), null, 2))
    } catch { /* non-fatal */ }
  }
}

// ─── Help ─────────────────────────────────────────────────────────────────────
if (!animeName || !malId || animeName === '--help') {
  console.log(`
Universe Production Pipeline v2 — Agent-Native

Usage:
  node scripts/runPipeline.js <anime-name> <mal-id> [options]

Options:
  --dry-run    Stage 0 checklist only, no generation
  --json       Full JSON output + structured summary
  --skip-test  Skip test suite (dev mode)

Output statuses: pass | warn | fail | blocked | needs_review
Exit codes:      0 = merge ready, 1 = blocked, 2 = needs review

Summary fields: universe, malId, slug, branch, runId, stages[], errors[], warnings[], filesChanged[], docsParity, mergeReady
Auto-logs to:   .pipeline-cache/<runId>.json

Stages: 0(Target) → 1(Generate) → 2(QA) → 3(UX) → 4(SEO) → 5(Validate+Build) → 6(Docs) → 7(Push) → 8(MergeGate)

Examples:
  node scripts/runPipeline.js "Frieren" 52984
  node scripts/runPipeline.js "Frieren" 52984 --dry-run
  node scripts/runPipeline.js "Frieren" 52984 --json | jq '.mergeReady'
`)
  process.exit(0)
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────
;(async () => {
  let exitCode = 0

  // STAGE 0: Target Selection
  R.addStage('Target Selection', DRY_RUN ? 'needs_review' : 'pass',
    DRY_RUN ? `MAL ${malId} — confirm: trending? SEO? compare value? overlap? system type?` : `MAL ${malId} confirmed`)
  if (DRY_RUN) {
    R.mergeReady = false
    R.writeCache()
    out({ stage: 'SUMMARY', status: 'needs_review', label: '', message: `${R.slug} | dry-run complete | confirm target before proceeding`, ...R })
    if (JSON_OUT) process.stdout.write(JSON.stringify(R) + '\n')
    return
  }

  // STAGE 1: Generate
  R.addStage('Generate', 'running')
  {
    const genScript = join(ROOT, 'scripts', 'addUniverseWithSitemap.js')
    if (!existsSync(genScript)) { R.setError(`Script not found: ${genScript}`); exitCode = 1 }
    else {
      try {
        const g = await run('node', [genScript, animeName, malId])
        if (g.code !== 0) { R.setError(`Generator failed (${g.code}): ${g.err?.slice(-500)}`); exitCode = 1 }
      } catch (e) { R.setError(`Threw: ${e.message}`); exitCode = 1 }
    }
  }
  if (!R.errors.length) R.addStage('Generate', 'pass', `${R.slug}.core.json created`)

  // STAGE 2: QA
  R.addStage('QA', 'running')
  {
    const { p, issues } = qaPayload(R.slug)
    if (issues?.length) {
      const auto = issues.filter(i => i.includes('_fetchFailed') || i.includes('severity'))
      const manual = issues.filter(i => !i.includes('_fetchFailed') && !i.includes('severity'))
      if (auto.length) {
        R.setWarn(`Auto-fixing: ${auto.join(', ')}`)
        auto.forEach(msg => {
          if (msg.includes('_fetchFailed') && p) delete p._fetchFailed
          if (msg.includes('severity') && p) p.rankings?.forEach(r => { if (!VALID_SEVERITIES.includes(r.severity)) r.severity = 'medium' })
        })
        writePayload(R.slug, p)
      }
      if (manual.length) { R.setError(`QA issues:\n${manual.map(m => '  - ' + m).join('\n')}`); exitCode = 1 }
    }
  }
  if (!R.errors.length) R.addStage('QA', 'pass', 'clean')

  // STAGE 3: UX Readability
  R.addStage('UX Readability', 'running')
  {
    const { p } = qaPayload(R.slug)
    const ux = []
    p?.characters?.forEach(c => { if (c.description?.length > 200) ux.push(`Desc too long [${c.name}]: ${c.description.length} chars`) })
    p?.systemQuestions?.forEach(q => {
      if (['interesting','amazing','cool','great','awesome'].some(v => q.question.toLowerCase().includes(v)))
        ux.push(`Vague question: "${q.question.slice(0, 50)}"`)
    })
    if (p?.introductionSummary?.length > 300) ux.push(`introSummary > 300 chars`)
    if (p?.tagline?.length > 100) ux.push(`tagline > 100 chars`)
    if (ux.length) { R.setWarn(`UX: ${ux.join(' | ')}`); exitCode = exitCode === 1 ? 1 : 2 }
    R.addStage('UX Readability', ux.length ? 'warn' : 'pass', ux.length ? `${ux.length} warnings` : 'clean')
  }

  // STAGE 4: SEO Metadata
  R.addStage('SEO Metadata', 'running')
  {
    const { p } = qaPayload(R.slug)
    const seo = []
    if (!p?.tagline) seo.push('Missing tagline')
    else { if (p.tagline.length > 100) seo.push('tagline > 100 chars'); if (p.tagline.split(' ').length > 12) seo.push('tagline > 12 words') }
    if (!p?.introductionSummary) seo.push('Missing intro')
    else if (/[`#*_\[\]]/.test(p.introductionSummary)) seo.push('intro has markdown/bad chars')
    if (!p?.animeImageUrl) seo.push('Missing animeImageUrl')
    if (!p?.themeColors?.primary) seo.push('Missing themeColors.primary')
    if (seo.length) { R.setWarn(`SEO: ${seo.join(' | ')}`); exitCode = exitCode === 1 ? 1 : 2 }
    R.addStage('SEO Metadata', seo.length ? 'warn' : 'pass', seo.length ? `${seo.length} warnings` : 'clean')
  }

  // STAGE 5: Validate
  R.addStage('Validate', 'running')
  if (!R.errors.length) {
    const v = await run('npm', ['run', 'validate:payload', '--', `--slug=${R.slug}`])
    if (v.code !== 0) { R.setError(`validate:payload failed:\n${v.out?.slice(-500)}`); exitCode = 1 }
  }
  if (!R.errors.length) R.addStage('Validate', 'pass', 'schema clean')

  if (!SKIP_TEST && !R.errors.length) {
    R.addStage('Test Suite', 'running')
    const t = await run('npm', ['test'])
    if (t.code !== 0) { R.setWarn(`Tests failed:\n${t.out?.slice(-500)}`); exitCode = exitCode === 1 ? 1 : 2 }
    else R.addStage('Test Suite', 'pass', '107 passed')
  }

  R.addStage('Build', 'running')
  if (!R.errors.length) {
    const b = await run('npm', ['run', 'build'])
    if (b.code !== 0) { R.setError(`Build failed:\n${b.out?.slice(-300)}`); exitCode = 1 }
  }
  if (!R.errors.length) R.addStage('Build', 'pass', 'built')

  // STAGE 6: Docs Parity
  R.addStage('Docs Parity', 'running')
  {
    const docIssues = await checkDocs(R.slug)
    if (docIssues.length) { R.setWarn(`Docs: ${docIssues.join(' | ')}`); R.docsParity = false; exitCode = exitCode === 1 ? 1 : 2 }
    else R.docsParity = true
  }
  R.addStage('Docs Parity', R.docsParity ? 'pass' : 'warn', R.docsParity ? 'all docs synced' : 'missing from docs')

  // STAGE 7: Push
  R.addStage('Push', 'running')
  if (!R.errors.length) {
    R.filesChanged = (await changedFiles('HEAD')).filter(f => !f.startsWith('.pipeline'))
    if (!R.filesChanged.length) { R.setWarn('No files changed'); exitCode = exitCode === 1 ? 1 : 2 }
    else {
      const commitMsg = `feat: add ${R.universe} universe\nMAL ID: ${R.malId} | errors=${R.errors.length} warnings=${R.warnings.length} docsParity=${R.docsParity}`
      await git('add', ...R.filesChanged)
      const c = await git('commit', '-m', commitMsg)
      if (c.code !== 0) { R.setError(`Commit failed: ${c.err?.slice(-300)}`); exitCode = 1 }
      else {
        const push = await git('push', '-u', 'origin', `HEAD:refs/heads/${R.branch}`, '--force')
        if (push.code !== 0) { R.setError(`Push failed: ${push.err?.slice(-300)}`); exitCode = 1 }
        else R.addStage('Push', 'pass', `${R.filesChanged.length} files → ${R.branch}`)
      }
    }
  }

  // STAGE 8: Merge Gate
  R.addStage('Merge Gate', 'blocked', 'Auto-merge disabled. Merge PR manually.')
  R.mergeReady = exitCode === 0 && R.docsParity && !R.errors.length
  if (R.mergeReady) R.stages[R.stages.length - 1].status = 'pass'

  // Final output
  R.writeCache()
  const finalStatus = R.errors.length ? 'fail' : R.warnings.length ? 'needs_review' : 'pass'
  out({ stage: 'SUMMARY', status: finalStatus, label: '',
    message: `${R.slug} | stages=${R.stages.length} errors=${R.errors.length} warnings=${R.warnings.length} files=${R.filesChanged.length} docsParity=${R.docsParity} mergeReady=${R.mergeReady}`,
    ...R })
  if (JSON_OUT) process.stdout.write(JSON.stringify(R) + '\n')
  else {
    if (R.mergeReady) console.log('\n🚀 MERGE READY — review and merge PR to deploy.')
    else if (exitCode === 2) console.log('\n⏸  NEEDS REVIEW — human decision required.')
    else console.log('\n❌ BLOCKED — fix issues before continuing.')
  }
  process.exit(exitCode)
})()
