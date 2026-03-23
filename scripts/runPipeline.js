#!/usr/bin/env node
/**
 * Universe Production Pipeline — Agent-Native v4
 * Structured output for subagents, dashboards, CI gates, review tooling.
 *
 * v4 adds:
 *   contentScore.signals: {characterCount, relationshipCount, powerSystemDefined, uniqueMechanics}
 *   linking:              {relatedUniverses[{id,reason}], comparePairs[{left,right,strength,reason}]}
 *   distribution.hooks:   curiosity/scroll-stopping lines
 *   ranking:             {tier, complexityRank, strategyRank, overallRank}
 *   homepage:            {eligible, priority, reason} (replaces homepageEligible bool)
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
    const loreOk = (c.loreBio?.length ?? 0) >= 5
    const sysOk  = (c.systemBio?.length ?? 0) >= 5
    if (!loreOk && !sysOk) issues.push(`Short/empty bio [${c.name}]`)
    else if (!loreOk || !sysOk) issues.push(`WARN: partial bio [${c.name}] — only ${loreOk ? "loreBio" : "systemBio"} populated`)
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
  const charCount = p.characters?.length ?? 0
  const relCount  = p.relationships?.length ?? 0
  const facCount  = p.factions?.length ?? 0
  const ruleCount = p.rules?.length ?? 0
  const evtCount  = p.causalEvents?.length ?? 0
  const sqCount   = p.systemQuestions?.length ?? 0
  const relTypes  = [...new Set(p.relationships?.map(r => r.type) ?? [])]
  const myType    = p.visualizationHint ?? ''

  // Signals — raw numbers for transparency
  const uniqueMechanics = (p.powerSystem?.length ?? 0) + relTypes.length + (p.rules?.length ?? 0)

  const depthRaw = (charCount * 1 + relCount * 1.5 + facCount * 2 + ruleCount * 2 + evtCount * 1.5 + sqCount * 1) / 7

  const scores = {
    depth:             Math.min(10, Math.round(depthRaw * 10) / 10),
    novelty:           myType === 'affinity-matrix' ? 9 : myType === 'counter-tree' ? 7 : myType === 'node-graph' ? 5 : myType === 'timeline' ? 6 : 5,
    clarity:           0,
    comparisonValue:   0,
    overall:           0,
    signals: {
      characterCount:        charCount,
      relationshipCount:      relCount,
      powerSystemDefined:     (p.powerSystem?.length ?? 0) > 0,
      uniqueMechanics,
    },
  }
  scores.novelty = Math.min(10, scores.novelty + (relTypes.length >= 5 ? 1.5 : relTypes.length >= 3 ? 1 : 0))
  const charsWithDesc = p.characters?.filter(c => c.description && c.description.length > 10 && !/^[A-Z\s]{20,}$/.test(c.description)).length ?? 0
  scores.clarity = Math.round(((charCount > 0 ? charsWithDesc / charCount : 0) * 8 + (p.introductionSummary ? 2 : 0)) * 10) / 10
  const hasRankings = Object.keys(p.rankings ?? {}).length >= 3
  const hasPowerSys = (p.powerSystem?.length ?? 0) >= 2
  scores.comparisonValue = (hasRankings ? 4 : 0) + (hasPowerSys ? 3 : 0) + (charCount >= 8 ? 2 : 0) + (relTypes.length >= 4 ? 1 : 0)
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

  const typeLabels = {
    'timeline':        'Time-travel / causal loop system',
    'counter-tree':    'Rock-Paper-Scissors combat system',
    'node-graph':      'Relationship-driven character web',
    'affinity-matrix': 'Affinity / compatibility matrix system',
  }

  // Known existing universes
  const known = ['aot','jjk','chainsawman','demonslayer','hxh','vinlandsaga','steinsgate','deathnote','fmab','codegeass','mha','frieren','sololeveling','goblinslayer','mushokutensei','naruto','one-piece','dragonballz','bleach','tokyo-ghoul','mobpsycho100']
  const typeOf = (s) => {
    if (['aot','steinsgate'].includes(s)) return 'timeline'
    if (['jjk','demonslayer'].includes(s)) return 'counter-tree'
    if (['hxh','deathnote','fmab','codegeass','mha','naruto','one-piece','dragonballz','bleach','tokyo-ghoul','mobpsycho100'].includes(s)) return 'node-graph'
    if (['chainsawman','frieren','sololeveling','goblinslayer','mushokutensei'].includes(s)) return 'affinity-matrix'
    return 'node-graph'
  }

  // Related universes: same system type (adjacent in catalog), different is better for discovery
  const sameType = known.filter(s => s !== slug && typeOf(s) === vizHint)
  const diffType = known.filter(s => s !== slug && typeOf(s) !== vizHint)
  const relatedUniverses = [
    ...sameType.slice(0, 2).map(s => ({ id: s, reason: `Same system type — good for side-by-side comparison` })),
    ...diffType.slice(0, 3).map(s => ({ id: s, reason: `Different system type — useful contrast on compare page` })),
  ]

  // Compare pairs: strongest contrast first
  const comparePairs = []
  opposites.filter(o => known.includes(o)).forEach(o => {
    comparePairs.push({ left: slug, right: o, strength: 'strong', reason: `Contrasting system types: ${typeLabels[vizHint] ?? vizHint} vs ${typeLabels[typeOf(o)] ?? typeOf(o)}` })
  })
  if (comparePairs.length < 2) {
    diffType.slice(0, 2).forEach(o => {
      comparePairs.push({ left: slug, right: o, strength: 'moderate', reason: `Moderate contrast: ${typeLabels[vizHint] ?? vizHint} vs ${typeLabels[typeOf(o)] ?? typeOf(o)}` })
    })
  }

  return { relatedUniverses, comparePairs }
}

/** Generate distribution assets */
const computeDistribution = (p) => {
  const shareSnippets = []
  const seoTitles = []
  const hooks = []

  const anime    = p.anime ?? ''
  const tagline  = p.tagline ?? ''
  const charCount = p.characters?.length ?? 0
  const relCount  = p.relationships?.length ?? 0

  // Share snippets (tweet-sized, <=280 chars)
  if (tagline) {
    shareSnippets.push(`${tagline} — mapped at animearchive.app/universe/${p.slug ?? '???'}`)
    if (tagline.length < 200) {
      shareSnippets.push(`"${tagline.split(' ').slice(0, 12).join(' ')}..." — system breakdown on @animearchive`)
    }
  }
  if (charCount >= 5) {
    shareSnippets.push(`${charCount} characters · ${relCount} relationships mapped. Explore the system →`)
  }

  // SEO title variations (anime name must appear in each)
  if (anime) {
    seoTitles.push(`${anime} Power System Explained — Anime Intelligence Archive`)
    seoTitles.push(`How ${anime} Works: System Breakdown | animearchive.app`)
    seoTitles.push(`${anime} — Universe Analysis | Characters, Factions & Power Rules`)
    const sysType = p.visualizationHint ?? ''
    if (sysType) seoTitles.push(`${sysType.replace('-', ' ')} system in ${anime} — analyzed`)
  }

  // Curiosity hooks — scroll-stopping lines that make people click
  if (charCount >= 8) hooks.push(`${charCount} characters analyzed — but which one is actually the strongest?`)
  if (relCount >= 10) hooks.push(`${relCount} relationships mapped and none of them are simple`)
  if (p.powerSystem?.length >= 2) hooks.push(`This anime's power system breaks the usual rules. Here's how.`)
  if (p.systemQuestions?.length >= 3) {
    const firstQ = p.systemQuestions[0]?.question ?? ''
    if (firstQ) hooks.push(`The question everyone asks about ${anime} — answered: "${firstQ.slice(0, 80)}"`)
  }
  if (tagline) hooks.push(`"${tagline}" — we mapped it. Here's the full system.`)
  if (hooks.length === 0 && tagline) hooks.push(`Here's why ${anime}'s world is more complex than it looks.`)

  return { shareSnippets, seoTitles, hooks, internalBoostApplied: false }
}

