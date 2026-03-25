#!/usr/bin/env node
/**
 * Post-build step: copy pre-generated static SEO HTML files into dist/
 * so Vercel serves them as static files at / and /universe/{slug}/
 *
 * Vite build generates dist/index.html (SPA shell). This script replaces
 * it with the pre-generated static SEO HTML that has correct meta/schema.
 * Also copies public/universe/ → dist/universe/ for universe route serving.
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

  // Copy public/index.html → dist/index.html (replaces Vite's SPA shell)
  const srcHome = path.join(PUBLIC_DIR, 'index.html');
  const dstHome = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(srcHome)) {
    fs.copyFileSync(srcHome, dstHome);
    const size = fs.statSync(dstHome).size;
    console.log(`  [postbuild] Copied homepage: ${size} bytes`);
  } else {
    console.log(`  [postbuild] WARNING: ${srcHome} not found — skipping homepage`);
  }

  // Copy public/universe/ → dist/universe/ (for /universe/{slug}/ static serving)
  const srcUniverse = path.join(PUBLIC_DIR, 'universe');
  const dstUniverse = path.join(DIST_DIR, 'universe');
  copyDir(srcUniverse, dstUniverse);

  console.log('[postbuild] Done — static SEO HTML deployed.');
}

main();
