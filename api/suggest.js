/* eslint-env node */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const contentLength = parseInt(req.headers['content-length'] || '0', 10)
  if (contentLength > 2048) {
    return res.status(413).json({ error: 'Too large' })
  }

  const { animeName, source } = req.body || {}

  if (!animeName || typeof animeName !== 'string') {
    return res.status(400).json({ error: 'Invalid name' })
  }

  const sanitized = animeName.trim().slice(0, 100)
  const sanitizedSource = typeof source === 'string' ? source.trim().slice(0, 32) : 'unknown'

  if (sanitized.length === 0) {
    return res.status(400).json({ error: 'Empty name' })
  }

  if (/<|>|script/i.test(sanitized) || /<|>|script/i.test(sanitizedSource)) {
    return res.status(400).json({ error: 'Invalid characters' })
  }

  const SUPABASE_URL = process.env.SUPABASE_URL
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(503).json({ error: 'Suggestion system offline' })
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/archive_suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        anime_name: sanitized,
        source: sanitizedSource,
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
