export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Content-Length guard
  const contentLength = parseInt(req.headers['content-length'] || '0', 10)
  if (contentLength > 1024) {
    return res.status(413).json({ error: 'Too large' })
  }

  const { slug, vote } = req.body || {}

  // Validate slug
  if (!slug || typeof slug !== 'string' || slug.length > 50) {
    return res.status(400).json({ error: 'Invalid slug' })
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return res.status(400).json({ error: 'Malformed slug' })
  }

  // Validate vote
  if (!['up', 'down', 'needs-data'].includes(vote)) {
    return res.status(400).json({ error: 'Invalid vote' })
  }

  const SUPABASE_URL = process.env.SUPABASE_URL
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Server misconfigured' })
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        page_slug: slug,
        vote_type: vote,
        created_at: new Date().toISOString()
      })
    })

    if (!response.ok) {
      return res.status(500).json({ error: 'Storage failed' })
    }

    return res.status(200).json({ ok: true })
  } catch {
    return res.status(500).json({ error: 'Storage failed' })
  }
}
