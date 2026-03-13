/* eslint-env node */

function safeBody(req) {
  if (!req.body) return {}
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body)
    } catch {
      return {}
    }
  }
  return req.body
}

async function insertSuggestion({ supabaseUrl, supabaseKey, payload }) {
  const baseHeaders = {
    'Content-Type': 'application/json',
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    Prefer: 'return=minimal'
  }

  const primary = await fetch(`${supabaseUrl}/rest/v1/archive_suggestions`, {
    method: 'POST',
    headers: baseHeaders,
    body: JSON.stringify(payload)
  })

  if (primary.ok) return primary

  const fallbackPayload = {
    anime_name: payload.anime_name,
    created_at: payload.created_at
  }

  const fallback = await fetch(`${supabaseUrl}/rest/v1/archive_suggestions`, {
    method: 'POST',
    headers: baseHeaders,
    body: JSON.stringify(fallbackPayload)
  })

  return fallback
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const contentLength = parseInt(req.headers['content-length'] || '0', 10)
  if (contentLength > 4096) {
    return res.status(413).json({ error: 'Too large' })
  }

  const body = safeBody(req)
  const { animeName, source } = body

  if (!animeName || typeof animeName !== 'string' || animeName.length > 100) {
    return res.status(400).json({ error: 'Invalid animeName' })
  }

  const sanitized = animeName.trim().replace(/\s+/g, ' ')
  if (!sanitized || /<|>|script/i.test(sanitized)) {
    return res.status(400).json({ error: 'Invalid characters' })
  }

  const sanitizedSource = typeof source === 'string' ? source.trim().slice(0, 64) : 'direct'

  const SUPABASE_URL = process.env.SUPABASE_URL
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('[api/suggest] missing Supabase env vars')
    return res.status(503).json({ error: 'Suggestion system offline' })
  }

  try {
    const response = await insertSuggestion({
      supabaseUrl: SUPABASE_URL,
      supabaseKey: SUPABASE_KEY,
      payload: {
        anime_name: sanitized,
        source: sanitizedSource,
        created_at: new Date().toISOString()
      }
    })

    if (!response.ok) {
      const details = await response.text()
      console.error('[api/suggest] storage failed', { status: response.status, details })
      return res.status(500).json({ error: 'Storage failed' })
    }

    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('[api/suggest] unexpected failure', error)
    return res.status(500).json({ error: 'Storage failed' })
  }
}
