const fs = require('fs');
const path = require('path');

// Read pre-generated static HTML from public/ directory
// Vercel serves public/ at the deployment root
const PUBLIC_DIR = path.join(process.cwd(), 'public');

module.exports = (req, res) => {
  // Extract slug from /universe/{slug}
  // req.url = "/universe/one-punch-man" (with possible trailing slash or query)
  const urlPath = req.url.split('?')[0].replace(/\/$/, '');
  const match = urlPath.match(/^\/universe\/([^/]+)$/);

  if (!match) {
    // Not a universe route — let the SPA handle it
    return res.status(404).send('Not a universe route');
  }

  const slug = match[1].replace(/[^a-z0-9-]/g, '-').toLowerCase();
  const filePath = path.join(PUBLIC_DIR, 'universe', slug, 'index.html');

  // Security: ensure path is within public/universe/
  if (!filePath.startsWith(path.join(PUBLIC_DIR, 'universe'))) {
    return res.status(403).send('Forbidden');
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).send(`Universe not found: ${slug}`);
  }

  const html = fs.readFileSync(filePath, 'utf8');

  // Key headers for social crawler indexing
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  res.setHeader('X-Robots-Tag', 'index, follow');

  return res.send(html);
};
