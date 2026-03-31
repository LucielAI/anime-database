
const SUPABASE_URL_VARS = ['SUPABASE_URL']
const SUPABASE_PUBLIC_KEY_VARS = [
  'SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_ANON_KEY'
]

function pickFirstEnv(names) {
  for (const name of names) {
    const value = process.env[name]
    if (typeof value === 'string' && value.trim()) {
      return { name, value: value.trim() }
    }
  }
  return null
}

export function resolveSupabaseConfig() {
  const url = pickFirstEnv(SUPABASE_URL_VARS)
  const key = pickFirstEnv(SUPABASE_PUBLIC_KEY_VARS)

  return {
    url,
    key,
    missing: {
      url: !url,
      key: !key
    }
  }
}

export async function parseSupabaseError(response) {
  const raw = await response.text()
  if (!raw) return { raw: '', parsed: null }

  try {
    return { raw, parsed: JSON.parse(raw) }
  } catch {
    return { raw, parsed: null }
  }
}

export function classifySupabaseFailure({ status, parsedError, rawError }) {
  const code = parsedError?.code || ''
  const message = parsedError?.message || rawError || ''

  if (status === 401) return 'auth_failed'
  if (status === 403) return 'rls_denied'
  if (status === 404 || code === '42P01') return 'table_missing'
  if (status === 429) return 'rate_limited'

  if (status === 400) {
    if (code === '42703' || code === 'PGRST204' || code === 'PGRST205') {
      return 'schema_mismatch'
    }
    return 'invalid_payload'
  }

  if (status >= 500) return 'supabase_unavailable'

  if (/relation .* does not exist/i.test(message)) return 'table_missing'
  if (/row-level security|permission denied/i.test(message)) return 'rls_denied'

  return 'unknown'
}

export function mapFailureToHttpStatus(category) {
  switch (category) {
    case 'auth_failed':
    case 'rls_denied':
      return 403
    case 'table_missing':
    case 'schema_mismatch':
      return 500
    case 'rate_limited':
      return 503
    case 'invalid_payload':
      return 400
    case 'supabase_unavailable':
      return 503
    default:
      return 500
  }
}
