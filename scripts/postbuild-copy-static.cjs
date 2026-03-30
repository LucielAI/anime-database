#!/usr/bin/env node
/**
 * Post-build step: copy pre-generated static SEO HTML files into dist/
 * so Vercel serves them as static files at /universe/{slug}/
 *
 * Also injects the Vite JS/CSS bundle into each universe's static HTML so
 * the SPA boots correctly on hard refresh (not just SPA navigation).
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

/**
 * Find the Vite entry JS file in dist/assets/ (pattern: index-*.js).
 * Returns just the filename, e.g. "index-1gZeFGPN.js"
 */
function findEntryJs() {
  const assetsDir = path.join(DIST_DIR, 'assets');
  if (!fs.existsSync(assetsDir)) return null;
  const files = fs.readdirSync(assetsDir);
  const match = files.find(f => /^index-[A-Za-z0-9_-]+\.js$/.test(f) && !f.endsWith('.map'));
  return match || null;
}

/**
 * Find the Vite entry CSS file in dist/assets/ (pattern: index-*.css).
 * Returns just the filename, e.g. "index-BOAfeqyh.css"
 */
function findEntryCss() {
  const assetsDir = path.join(DIST_DIR, 'assets');
  if (!fs.existsSync(assetsDir)) return null;
  const files = fs.readdirSync(assetsDir);
  const match = files.find(f => /^index-[A-Za-z0-9_-]+\.css$/.test(f));
  return match || null;
}

/**
 * Inject Vite JS and CSS bundle tags before </body> in an HTML string.
 * Preserves all existing meta tags (og:title, og:image, etc.) from generate-static-seo.py.
 */
function injectBundleIntoHtml(html) {
  const jsFile = findEntryJs();
  const cssFile = findEntryCss();

  if (!jsFile) {
    console.warn('  [postbuild] Could not find Vite entry JS (index-*.js) in dist/assets/ — skipping injection');
    return html;
  }

  const cssTag = cssFile
    ? `    <link rel="stylesheet" crossorigin href="/assets/${cssFile}">\n`
    : '';
  const jsTag = `    <script type="module" crossorigin src="/assets/${jsFile}"></script>\n`;

  // Inject before </body>
  const closingBody = '</body>';
  if (!html.includes(closingBody)) {
    console.warn('  [postbuild] No </body> found in HTML — appending bundle tags at end');
    return html + '\n' + cssTag + jsTag;
  }

  return html.replace(closingBody, cssTag + jsTag + closingBody);
}

/**
 * Apply bundle injection to all universe index.html files in dist/universe/.
 */
function injectUniverseBundles() {
  const universeDir = path.join(DIST_DIR, 'universe');
  if (!fs.existsSync(universeDir)) {
    console.log('  [postbuild] dist/universe/ does not exist — skipping bundle injection');
    return;
  }

  const slugs = fs.readdirSync(universeDir);
  if (slugs.length === 0) {
    console.log('  [postbuild] No universe directories found — skipping bundle injection');
    return;
  }

  const jsFile = findEntryJs();
  const cssFile = findEntryCss();
  console.log(`  [postbuild] Injecting bundle — JS: ${jsFile || 'NOT FOUND'}, CSS: ${cssFile || 'NOT FOUND'}`);

  let injected = 0;
  for (const slug of slugs) {
    const indexPath = path.join(universeDir, slug, 'index.html');
    if (!fs.existsSync(indexPath)) continue;

    const original = fs.readFileSync(indexPath, 'utf8');
    const updated = injectBundleIntoHtml(original);

    if (updated !== original) {
      fs.writeFileSync(indexPath, updated, 'utf8');
      injected++;
      console.log(`  [postbuild] Injected bundle into /universe/${slug}/index.html`);
    }
  }
  console.log(`  [postbuild] Bundle injection complete — ${injected} file(s) updated`);
}

function main() {
  console.log('[postbuild] Copying static SEO HTML files to dist/...');

  // Copy all static HTML directories to dist/
  // Only universe pages and blog posts are pre-rendered.
  // SPA-only routes (/universes, /about, /compare, /privacy) are NOT pre-rendered
  // to avoid content mismatch on refresh.
  const staticDirs = ['universe', 'blog']
  for (const dir of staticDirs) {
    const src = path.join(PUBLIC_DIR, dir)
    const dst = path.join(DIST_DIR, dir)
    if (fs.existsSync(src)) {
      copyDir(src, dst)
    }
  }

  // Inject Vite JS/CSS bundle into each universe's index.html so the SPA boots
  // on hard refresh (not just SPA navigation). Static SEO meta tags (og:title,
  // og:image, twitter:card, etc.) from generate-static-seo.py are preserved.
  injectUniverseBundles();

  // NOTE: Universe index.html files are kept in dist/universe/ so Vercel serves
  // them directly to social crawlers (Twitter, Facebook) that don't execute JS.
  // Real users get the SPA via vercel.json rewrite, with client-side React
  // updating meta tags dynamically. Static HTML shells carry correct og:title,
  // og:image, twitter:card for crawlers. The injected JS bundle ensures the
  // SPA shell also boots correctly when the static file is served directly.

  console.log('[postbuild] Done — universe static HTML deployed.');
}

main();
