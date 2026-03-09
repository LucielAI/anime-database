export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Content-Length guard
  const contentLength = parseInt(req.headers['content-length'] || '0', 10)
  if (contentLength > 1024) {
    return res.status(413).json({ error: 'Too large' })
  }

  const { animeName } = req.body || {}

  if (!animeName || typeof animeName !== 'string') {
    return res.status(400).json({ error: 'Invalid name' })
  }

  const sanitized = animeName.trim().slice(0, 100)
  if (sanitized.length === 0) {
    return res.status(400).json({ error: 'Empty name' })
  }

  // Reject HTML/script injection
  if (/<|>|script/i.test(sanitized)) {
    return res.status(400).json({ error: 'Invalid characters' })
  }

  const SUPABASE_URL = process.env.SUPABASE_URL
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Server misconfigured' })
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        anime_name: sanitized,
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
