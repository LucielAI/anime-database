import { randomUUID } from 'node:crypto'
import { resolveSupabaseConfig, classifySupabaseFailure, parseSupabaseError } from './_supabase.js'

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

export default async function handler(req, res) {
  const requestId = randomUUID()
  res.setHeader('x-request-id', requestId)

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', requestId })
  }

  const contentLength = parseInt(req.headers['content-length'] || '0', 10)
  if (contentLength > 1024) {
    return res.status(413).json({ error: 'Too large', requestId })
  }

  const body = safeBody(req)
  const { email } = body

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

  const normalizedEmail = typeof email === 'string'
    ? email.trim().replace(/[\x00-\x1F\x7F]/g, '').toLowerCase()
    : ''

  if (!normalizedEmail || !EMAIL_RE.test(normalizedEmail) || normalizedEmail.length > 254) {
    return res.status(400).json({ error: 'Invalid email', requestId })
  }

  const supabase = resolveSupabaseConfig()

  if (!supabase.url || !supabase.key) {
    console.error('[api/newsletter] missing Supabase env vars', {
      requestId,
      missingUrl: supabase.missing.url,
      missingKey: supabase.missing.key,
    })
    return res.status(503).json({ error: 'Newsletter temporarily unavailable', requestId })
  }

  try {
    const response = await fetch(`${supabase.url.value}/rest/v1/archive_newsletter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabase.key.value,
        Authorization: `Bearer ${supabase.key.value}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        email: normalizedEmail,
        source: 'web',
        created_at: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      const { parsed, raw } = await parseSupabaseError(response)
      const category = classifySupabaseFailure({
        status: response.status,
        parsedError: parsed,
        rawError: raw,
      })

      // Duplicate email (unique constraint violation) — treat as success
      if (parsed?.code === '23505') {
        return res.status(200).json({ ok: true, message: 'Already subscribed', requestId })
      }

      console.error('[api/newsletter] storage failed', {
        requestId,
        status: response.status,
        category,
        error: parsed || raw,
      })

      return res.status(502).json({ error: 'Signup failed, please try again later', requestId })
    }

    return res.status(200).json({ ok: true, requestId })
  } catch (error) {
    console.error('[api/newsletter] unexpected failure', {
      requestId,
      name: error?.name,
      message: error?.message,
    })
    return res.status(502).json({ error: 'Signup failed, please try again later', requestId })
  }
}
