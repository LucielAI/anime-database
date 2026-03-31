/**
 * generateBlogIndex.js
 * Reads all JSON files from content/blog/, generates:
 *   - public/blog-index.json  (metadata only, for listing page)
 *   - public/blog/data/<slug>.json (full post, for lazy loading)
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const BLOG_CONTENT_DIR = join(ROOT, 'content', 'blog')
const PUBLIC_BLOG_DIR = join(ROOT, 'public', 'blog', 'data')
const BLOG_INDEX_OUT = join(ROOT, 'public', 'blog-index.json')

// Ensure output directory exists
mkdirSync(PUBLIC_BLOG_DIR, { recursive: true })

// Read all JSON files from content/blog/
let files
try {
  files = readdirSync(BLOG_CONTENT_DIR).filter((f) => f.endsWith('.json'))
} catch (err) {
  console.error(`[blog] Could not read ${BLOG_CONTENT_DIR}:`, err.message)
  process.exit(1)
}

if (files.length === 0) {
  console.warn('[blog] No blog post JSON files found in content/blog/. Generating empty index.')
  writeFileSync(BLOG_INDEX_OUT, JSON.stringify({ posts: [], generatedAt: new Date().toISOString() }, null, 2))
  process.exit(0)
}

const index = []

for (const file of files) {
  const filePath = join(BLOG_CONTENT_DIR, file)
  let post

  try {
    const raw = readFileSync(filePath, 'utf-8')
    post = JSON.parse(raw)
  } catch (err) {
    console.error(`[blog] Failed to parse ${file}:`, err.message)
    continue
  }

  // Validate required fields
  const required = ['slug', 'title', 'date', 'description']
  const missing = required.filter((k) => !post[k])
  if (missing.length > 0) {
    console.warn(`[blog] Skipping ${file} — missing fields: ${missing.join(', ')}`)
    continue
  }

  // Write full post to public/blog/data/<slug>.json
  const outPath = join(PUBLIC_BLOG_DIR, `${post.slug}.json`)
  writeFileSync(outPath, JSON.stringify(post, null, 2))
  console.log(`[blog] Wrote ${outPath}`)

  // Add metadata-only entry to index
  index.push({
    slug: post.slug,
    title: post.title,
    date: post.date,
    description: post.description,
    keywords: post.keywords || '',
    author: post.author || 'Archive Intelligence',
  })
}

// Sort by date descending (newest first)
index.sort((a, b) => {
  const da = new Date(a.date)
  const db = new Date(b.date)
  if (db - da !== 0) return db - da
  return a.title.localeCompare(b.title)
})

const blogIndex = {
  posts: index,
  generatedAt: new Date().toISOString(),
}

writeFileSync(BLOG_INDEX_OUT, JSON.stringify(blogIndex, null, 2))
console.log(`[blog] Wrote blog-index.json with ${index.length} post(s)`)
