#!/usr/bin/env node
/**
 * Bug Catcher v2 — PR-aware enforcement gate
 *
 * Key evolution from v1:
 * - Universe file checks replaced with FULL enforcement logic (file integrity, images,
 *   template content, microHook/thesis lengths, systemQuestions, catalog.js sync)
 * - Calls enforce-universe-quality.sh as mandatory pre-flight gate
 * - PR-aware: only runs relevant checks based on which files actually changed
 * - GitHub comment posted to PR with results
 *
 * Usage:
 *   node scripts/catch-bugs.js <pr-number> [--repo=/path/to/repo]
 *   node scripts/catch-bugs.js 116 --json
 */

import { spawn, execSync } from 'child_process'
import { existsSync, readFileSync, readdirSync } from 'fs'
import { join, dirname, basename } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DEFAULT_REPO = '/data/workspace/anime-database'
const TOKEN = process.env.BUG_CATCHER_TOKEN || ''

const args = process.argv.slice(2)
const PR_NUMBER = args.find(a => !a.startsWith('--') && !a.startsWith('-'))?.replace(/[^0-9]/g, '')
const REPO_ARG = args.find(a => a.startsWith('--repo='))?.split('=')[1]
const ROOT = REPO_ARG || DEFAULT_REPO

const api = (path) => {
  try {
    const r = execSync(`curl -s "https://api.github.com${path}" -H "Authorization: Bearer ${TOKEN}" -H "Accept: application/vnd.github.v3+json"`, { encoding: 'utf8' })
    return JSON.parse(r)
  } catch (e) {
    return null
  }
}

const run = (cmd, cmdArgs, opts = {}) =>
  new Promise((resolve) => {
    const child = spawn(cmd, cmdArgs, {
      cwd: ROOT,
      shell: true,
      stdio: ['pipe', 'pipe', 'ignore'],
      ...opts,
    })
    let o = ''
    child.stdout.on('data', d => o += d)
    child.on('close', code => resolve({ code, out: o }))
  })

const log = (...m) => console.log(`[bug-catcher] ${m.join(' ')}`)
const err = (...m) => console.error(`[bug-catcher] ❌ ${m.join(' ')}`)
const ok  = (...m) => console.log(`[bug-catcher] ✅ ${m.join(' ')}`)

// ─── ENFORCEMENT (runs for universe PRs) ─────────────────────────────────

/**
 * Run the blocking enforcement script as a subprocess.
 * This is the authoritative quality gate — replaces all manual universe checks.
 */
async function runEnforcementGate(ROOT) {
  const scriptPath = join(ROOT, 'scripts', 'enforce-universe-quality.sh')
  if (!existsSync(scriptPath)) {
    return { name: 'Enforcement gate', pass: false, detail: 'enforce-universe-quality.sh not found' }
  }

  const result = await run('bash', [scriptPath])
  if (result.code === 0) {
    return { name: 'Enforcement gate', pass: true, detail: 'all 5 enforcement gates passed' }
  }
  // Parse which gate failed from output
  const lines = result.out.split('\n').filter(l => l.includes('❌') || l.includes('BLOCKED') || l.includes('FAIL'))
  return {
    name: 'Enforcement gate',
    pass: false,
    detail: lines.slice(0, 3).join('; ') || 'enforcement script failed'
  }
}

// ─── FILE INTEGRITY CHECKS (always run) ─────────────────────────────────

function checkFileIntegrity(ROOT, changedFiles = []) {
  const issues = []

  // Only check universe files that are in the PR
  const universeFiles = changedFiles.filter(f =>
    /^src\/data\/.*\.core\.json$/.test(f) || /^src\/data\/.*\.json$/.test(f)
  )

  const expectedAnime = {
    'black-clover.core.json': 'Black Clover',
    're-zero.core.json': 'Re:Zero - Starting Life in Another World',
    'blue-lock.core.json': 'Blue Lock',
    'sword-art-online.core.json': 'Sword Art Online',
    'tokyo-revengers.core.json': 'Tokyo Revengers',
    'one-punch-man.core.json': 'One Punch Man',
    'spy-x-family.core.json': 'Spy x Family',
    'fire-force.core.json': 'Fire Force',
    'parasyte.core.json': 'Parasyte',
  }

  for (const f of universeFiles) {
    const fname = basename(f)
    if (!expectedAnime[fname]) continue
    try {
      const raw = readFileSync(join(ROOT, f), 'utf8')
      const d = JSON.parse(raw)
      const actual = d.anime || ''
      if (actual !== expectedAnime[fname]) {
        issues.push(`${fname}: anime="${actual}" (expected "${expectedAnime[fname]}")`)
      }
    } catch (e) {
      issues.push(`${fname}: cannot read/parse — ${e.message.slice(0, 50)}`)
    }
  }

  if (issues.length > 0) {
    return { name: 'File integrity', pass: false, detail: issues.join('; ') }
  }
  return { name: 'File integrity', pass: true, detail: 'all universe files match expected anime names' }
}

