#!/usr/bin/env node
/**
 * Post-build step: copy pre-generated static SEO HTML files into dist/
 * so Vercel serves them as static files at /universe/{slug}/
 *
 * Only universe pages get static HTML — homepage stays as the Vite-generated
 * SPA shell (React handles meta injection client-side).
 */
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');

function copyDir(src, dst) {
  if (!fs.existsSync(src)) {
    console.log(`  [postbuild] Source dir not found: ${src} — skipping`);
    return;
  }
  fs.mkdirSync(dst, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  let count = 0;
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, dstPath);
      count++;
    } else {
      fs.copyFileSync(srcPath, dstPath);
      count++;
    }
  }
  console.log(`  [postbuild] Copied ${count} files from ${src} → ${dst}`);
}

function main() {
  console.log('[postbuild] Copying static SEO HTML files to dist/...');

  // Copy public/universe/ → dist/universe/ (for /universe/{slug}/ static serving)
  // NOTE: homepage (public/index.html) is NOT copied — it stays as the Vite SPA shell
  const srcUniverse = path.join(PUBLIC_DIR, 'universe');
  const dstUniverse = path.join(DIST_DIR, 'universe');
  copyDir(srcUniverse, dstUniverse);

  // NOTE: Universe index.html files are kept in dist/universe/ so Vercel serves
  // them directly to social crawlers (Twitter, Facebook) that don't execute JS.
  // Real users get the SPA via vercel.json rewrite, with client-side React
  // updating meta tags dynamically. Static HTML shells carry correct og:title,
  // og:image, twitter:card for crawlers.

  console.log('[postbuild] Done — universe static HTML deployed.');
}

main();
