/* global process */
import { spawnSync } from 'node:child_process'

const args = process.argv.slice(2)

const addResult = spawnSync('node', ['scripts/addUniverse.js', ...args], { stdio: 'inherit' })
if (addResult.status !== 0) {
  process.exit(addResult.status ?? 1)
}

const sitemapResult = spawnSync('node', ['scripts/generateSitemap.js'], { stdio: 'inherit' })
if (sitemapResult.status !== 0) {
  process.exit(sitemapResult.status ?? 1)
}
