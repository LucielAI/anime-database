/**
 * Vercel serverless function — serves static HTML for homepage + universe routes.
 * Falls through to the SPA for all other routes.
 */
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(process.cwd(), 'public');

function serveFile(filePath, contentType) {
  if (!fs.existsSync(filePath)) {
    return false;
  }
  const html = fs.readFileSync(filePath, 'utf8');
  return { html, contentType };
}

function route(req) {
  const urlPath = (req.url || '').split('?')[0].replace(/\/$/, '');

  // Homepage
  if (urlPath === '' || urlPath === '/') {
    return serveFile(path.join(PUBLIC_DIR, 'index.html'), 'text/html; charset=utf-8');
  }

  // Universe pages: /universe/{slug}
  const universeMatch = urlPath.match(/^\/universe\/([^/]+)$/);
  if (universeMatch) {
    const slug = universeMatch[1];
    const filePath = path.join(PUBLIC_DIR, 'universe', slug, 'index.html');
    // Security: ensure path is within public/universe/
    if (!filePath.startsWith(path.join(PUBLIC_DIR, 'universe'))) {
      return { status: 403, body: 'Forbidden' };
    }
    return serveFile(filePath, 'text/html; charset=utf-8');
  }

  // Character pages within universe: /universe/{slug}/character/{id}
  const charMatch = urlPath.match(/^\/universe\/([^/]+)\/character\/(\d+)$/);
  if (charMatch) {
    const slug = charMatch[1];
    const filePath = path.join(PUBLIC_DIR, 'universe', slug, 'index.html');
    if (!filePath.startsWith(path.join(PUBLIC_DIR, 'universe'))) {
      return { status: 403, body: 'Forbidden' };
    }
    return serveFile(filePath, 'text/html; charset=utf-8');
  }

  return false; // Let the SPA handle it
}

module.exports = (req, res) => {
  const result = route(req);

  if (!result) {
    // Not handled — let the default SPA handler take over
    // Return 404 to let Vercel's default routing handle it
    res.status(404).send('Not a static route');
    return;
  }

  if (result.status === 403) {
    res.status(403).send(result.body);
    return;
  }

  res.setHeader('Content-Type', result.contentType);
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  res.setHeader('X-Robots-Tag', 'index, follow');
  return res.send(result.html);
};
