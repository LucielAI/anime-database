/**
 * generateStaticHtml.js
 *
 * REGRESSION GUARD — This script ensures no pre-rendered HTML files exist for
 * SPA-owned routes. Pre-rendered HTML for app routes (universe pages, blog posts)
 * creates a content mismatch: Vercel serves the static file first (simplified preview),
 * then React hydrates and renders the full interactive experience → visible flash/swap.
 *
 * Architecture: One route = one renderer = one UX.
 * - SPA (React Router) owns ALL app routes. No pre-rendered HTML for these.
 * - Truly static assets (RSS, sitemap, manifest, blog data JSON) are fine.
 *
 * This script runs after generateBlogIndex.js during build. It validates that no
 * pre-rendered HTML exists for SPA-owned routes and removes any that are found.
 *
 * Run: node scripts/generateStaticHtml.js
 */

import { readdirSync, rmSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const PUBLIC_DIR = join(ROOT, 'public')

// Routes owned by the SPA — must NOT have pre-rendered HTML files
const SPA_OWNED_PREFIXES = [
  'universe/',
  'blog/',
  'universes/',
  'about/',
  'compare/',
  'privacy/',
]

// Files that should NEVER be deleted (truly static assets)
const PROTECTED_FILES = new Set([
  'blog-index.json',
  'sitemap.xml',
  'feed.xml',
  'llms.txt',
  'robots.txt',
  'manifest.json',
  'sw.js',
  'search-index.json',
  'og-fallback.png',
  'favicon.svg',
])

function validatePublicDir() {
  let violations = 0

  for (const prefix of SPA_OWNED_PREFIXES) {
    const parentDir = join(PUBLIC_DIR, prefix.split('/')[0])
    if (!existsSync(parentDir)) continue

    const checkDir = join(PUBLIC_DIR, prefix.replace('/', ''))
    if (!existsSync(checkDir)) continue

    const found = findIndexHtml(checkDir)
    if (found.length > 0) {
      console.error(`[static-html] VIOLATION: Found pre-rendered HTML in SPA-owned path: ${prefix}`)
      for (const f of found) {
        console.error(`  Removing: ${f}`)
        rmSync(f)
        violations++
      }
    }
  }

  return violations
}

function findIndexHtml(dir) {
  const results = []
  if (!existsSync(dir)) return results
  const entries = readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...findIndexHtml(full))
    } else if (entry.name === 'index.html') {
      results.push(full)
    }
  }
  return results
}

async function generate() {
  console.log('[static-html] Running SPA route ownership validation...')

  const violations = validatePublicDir()

  if (violations > 0) {
    console.error(`[static-html] FATAL: ${violations} pre-rendered HTML file(s) found for SPA-owned routes.`)
    console.error('[static-html] These cause content mismatch on hard refresh (static HTML vs React hydration).')
    console.error('[static-html] They have been removed. Rebuild to regenerate correct output.')
    process.exit(1)
  }

  console.log('[static-html] PASS: No pre-rendered HTML found for SPA-owned routes.')
  console.log('[static-html] All app routes are SPA-controlled. Consistent experience on refresh and navigation.')
}

generate().catch(e => {
  console.error('[static-html] Fatal:', e)
  process.exit(1)
})
