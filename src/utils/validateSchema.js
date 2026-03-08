const REQUIRED_TOP_LEVEL = [
  'anime', 'tagline', 'malId', 'themeColors', 'visualizationHint',
  'powerSystem', 'characters', 'factions', 'rules', 'rankings'
]

const REQUIRED_CHARACTER_FIELDS = [
  'name', 'title', 'rank', 'dangerLevel', 'loreBio', 'systemBio',
  'gradientFrom', 'gradientTo', 'accentColor', 'icon'
]

const REQUIRED_THEME_FIELDS = [
  'primary', 'secondary', 'accent', 'glow', 'tabActive',
  'badgeBg', 'badgeText', 'modeGlow', 'heroGradient'
]

const VALID_VISUALIZATION_HINTS = [
  'timeline', 'node-graph', 'counter-tree', 'affinity-matrix', 'standard-cards'
]

export function validateAnimePayload(data) {
  const warnings = []
  const anime = data?.anime || 'Unknown'

  REQUIRED_TOP_LEVEL.forEach(field => {
    if (!data[field]) warnings.push(`[${anime}] Missing required field: ${field}`)
  })

  if (data.themeColors) {
    REQUIRED_THEME_FIELDS.forEach(field => {
      if (!data.themeColors[field]) warnings.push(`[${anime}] themeColors missing: ${field}`)
    })
  }

  if (data.visualizationHint && !VALID_VISUALIZATION_HINTS.includes(data.visualizationHint)) {
    warnings.push(`[${anime}] Unknown visualizationHint: "${data.visualizationHint}". Valid: ${VALID_VISUALIZATION_HINTS.join(', ')}`)
  }

  if (Array.isArray(data.characters)) {
    if (data.characters.length !== 6) warnings.push(`[${anime}] Expected 6 characters, got ${data.characters.length}`)
    data.characters.forEach((char, i) => {
      REQUIRED_CHARACTER_FIELDS.forEach(field => {
        if (!char[field]) warnings.push(`[${anime}] Character[${i}] (${char.name || 'unnamed'}) missing: ${field}`)
      })
    })
  }

  if (Array.isArray(data.powerSystem) && data.powerSystem.length !== 4) {
    warnings.push(`[${anime}] Expected 4 powerSystem items, got ${data.powerSystem.length}`)
  }

  if (Array.isArray(data.rules) && data.rules.length !== 3) {
    warnings.push(`[${anime}] Expected 3 rules, got ${data.rules.length}`)
  }

  if (warnings.length > 0) {
    console.group(`%c[ARCHIVE SCHEMA] Warnings for "${anime}"`, 'color: #f59e0b; font-weight: bold;')
    warnings.forEach(w => console.warn(w))
    console.groupEnd()
  } else {
    console.log(`%c[ARCHIVE SCHEMA] "${anime}" payload validated ✓`, 'color: #10b981;')
  }

  return warnings
}
