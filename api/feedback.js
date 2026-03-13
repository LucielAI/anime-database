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

async function insertFeedback({ supabaseUrl, supabaseKey, payload }) {
  const baseHeaders = {
    'Content-Type': 'application/json',
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    Prefer: 'return=minimal'
  }

  const primary = await fetch(`${supabaseUrl}/rest/v1/archive_feedback`, {
    method: 'POST',
    headers: baseHeaders,
    body: JSON.stringify(payload)
  })

  if (primary.ok) return primary

  const fallbackPayload = {
    page_slug: payload.page_slug,
    vote_type: payload.vote_type,
    created_at: payload.created_at
  }

  return fetch(`${supabaseUrl}/rest/v1/archive_feedback`, {
    method: 'POST',
    headers: baseHeaders,
    body: JSON.stringify(fallbackPayload)
  })
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
  const { slug, vote, note, context } = body

  if (!slug || typeof slug !== 'string' || slug.length > 50) {
    return res.status(400).json({ error: 'Invalid slug' })
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return res.status(400).json({ error: 'Malformed slug' })
  }

  if (!['helpful', 'unhelpful', 'needs_data'].includes(vote)) {
    return res.status(400).json({ error: 'Invalid vote' })
  }

  const sanitizedNote = typeof note === 'string' ? note.trim().slice(0, 280) : null
  const sanitizedContext = typeof context === 'string' ? context.trim().slice(0, 80) : null

  if ((sanitizedNote && /<|>|script/i.test(sanitizedNote)) || (sanitizedContext && /<|>|script/i.test(sanitizedContext))) {
    return res.status(400).json({ error: 'Invalid characters' })
  }

  const SUPABASE_URL = process.env.SUPABASE_URL
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('[api/feedback] missing Supabase env vars')
    return res.status(503).json({ error: 'Feedback system offline' })
  }

  try {
    const response = await insertFeedback({
      supabaseUrl: SUPABASE_URL,
      supabaseKey: SUPABASE_KEY,
      payload: {
        page_slug: slug,
        vote_type: vote,
        note: sanitizedNote,
        context: sanitizedContext,
        created_at: new Date().toISOString()
      }
    })

    if (!response.ok) {
      const details = await response.text()
      console.error('[api/feedback] storage failed', { status: response.status, details })
      return res.status(500).json({ error: 'Storage failed' })
    }

    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('[api/feedback] unexpected failure', error)
    return res.status(500).json({ error: 'Storage failed' })
  }
}
