/**
 * Vercel serverless function — serves pre-generated static HTML for universe routes.
 * All other routes fall through to the SPA via vercel.json catch-all rewrite.
 */
const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.cwd();

function serveFile(filePath, contentType) {
  if (!fs.existsSync(filePath)) {
    return false;
  }
  const html = fs.readFileSync(filePath, 'utf8');
  return { html, contentType };
}

function route(req) {
  const urlPath = (req.url || '').split('?')[0].replace(/\/$/, '');

  // Universe pages: /universe/{slug}
  const universeMatch = urlPath.match(/^\/universe\/([^/]+)$/);
  if (universeMatch) {
    const slug = universeMatch[1];
    const filePath = path.join(ROOT_DIR, 'dist', 'universe', slug, 'index.html');
    if (!filePath.startsWith(path.join(ROOT_DIR, 'dist', 'universe'))) {
      return { status: 403, body: 'Forbidden' };
    }
    return serveFile(filePath, 'text/html; charset=utf-8');
  }

  // Character pages within universe: /universe/{slug}/character/{id}
  const charMatch = urlPath.match(/^\/universe\/([^/]+)\/character\/(\d+)$/);
  if (charMatch) {
    const slug = charMatch[1];
    const filePath = path.join(ROOT_DIR, 'dist', 'universe', slug, 'index.html');
    if (!filePath.startsWith(path.join(ROOT_DIR, 'dist', 'universe'))) {
      return { status: 403, body: 'Forbidden' };
    }
    return serveFile(filePath, 'text/html; charset=utf-8');
  }

  return false;
}

module.exports = (req, res) => {
  const result = route(req);

  if (!result) {
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