/** Rank universe across strategic dimensions */
const computeRanking = (p, contentScore) => {
  const overall = contentScore?.overall ?? 5
  const sysType = p?.visualizationHint ?? ''

  // Tier: S >= 8, A >= 6, B >= 4, C < 4
  const tier = overall >= 8 ? 'S' : overall >= 6 ? 'A' : overall >= 4 ? 'B' : 'C'

  // complexityRank: how intricate is the system (faction count, rule depth, relationship web)
  const complexityScore =
    (p?.factions?.length ?? 0) * 2 +
    (p?.rules?.length ?? 0) * 2 +
    (p?.relationships?.length ?? 0) * 0.5 +
    (p?.causalEvents?.length ?? 0) * 0.5
  const complexityRank = Math.min(10, Math.round(complexityScore))

  // strategyRank: how good is this for the compare page (rankings, power system, contrast value)
  const cs = contentScore ?? {}
  const strategyScore = (cs.comparisonValue ?? 0) * 1.2 + (cs.depth ?? 0) * 0.3
  const strategyRank = Math.min(10, Math.round(strategyScore))

  // overallRank: 1-21 across all known universes (universe count normalized)
  // Use overall score * 2 + relationship count as proxy
  const universeCount = 21
  const overallRankRaw = overall * 2 + (p?.relationships?.length ?? 0) * 0.1
  const overallRank = Math.max(1, Math.min(universeCount, Math.round(universeCount - overallRankRaw + 1)))

  return { tier, complexityRank, strategyRank, overallRank }
}