// ─── IMAGE VERIFICATION ──────────────────────────────────────────────────

function checkImages(ROOT, changedFiles = []) {
  const universeFiles = changedFiles.filter(f => /^src\/data\/.*\.core\.json$/.test(f))
  if (universeFiles.length === 0) return null

  const issues = []

  function checkUrl(url) {
    if (!url) return false
    try {
      const r = execSync(
        `curl -s -o /dev/null -w "%{http_code}" "${url}"`,
        { encoding: 'utf8', timeout: 10000 }
      )
      return r.trim() === '200'
    } catch { return false }
  }

  for (const f of universeFiles) {
    const fname = basename(f)
    try {
      const d = JSON.parse(readFileSync(join(ROOT, f), 'utf8'))
      const slug = fname.replace('.core.json', '')

      // animeImageUrl
      const aiu = d.animeImageUrl || ''
      if (aiu && !checkUrl(aiu)) {
        issues.push(`${slug}: animeImageUrl ❌ ${aiu.slice(-40)}`)
      }

      // hero.imageUrl
      const hiu = d.hero?.imageUrl || ''
      if (hiu && !checkUrl(hiu)) {
        issues.push(`${slug}: hero.imageUrl ❌ ${hiu.slice(-40)}`)
      }

      // character images
      for (const c of d.characters || []) {
        const url = c.imageUrl || ''
        if (!url) {
          issues.push(`${slug}/${c.name}: imageUrl MISSING`)
        } else if (!checkUrl(url)) {
          issues.push(`${slug}/${c.name}: ❌ ${url.slice(-40)}`)
        }
      }
    } catch (e) {
      issues.push(`${fname}: parse error — ${e.message.slice(0, 50)}`)
    }
  }

  if (issues.length > 0) {
    return { name: 'Image URLs', pass: false, detail: issues.slice(0, 5).join('; ') }
  }
  return { name: 'Image URLs', pass: true, detail: 'all images return HTTP 200' }
}

// ─── CATALOG IMAGE VERIFICATION ──────────────────────────────────────────

function checkCatalogImages(ROOT, changedFiles = []) {
  // Only run if catalog.js or any .core.json changed
  if (!changedFiles.some(f => f.includes('catalog.js') || /^src\/data\/.*\.core\.json$/.test(f))) {
    return null
  }

  const issues = []
  const newUniverses = ['blue-lock', 'black-clover', 're-zero', 'sword-art-online',
    'tokyo-revengers', 'one-punch-man', 'spy-x-family', 'fire-force', 'parasyte']

  function checkUrl(url) {
    if (!url) return false
    const resolved = url.replace('https://myanimelist.net', 'https://cdn.myanimelist.net')
    try {
      const r = execSync(`curl -s -o /dev/null -w "%{http_code}" "${resolved}"`, { encoding: 'utf8', timeout: 10000 })
      return r.trim() === '200'
    } catch { return false }
  }

  const catalogPath = join(ROOT, 'src', 'data', 'catalog.js')
  if (!existsSync(catalogPath)) {
    return { name: 'Catalog images', pass: false, detail: 'catalog.js not found' }
  }

  const content = readFileSync(catalogPath, 'utf8')

  for (const slug of newUniverses) {
    // Find this universe's entry
    const idx = content.indexOf(`id: '${slug}'`)
    if (idx < 0) continue
    const nextIdx = content.indexOf(`id: '`, idx + 10)
    const chunk = content.slice(idx, nextIdx > 0 ? nextIdx : idx + 2000)

    const imgMatch = chunk.match(/animeImageUrl:\s*'([^']+)'/)
    if (!imgMatch) {
      issues.push(`${slug}: animeImageUrl not found in catalog`)
      continue
    }

    const imgUrl = imgMatch[1]
    if (!checkUrl(imgUrl)) {
      issues.push(`${slug}: catalog animeImageUrl ❌ ${imgUrl.slice(-40)}`)
    }

    // Also check MAL ID matches .core.json
    const malMatch = chunk.match(/malId:\s*(\d+)/)
    if (malMatch) {
      const catalogMal = malMatch[1]
      const corePath = join(ROOT, 'src', 'data', `${slug}.core.json`)
      if (existsSync(corePath)) {
        const core = JSON.parse(readFileSync(corePath, 'utf8'))
        if (String(core.malId) !== catalogMal) {
          issues.push(`${slug}: MAL ID mismatch catalog=${catalogMal} .core.json=${core.malId}`)
        }
      }
    }
  }

  if (issues.length > 0) {
    return { name: 'Catalog images', pass: false, detail: issues.slice(0, 5).join('; ') }
  }
  return { name: 'Catalog images', pass: true, detail: 'all catalog images return HTTP 200' }
}

