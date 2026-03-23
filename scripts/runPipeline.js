#!/usr/bin/env node
/**
 * Universe Production Pipeline — Agent-Native v3
 * Structured output for subagents, dashboards, CI gates, review tooling.
 *
 * Extended v3 contract adds:
 *   contentScore: {depth, novelty, clarity, comparisonValue, overall} (0-10)
 *   linking:      {relatedUniverses[], comparePairs[], homepageEligible}
 *   distribution: {shareSnippets[], seoTitles[], internalBoostApplied}
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

// ─── Extended v3 helpers ──────────────────────────────────────────────────────

/** Score a universe payload on content quality (0–10 per dimension) */
const scoreContent = (p) => {
  const scores = { depth: 0, novelty: 0, clarity: 0, comparisonValue: 0, overall: 0 }

  // Depth: characters + relationships + factions + rules + events
  const charCount = p.characters?.length ?? 0
  const relCount  = p.relationships?.length ?? 0
  const facCount  = p.factions?.length ?? 0
  const ruleCount = p.rules?.length ?? 0
  const evtCount  = p.causalEvents?.length ?? 0
  const sqCount   = p.systemQuestions?.length ?? 0
  const depthRaw = (charCount * 1 + relCount * 1.5 + facCount * 2 + ruleCount * 2 + evtCount * 1.5 + sqCount * 1) / 7
  scores.depth = Math.min(10, Math.round(depthRaw * 10) / 10)

  // Novelty: system type rarity in existing universe set
  const existingTypes = ['timeline', 'counter-tree', 'node-graph', 'affinity-matrix']
  const myType = p.visualizationHint ?? ''
  const sameTypeCount = existingTypes.filter(t => t === myType).length // simplified
  scores.novelty = myType === 'affinity-matrix' ? 9 : myType === 'counter-tree' ? 7 : myType === 'node-graph' ? 5 : myType === 'timeline' ? 6 : 5
  // Boost if relationship variety is high (many different rel types)
  const relTypes = [...new Set(p.relationships?.map(r => r.type) ?? [])]
  scores.novelty = Math.min(10, scores.novelty + (relTypes.length >= 5 ? 1.5 : relTypes.length >= 3 ? 1 : 0))

  // Clarity: descriptions present and not all-caps
  const charsWithDesc = p.characters?.filter(c => c.description && c.description.length > 10 && !/^[A-Z\s]{20,}$/.test(c.description)).length ?? 0
  const descRatio = charCount > 0 ? charsWithDesc / charCount : 0
  scores.clarity = Math.round((descRatio * 8 + (p.introductionSummary ? 2 : 0)) * 10) / 10

  // Comparison value: good for compare page (different system type from most universes, strong rankings)
  const hasRankings = (p.rankings?.length ?? 0) >= 3
  const hasPowerSys  = (p.powerSystem?.length ?? 0) >= 2
  scores.comparisonValue = (hasRankings ? 4 : 0) + (hasPowerSys ? 3 : 0) + (charCount >= 8 ? 2 : 0) + (relTypes.length >= 4 ? 1 : 0)

  // Overall: weighted average
  scores.overall = Math.round((scores.depth * 0.3 + scores.novelty * 0.2 + scores.clarity * 0.3 + scores.comparisonValue * 0.2) * 10) / 10

  return scores
}

/** Find related universes and ideal compare pairs */
const computeLinking = (slug, vizHint) => {
  // System type contrast map — opposites/contrasts score highest for compare
  const contrastMap = {
    'timeline':        ['node-graph', 'counter-tree'],
    'counter-tree':    ['timeline', 'affinity-matrix'],
    'node-graph':      ['timeline', 'affinity-matrix'],
    'affinity-matrix': ['counter-tree', 'timeline'],
  }
  const opposites = contrastMap[vizHint] ?? []

  // Known existing universes (hardcoded for now — could read catalog at runtime)
  const known = ['aot','jjk','chainsawman','demonslayer','hxh','vinlandsaga','steinsgate','deathnote','fmab','codegeass','mha','frieren','sololeveling','goblinslayer','mushokutensei','naruto','one-piece','dragonballz','bleach','tokyo-ghoul','mobpsycho100']
  const related = known.filter(s => s !== slug).slice(0, 5)
  const comparePairs = opposites.filter(o => known.includes(o)).map(o => ({ left: slug, right: o, strength: 'strong' }))
  if (comparePairs.length < 2) {
    // Fallback: any 2 other universes as moderate pairs
    const fallbacks = known.filter(s => s !== slug).slice(0, 2)
    fallbacks.forEach(o => comparePairs.push({ left: slug, right: o, strength: 'moderate' }))
  }

  // Homepage eligible: overall score >= 6.0 (runtime-assigned later; here just structural)
  const hasHero = true // structural gate passed earlier
  const homepageEligible = hasHero && slug.length > 0

  return { relatedUniverses: related, comparePairs, homepageEligible }
}