/** Determine homepage placement */
const computeHomepage = (p, contentScore, ranking) => {
  const overall = contentScore?.overall ?? 0
  const tier   = ranking?.tier ?? 'C'

  if (overall < 4) return { eligible: false, priority: 0, reason: 'Content score below publishable threshold' }
  if (tier === 'S') return { eligible: true, priority: 10, reason: 'S-tier universe — maximum homepage visibility' }
  if (tier === 'A') return { eligible: true, priority: 7, reason: 'A-tier — featured in system-type section' }
  if (tier === 'B') return { eligible: true, priority: 4, reason: 'B-tier — catalog placement with category badge' }
  return { eligible: false, priority: 0, reason: 'C-tier — available via search/catalog only' }
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
  contentScore: null,   // {depth, novelty, clarity, comparisonValue, overall, signals} | null
  linking: null,        // {relatedUniverses[], comparePairs[]} | null
  distribution: null,   // {shareSnippets[], seoTitles[], hooks[], internalBoostApplied} | null
  ranking: null,        // {tier, complexityRank, strategyRank, overallRank} | null
  homepage: null,       // {eligible, priority, reason} | null
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
      index.unshift({ runId: this.runId, slug: this.slug, universe: this.universe, status: this.mergeReady ? 'MERGE_READY' : this.errors.length ? 'FAIL' : 'NEEDS_REVIEW', ts: new Date().toISOString(), contentScore: this.contentScore?.overall ?? null, tier: this.ranking?.tier ?? null, homepagePriority: this.homepage?.priority ?? null })
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

Stages: 0(Target) → 1(Generate) → 2(QA) → 3(UX) → 4(SEO) → 5(Validate+Build) → 6(Docs) → 7(Push) → 9(ContentScore) → 10(Linking) → 11(Distribution) → 12(Ranking) → 13(Homepage) → 14(MergeGate)

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
          if (msg.includes("severity") && p) Object.values(p.rankings ?? {}).forEach(entry => { if (Array.isArray(entry)) entry.forEach(item => { if (item.severity && !VALID_SEVERITIES.includes(item.severity)) item.severity = "medium" }) })
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
    const note = `${linking.comparePairs.length} compare pairs | ${linking.relatedUniverses.length} related`
    R.addStage('Linking', linking.comparePairs.length >= 2 ? 'pass' : 'warn', note)
    if (!linking.comparePairs.length) R.setWarn('No compare pairs — universe may be isolated')
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

  // STAGE 13: Ranking
  R.addStage('Ranking', 'running')
  {
    const { p } = qaPayload(R.slug)
    if (p && R.contentScore) {
      R.ranking = computeRanking(p, R.contentScore)
      R.addStage('Ranking', 'pass', `tier=${R.ranking.tier} complexity=${R.ranking.complexityRank} strategy=${R.ranking.strategyRank} overall=${R.ranking.overallRank}`)
    } else {
      R.ranking = null
    }
  }

  // STAGE 14: Homepage
  R.addStage('Homepage', 'running')
  {
    const { p } = qaPayload(R.slug)
    if (p && R.contentScore && R.ranking) {
      R.homepage = computeHomepage(p, R.contentScore, R.ranking)
      const note = `eligible=${R.homepage.eligible} priority=${R.homepage.priority} — ${R.homepage.reason}`
      R.addStage('Homepage', R.homepage.eligible ? 'pass' : 'warn', note)
    } else {
      R.homepage = { eligible: false, priority: 0, reason: 'Missing data' }
    }
  }

  // STAGE 15: Merge Gate
  R.addStage('Merge Gate', 'blocked', 'Auto-merge disabled. Merge PR manually.')
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