// ─── TEMPLATE / CONTENT QUALITY ───────────────────────────────────────────

function checkContentQuality(ROOT, changedFiles = []) {
  const universeFiles = changedFiles.filter(f => /^src\/data\/.*\.core\.json$/.test(f))
  if (universeFiles.length === 0) return null

  const issues = []

  for (const f of universeFiles) {
    const fname = basename(f)
    try {
      const d = JSON.parse(readFileSync(join(ROOT, f), 'utf8'))
      const slug = fname.replace('.core.json', '')

      // Tagline must contain anime name
      const tagline = d.tagline || ''
      const animeName = d.anime?.split(' - ')[0]?.trim() || ''
      if (animeName && tagline && !tagline.includes(animeName)) {
        issues.push(`${slug}: tagline missing anime name`)
      }

      // Hero microHook ≤95
      const mh = d.hero?.microHook || ''
      if (mh.length > 95) {
        issues.push(`${slug}: microHook ${mh.length}chars (limit 95)`)
      }

      // Hero thesis ≤140
      const th = d.hero?.thesis || ''
      if (th.length > 140) {
        issues.push(`${slug}: thesis ${th.length}chars (limit 140)`)
      }

      // No "What is" systemQuestions
      for (const sq of d.systemQuestions || []) {
        if (sq.question?.startsWith('What is')) {
          issues.push(`${slug}: "What is" systemQuestion (must be Why/How does)`)
        }
      }

      // No template descriptions
      for (const c of d.characters || []) {
        const name = c.name || ''
        const desc = c.description || ''
        if (desc.startsWith(`${name} is a`) && /from\s+\w/.test(desc)) {
          issues.push(`${slug}/${name}: TEMPLATE description`)
        }
      }
    } catch (e) {
      // skip parse errors
    }
  }

  if (issues.length > 0) {
    return { name: 'Content quality', pass: false, detail: issues.slice(0, 5).join('; ') }
  }
  return { name: 'Content quality', pass: true, detail: 'no template content, correct lengths' }
}

// ─── GENERATOR OUTPUT CHECKS ─────────────────────────────────────────────

function checkFeedXml(ROOT) {
  const feedPath = join(ROOT, 'public', 'feed.xml')
  if (!existsSync(feedPath)) return { name: 'Feed XML', pass: false, detail: 'public/feed.xml missing' }
  const xml = readFileSync(feedPath, 'utf8')
  const titles = [...xml.matchAll(/<title>(.*?)<\/title>/gs)].map(m => m[1]).slice(1)
  const blanks = titles.filter(t => t.trim() === '' || t === 'Untitled')
  if (blanks.length > 0) return { name: 'Feed XML titles', pass: false, detail: `${blanks.length} blank/untitled items` }
  return { name: 'Feed XML', pass: true, detail: `${titles.length} items all titled` }
}

