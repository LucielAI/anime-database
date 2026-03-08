const REQUIRED_TOP_LEVEL = [
  'anime', 'tagline', 'malId', 'themeColors', 'visualizationHint',
  'visualizationReason', 'powerSystem', 'characters', 'factions', 'rules', 'rankings'
]

const REQUIRED_CHARACTER_FIELDS = [
  'name', 'title', 'rank', 'dangerLevel', 'loreBio', 'systemBio',
  'gradientFrom', 'gradientTo', 'accentColor', 'icon', 'signatureMoment', 'imageUrl'
]

const REQUIRED_THEME_FIELDS = [
  'primary', 'secondary', 'accent', 'glow', 'tabActive',
  'badgeBg', 'badgeText', 'modeGlow', 'heroGradient'
]

const VALID_HINTS = ['timeline', 'node-graph', 'counter-tree', 'affinity-matrix', 'standard-cards']
const VALID_REL_TYPES = ['ally', 'enemy', 'rival', 'mentor', 'betrayal', 'mirror', 'dependent', 'successor', 'counter']
const VALID_SEVERITIES = ['low', 'medium', 'high', 'fatal']
const VALID_FACTION_ROLES = ['protagonist', 'antagonist', 'neutral', 'chaotic', 'systemic']

export function validateAnimePayload(data) {
  const warnings = []
  const anime = data?.anime || 'Unknown'

  REQUIRED_TOP_LEVEL.forEach(f => {
    if (data[f] === undefined) warnings.push(`Missing top-level field: ${f}`)
  })

  if (data.themeColors) {
    REQUIRED_THEME_FIELDS.forEach(f => {
      if (!data.themeColors[f]) warnings.push(`themeColors missing: ${f}`)
    })
  }

  if (data.visualizationHint && !VALID_HINTS.includes(data.visualizationHint)) {
    warnings.push(`Invalid visualizationHint: "${data.visualizationHint}"`)
  }

  if (Array.isArray(data.characters)) {
    if (data.characters.length !== 6) warnings.push(`Expected 6 characters, got ${data.characters.length}`)
    data.characters.forEach((c, i) => {
      REQUIRED_CHARACTER_FIELDS.forEach(f => {
        if (c[f] === undefined) warnings.push(`characters[${i}] (${c.name || 'unnamed'}) missing: ${f}`)
      })
    })
  }

  if (Array.isArray(data.relationships)) {
    data.relationships.forEach((r, i) => {
      if (!VALID_REL_TYPES.includes(r.type)) warnings.push(`relationships[${i}] invalid type: "${r.type}". Valid: ${VALID_REL_TYPES.join('|')}`)
    })
  }

  if (Array.isArray(data.rules)) {
    if (data.rules.length !== 3) warnings.push(`Expected 3 rules, got ${data.rules.length}`)
    data.rules.forEach((r, i) => {
      if (r.severity && !VALID_SEVERITIES.includes(r.severity)) warnings.push(`rules[${i}] invalid severity: "${r.severity}"`)
      if (!r.loreSubtitle) warnings.push(`rules[${i}] missing loreSubtitle`)
      if (!r.systemSubtitle) warnings.push(`rules[${i}] missing systemSubtitle`)
    })
  }

  if (Array.isArray(data.factions)) {
    data.factions.forEach((f, i) => {
      if (f.role && !VALID_FACTION_ROLES.includes(f.role)) warnings.push(`factions[${i}] invalid role: "${f.role}"`)
    })
  }

  if (Array.isArray(data.powerSystem)) {
    if (data.powerSystem.length !== 4) warnings.push(`Expected 4 powerSystem items, got ${data.powerSystem.length}`)
    data.powerSystem.forEach((p, i) => {
      if (!p.loreSubtitle) warnings.push(`powerSystem[${i}] missing loreSubtitle`)
      if (!p.systemSubtitle) warnings.push(`powerSystem[${i}] missing systemSubtitle`)
    })
  }

  if (warnings.length > 0) {
    console.group(`%c[ARCHIVE SCHEMA] Warnings for "${anime}"`, 'color: #f59e0b; font-weight: bold;')
    warnings.forEach(w => console.warn(w))
    console.groupEnd()
  } else {
    console.log(`%c[ARCHIVE SCHEMA] "${anime}" validated clean`, 'color: #10b981; font-weight: bold;')
  }

  return warnings
}