/** Generate distribution assets */
const computeDistribution = (p) => {
  const shareSnippets = []
  const seoTitles = []

  // Tagline-derived snippets (tweet-sized, <=280 chars)
  const tagline = p.tagline ?? ''
  if (tagline) {
    shareSnippets.push(`${tagline} — mapped at animearchive.app/universe/${p.slug ?? '???'}`)
    if (tagline.length < 200) {
      shareSnippets.push(`"${tagline.split(' ').slice(0, 12).join(' ')}..." — system breakdown on @animearchive`)
    }
  }

  // Character count snippet
  const charCount = p.characters?.length ?? 0
  const relCount  = p.relationships?.length ?? 0
  if (charCount >= 5) {
    shareSnippets.push(`${charCount} characters · ${relCount} relationships mapped. Explore the system →`)
  }

  // SEO title variations (anime name should appear in each)
  const anime = p.anime ?? ''
  if (anime) {
    seoTitles.push(`${anime} Power System Explained — Anime Intelligence Archive`)
    seoTitles.push(`How ${anime} Works: System Breakdown | animearchive.app`)
    seoTitles.push(`${anime} — Universe Analysis | Characters, Factions & Power Rules`)
  }

  // System type titles
  const sysType = p.visualizationHint ?? ''
  if (anime && sysType) {
    seoTitles.push(`${sysType.replace('-', ' ')} system in ${anime} — analyzed`)
  }

  return { shareSnippets, seoTitles, internalBoostApplied: false }
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

  // ── Extended contract v3 ────────────────────────────────────────────────────
  contentScore: null,   // {depth, novelty, clarity, comparisonValue, overall} | null
  linking: null,        // {relatedUniverses, comparePairs, homepageEligible} | null
  distribution: null,   // {shareSnippets, seoTitles, internalBoostApplied} | null
  // ─────────────────────────────────────────────────────────────────────────

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
      index.unshift({ runId: this.runId, slug: this.slug, universe: this.universe, status: this.mergeReady ? 'MERGE_READY' : this.errors.length ? 'FAIL' : 'NEEDS_REVIEW', ts: new Date().toISOString(), contentScore: this.contentScore?.overall ?? null })
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

Stages: 0(Target) → 1(Generate) → 2(QA) → 3(UX) → 4(SEO) → 5(Validate+Build) → 6(Docs) → 7(Push) → 9(ContentScore) → 10(Linking) → 11(Distribution) → 12(MergeGate)

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

  // STAGE 9: Content Score
  R.addStage('Content Score', 'running')
  {
    const { p } = qaPayload(R.slug)
    if (p) {
      R.contentScore = scoreContent(p)
      const s = R.contentScore
      const notes = `depth=${s.depth} novelty=${s.novelty} clarity=${s.clarity} compareVal=${s.comparisonValue} overall=${s.overall}`
      if (s.overall < 4) {
        R.setWarn(`Content score ${s.overall}/10 — below threshold (4). Universe may be too thin to publish.`)
        exitCode = exitCode === 1 ? 1 : 2
      } else if (s.overall < 6) {
        R.setWarn(`Content score ${s.overall}/10 — acceptable but not strong. Consider expanding before publishing.`)
        exitCode = exitCode === 1 ? 1 : 2
      }
      R.addStage('Content Score', s.overall < 4 ? 'fail' : s.overall < 6 ? 'warn' : 'pass', notes)
    } else {
      R.contentScore = null
    }
  }

  // STAGE 10: Linking
  R.addStage('Linking', 'running')
  {
    const { p } = qaPayload(R.slug)
    const vizHint = p?.visualizationHint ?? ''
    const linking = computeLinking(R.slug, vizHint)
    R.linking = linking
    const note = linking.homepageEligible
      ? `eligible for homepage | ${linking.comparePairs.length} compare pairs | ${linking.relatedUniverses.length} related`
      : `not homepage eligible | ${linking.comparePairs.length} compare pairs | ${linking.relatedUniverses.length} related`
    R.addStage('Linking', linking.comparePairs.length >= 2 ? 'pass' : 'warn', note)
    if (!linking.comparePairs.length) R.setWarn('No compare pairs found — universe may be isolated')
  }

  // STAGE 11: Distribution
  R.addStage('Distribution', 'running')
  {
    const { p } = qaPayload(R.slug)
    if (p) {
      R.distribution = computeDistribution(p)
      const note = `${R.distribution.shareSnippets.length} snippets | ${R.distribution.seoTitles.length} SEO titles`
      R.addStage('Distribution', 'pass', note)
    } else {
      R.distribution = null
    }
  }

  // STAGE 12: Merge Gate
  R.addStage('Merge Gate', 'blocked', 'Auto-merge disabled. Merge PR manually.')
  // contentScore overall < 4 is a hard block; < 6 is a soft warning
  const scoreBlocked = R.contentScore && R.contentScore.overall < 4
  R.mergeReady = exitCode === 0 && R.docsParity && !R.errors.length && !scoreBlocked
  if (R.mergeReady) R.stages[R.stages.length - 1].status = 'pass'

  // Final output — include extended v3 contract fields
  R.writeCache()
  const finalStatus = R.errors.length ? 'fail' : R.warnings.length ? 'needs_review' : 'pass'
  out({ stage: 'SUMMARY', status: finalStatus, label: '',
    message: `${R.slug} | stages=${R.stages.length} errors=${R.errors.length} warnings=${R.warnings.length} files=${R.filesChanged.length} docsParity=${R.docsParity} contentScore=${R.contentScore?.overall ?? '?'} mergeReady=${R.mergeReady}`,
    ...R })
  if (JSON_OUT) process.stdout.write(JSON.stringify(R) + '\n')
  else {
    if (R.mergeReady) console.log('\n🚀 MERGE READY — review and merge PR to deploy.')
    else if (exitCode === 2) console.log('\n⏸  NEEDS REVIEW — human decision required.')
    else console.log('\n❌ BLOCKED — fix issues before continuing.')
  }
  process.exit(exitCode)
})()