function checkSitemapInsights(ROOT) {
  const sitemapPath = join(ROOT, 'public', 'sitemap.xml')
  if (!existsSync(sitemapPath)) return { name: 'Sitemap', pass: false, detail: 'sitemap.xml missing' }
  const xml = readFileSync(sitemapPath, 'utf8')
  const count = (xml.match(/https:\/\/animearchive\.app\/insights\//g) || []).length
  if (count < 8) return { name: 'Sitemap insights', pass: false, detail: `only ${count} insight URLs (expected ≥8)` }
  return { name: 'Sitemap insights', pass: true, detail: `${count} insight URLs present` }
}

function checkLlms(ROOT) {
  const path = join(ROOT, 'public', 'llms.txt')
  if (!existsSync(path)) return { name: 'LLMS.txt', pass: false, detail: 'llms.txt missing' }
  const content = readFileSync(path, 'utf8')
  if (content.length < 100) return { name: 'LLMS.txt', pass: false, detail: 'suspiciously small' }
  return { name: 'LLMS.txt', pass: true, detail: `${content.length} chars` }
}

function checkSearchIndex(ROOT) {
  const path = join(ROOT, 'public', 'search-index.json')
  if (!existsSync(path)) return { name: 'Search index', pass: false, detail: 'search-index.json missing' }
  try {
    const data = JSON.parse(readFileSync(path, 'utf8'))
    if (!Array.isArray(data) || data.length < 10) return { name: 'Search index', pass: false, detail: `only ${data.length} entries` }
    return { name: 'Search index', pass: true, detail: `${data.length} entries` }
  } catch { return { name: 'Search index', pass: false, detail: 'invalid JSON' } }
}

function checkPublicFiles(ROOT, changedFiles) {
  const publicFiles = changedFiles.filter(f => f.startsWith('public/'))
  const results = []
  if (publicFiles.some(f => f === 'public/feed.xml')) results.push(checkFeedXml(ROOT))
  if (publicFiles.some(f => f === 'public/sitemap.xml')) results.push(checkSitemapInsights(ROOT))
  if (publicFiles.some(f => f === 'public/llms.txt')) results.push(checkLlms(ROOT))
  if (publicFiles.some(f => f === 'public/search-index.json')) results.push(checkSearchIndex(ROOT))
  return results
}

// ─── COMPONENT CHECKS ───────────────────────────────────────────────────

function checkComponents(ROOT, changedFiles) {
  const components = changedFiles.filter(f => /^src\/components\//.test(f))
  const results = []
  for (const comp of components) {
    const name = basename(comp, '.jsx').replace('.js', '')
    const content = readFileSync(join(ROOT, comp), 'utf8')
    if (/console\.log\(/.test(content)) results.push({ name: `Console.log: ${name}`, pass: false, detail: 'contains console.log' })
    if (/\b(TODO|FIXME|HACK)\b/.test(content)) results.push({ name: `TODO: ${name}`, pass: false, detail: 'contains TODO/FIXME' })
  }
  return results
}

// ─── PR DIFF ANALYSIS ────────────────────────────────────────────────────

async function getChangedFiles(branch) {
  try {
    const data = api(`/repos/LucielAI/anime-database/compare/Main...${branch}`)
    if (!data || !data.files) return []
    return data.files.map(f => f.filename)
  } catch { return [] }
}

function categorizeFiles(files) {
  return {
    universeFiles: files.filter(f => /^src\/data\/.*\.core\.json$/.test(f)),
    publicFiles: files.filter(f => f.startsWith('public/')),
    components: files.filter(f => /^src\/components\//.test(f)),
    generators: files.filter(f => /^scripts\/generate.*\.js$/.test(f)),
    catalogFiles: files.filter(f => f.includes('catalog.js')),
  }
}

// ─── MAIN ────────────────────────────────────────────────────────────────

async function main() {
  if (!PR_NUMBER) {
    console.error(`Usage: node catch-bugs.js <pr-number> [--repo=/path]`)
    process.exit(2)
  }

  log(`Bug Catcher v2 — PR #${PR_NUMBER} (repo: ${ROOT})`)

  let pr = api(`/repos/LucielAI/anime-database/pulls/${PR_NUMBER}`)
  if (!pr) { err(`Could not fetch PR #${PR_NUMBER}`); process.exit(2) }

  const branch = pr.head.ref
  log(`"${pr.title}" — @${pr.user.login} — \`${branch}\``)

  // Save current branch so we can return after testing
  const { out: cb } = await run('git', ['branch', '--show-current'])
  const savedBranch = cb.trim() || 'main'

  // Fetch and checkout the PR branch
  await run('git', ['fetch', 'origin', branch])
  const co = await run('git', ['checkout', '-B', branch, `origin/${branch}`])
  if (co.code !== 0) { err('Checkout failed'); process.exit(2) }

  // Install deps on PR branch
  log('Installing dependencies...')
  const inst = await run('npm', ['install', '--include=dev'])
  if (inst.code !== 0) { err('npm install failed'); await run('git', ['checkout', savedBranch]); process.exit(1) }

  // Get changed files from the PR
  const changedFiles = await getChangedFiles(branch)
  const cats = categorizeFiles(changedFiles || [])

  log(`PR changes: ${changedFiles.length} file(s) — ${changedFiles.slice(0, 4).join(', ')}${changedFiles.length > 4 ? '...' : ''}`)

  const isUniversePR = cats.universeFiles.length > 0 || cats.catalogFiles.length > 0
  const allResults = []

  // ── Pre-flight: enforcement gate (universe PRs only) ──
  if (isUniversePR) {
    log('Running enforcement gate...')
    const enforcementResult = await runEnforcementGate(ROOT)
    allResults.push(enforcementResult)
    if (!enforcementResult.pass) {
      err('ENFORCEMENT FAILED — blocking merge')
    } else {
      ok('Enforcement gate passed')
    }
  }

  // ── Always: build + test + validate ──
  log('Building...')
  const build = await run('npm', ['run', 'build'])
  const buildOk = build.code === 0
  if (buildOk) ok('build passed')
  else err('build failed')

  log('Testing...')
  const test = await run('npm', ['test'])
  const testOk = test.code === 0
  const count = test.out?.match(/(\d+) passed/)?.[1] ?? '?'
  if (testOk) ok(`tests passed (${count})`)
  else err('tests failed')

  log('Validating...')
  const validate = await run('npm', ['run', 'validate:all'])
  const validateOk = validate.code === 0
  if (validateOk) ok('validation passed')
  else err('validation failed')

  // ── Universe-file-specific checks (if universe files changed) ──
  if (cats.universeFiles.length > 0) {
    log(`Checking ${cats.universeFiles.length} universe file(s)...`)
    const r1 = checkFileIntegrity(ROOT, changedFiles)
    const r2 = checkImages(ROOT, changedFiles)
    const r3 = checkContentQuality(ROOT, changedFiles)
    const r4 = checkCatalogImages(ROOT, changedFiles)
    if (r1) allResults.push(r1)
    if (r2) allResults.push(r2)
    if (r3) allResults.push(r3)
    if (r4) allResults.push(r4)
  }

  // ── Catalog files (if catalog.js changed) ──
  if (cats.catalogFiles.length > 0) {
    log('Checking catalog.js...')
    const r = checkCatalogImages(ROOT, changedFiles)
    if (r) allResults.push(r)
  }

  // ── Generator output checks ──
  if (cats.publicFiles.some(f => f === 'public/feed.xml')) allResults.push(checkFeedXml(ROOT))
  if (cats.publicFiles.some(f => f === 'public/sitemap.xml')) allResults.push(checkSitemapInsights(ROOT))
  if (cats.publicFiles.some(f => f === 'public/llms.txt')) allResults.push(checkLlms(ROOT))
  if (cats.publicFiles.some(f => f === 'public/search-index.json')) allResults.push(checkSearchIndex(ROOT))

  // ── Component checks ──
  if (cats.components.length > 0) {
    const compResults = checkComponents(ROOT, changedFiles)
    allResults.push(...compResults)
  }

  // ── Always: core generator outputs ──
  allResults.push(checkFeedXml(ROOT))
  allResults.push(checkSitemapInsights(ROOT))

  // ── Build summary ──
  const results = allResults.filter(Boolean)
  const failed = results.filter(r => !r.pass)
  const passed = results.filter(r => r.pass)

  const checks = [
    { name: 'Build',      pass: buildOk },
    { name: 'Tests',      pass: testOk },
    { name: 'Validate',   pass: validateOk },
    ...results.map(r => ({ name: r.name, pass: r.pass, detail: r.detail })),
  ]
  const allPass = checks.every(c => c.pass)

  const prFindings = failed.filter(r => !['Build', 'Tests', 'Validate'].includes(r.name))
  const severity = prFindings.length > 0
    ? '❌ BLOCKED — do not merge'
    : '✅ Ready for review'

  const body = [
    `## 🔍 Bug Catcher v2 — PR #${PR_NUMBER}`,
    ``,
    `**Branch:** \`${branch}\`  **Author:** @${pr.user.login}`,
    ``,
    `| Check | Result |`,
    `|---|---|`,
    ...checks.map(c => `| ${c.name} | ${c.pass ? '✅ PASS' : '❌ FAIL'}${!c.pass && c.detail ? ` — ${c.detail}` : ''} |`),
    ``,
    prFindings.length > 0
      ? `**${prFindings.length} issue(s) — ${severity}**\n${prFindings.map(r => `- \`${r.name}\`: ${r.detail}`).join('\n')}`
      : `**All checks passed — ${severity}**`,
  ].filter(Boolean).join('\n')

  // Return to original branch
  await run('git', ['checkout', savedBranch])

  try {
    execSync(
      `curl -s -X POST "https://api.github.com/repos/LucielAI/anime-database/issues/${PR_NUMBER}/comments" ` +
      `-H "Authorization: Bearer ${TOKEN}" -H "Content-Type: application/json" ` +
      `-d ${JSON.stringify({ body })}`,
      { encoding: 'utf8' }
    )
    log('Comment posted to PR')
  } catch (e) { /* ignore */ }

  const summary = allPass
    ? `✅ All ${checks.length} checks passed`
    : `❌ ${failed.length}/${checks.length} failed`

  log(summary)
  if (failed.length > 0) failed.forEach(r => err(`${r.name}: ${r.detail}`))

  process.exit(allPass ? 0 : 1)
}

main().catch(e => { console.error(e); process.exit(1) })
