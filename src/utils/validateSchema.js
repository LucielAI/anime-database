// ─── NON-NEGOTIABLE FIELD REQUIREMENTS ───────────────────────────────────────

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

// ─── VALID ENUMS ─────────────────────────────────────────────────────────────

const VALID_HINTS = ['timeline', 'node-graph', 'counter-tree', 'affinity-matrix', 'standard-cards']
const VALID_REL_TYPES = ['ally', 'enemy', 'rival', 'mentor', 'betrayal', 'mirror', 'dependent', 'successor', 'counter']
const VALID_SEVERITIES = ['low', 'medium', 'high', 'fatal']
const VALID_FACTION_ROLES = ['protagonist', 'antagonist', 'neutral', 'chaotic', 'systemic']

// ─── SAFE IMAGE HOST ALLOWLIST ───────────────────────────────────────────────
const ALLOWED_IMAGE_HOSTS = [
  'cdn.myanimelist.net',
  'images.myanimelist.net'
]

// ─── RENDERER-AWARE STRUCTURAL PROFILES ──────────────────────────────────────
// Each renderer has different structural needs. A timeline engine needs dense
// causal events; a counter-tree needs deep counterplay; a node-graph needs
// rich relationships. These profiles define recommended ranges, not rigid walls.
//
// [min, softMax] — below min triggers a warning, above softMax triggers a warning.
// Universes may exceed softMax with good reason, but the warning flags bloat risk.

const STRUCTURAL_PROFILES = {
  'timeline': {
    label: 'Timeline / Causality Engine',
    characters:    [4, 12],
    relationships: [6, 20],
    causalEvents:  [4, 10],
    counterplay:   [2, 8],
    anomalies:     [2, 8],
    factions:      [3, 8],
    powerSystem:   [3, 6],
    rules:         [2, 6],
  },
  'node-graph': {
    label: 'Node Graph / Relationship Web',
    characters:    [5, 12],
    relationships: [8, 25],
    causalEvents:  [2, 8],
    counterplay:   [2, 8],
    anomalies:     [2, 8],
    factions:      [3, 8],
    powerSystem:   [3, 6],
    rules:         [2, 6],
  },
  'counter-tree': {
    label: 'Counter-Tree / Combat Economy',
    characters:    [4, 12],
    relationships: [6, 20],
    causalEvents:  [2, 8],
    counterplay:   [5, 12],
    anomalies:     [2, 8],
    factions:      [3, 8],
    powerSystem:   [3, 6],
    rules:         [2, 6],
  },
  'affinity-matrix': {
    label: 'Affinity Matrix',
    characters:    [4, 12],
    relationships: [4, 20],
    causalEvents:  [1, 8],
    counterplay:   [1, 8],
    anomalies:     [1, 8],
    factions:      [2, 8],
    powerSystem:   [3, 6],
    rules:         [2, 6],
  },
  'standard-cards': {
    label: 'Standard Cards Explorer',
    characters:    [4, 12],
    relationships: [4, 20],
    causalEvents:  [1, 8],
    counterplay:   [1, 8],
    anomalies:     [1, 8],
    factions:      [2, 8],
    powerSystem:   [3, 6],
    rules:         [2, 6],
  },
}

// ─── VALIDATOR ───────────────────────────────────────────────────────────────

export function validateAnimePayload(data) {
  const errors = []
  const warnings = []
  const anime = data?.anime || 'Unknown'
  const hint = data?.visualizationHint

  // ── 1. Required top-level fields (hard errors) ──

  REQUIRED_TOP_LEVEL.forEach(f => {
    if (data[f] === undefined) errors.push(`Missing required field: ${f}`)
  })

  // ── 2. Theme color completeness ──

  if (data.themeColors) {
    REQUIRED_THEME_FIELDS.forEach(f => {
      if (!data.themeColors[f]) errors.push(`themeColors missing: ${f}`)
    })
  }

  // ── 3. Visualization hint ──

  if (hint && !VALID_HINTS.includes(hint)) {
    errors.push(`Invalid visualizationHint: "${hint}"`)
  }

  // ── 4. Character field completeness (hard errors) ──

  if (Array.isArray(data.characters)) {
    data.characters.forEach((c, i) => {
      REQUIRED_CHARACTER_FIELDS.forEach(f => {
        if (c[f] === undefined) errors.push(`characters[${i}] (${c.name || 'unnamed'}) missing: ${f}`)
      })

      // Image URL Validation (Must be from ALLOWED_IMAGE_HOSTS or Explicit Fallback)
      if (c.imageUrl !== undefined) {
        if (c.imageUrl !== null) {
          try {
            const urlObj = new URL(c.imageUrl)
            if (!ALLOWED_IMAGE_HOSTS.includes(urlObj.hostname)) {
              errors.push(`characters[${i}] (${c.name}) has invalid imageUrl. MUST be from ALLOWED_IMAGE_HOSTS. Found hostname: ${urlObj.hostname}`)
            }
          } catch {
            errors.push(`characters[${i}] (${c.name}) has unparseable imageUrl: ${c.imageUrl}`)
          }
        }
        if (c.imageUrl === null && c._fetchFailed !== true) {
          errors.push(`characters[${i}] (${c.name}) has null imageUrl but missing _fetchFailed: true flag.`)
        }
      }
    })
  }

  // ── 4b. Anime Poster validation ──
  if (data.animeImageUrl) {
    try {
      const urlObj = new URL(data.animeImageUrl)
      if (!ALLOWED_IMAGE_HOSTS.includes(urlObj.hostname)) {
        errors.push(`animeImageUrl is invalid. MUST be from ALLOWED_IMAGE_HOSTS. Found hostname: ${urlObj.hostname}`)
      }
    } catch {
      errors.push(`animeImageUrl is unparseable: ${data.animeImageUrl}`)
    }
  }

  // ── 5. Relationship enum validation ──

  if (Array.isArray(data.relationships)) {
    data.relationships.forEach((r, i) => {
      if (!VALID_REL_TYPES.includes(r.type)) {
        errors.push(`relationships[${i}] invalid type: "${r.type}"`)
      }
    })
  }

  // ── 6. Rule field quality ──

  if (Array.isArray(data.rules)) {
    data.rules.forEach((r, i) => {
      if (r.severity && !VALID_SEVERITIES.includes(r.severity)) {
        errors.push(`rules[${i}] invalid severity: "${r.severity}"`)
      }
      if (!r.loreSubtitle) warnings.push(`rules[${i}] missing loreSubtitle`)
      if (!r.systemSubtitle) warnings.push(`rules[${i}] missing systemSubtitle`)
    })
  }

  // ── 7. Faction role validation ──

  if (Array.isArray(data.factions)) {
    data.factions.forEach((f, i) => {
      if (f.role && !VALID_FACTION_ROLES.includes(f.role)) {
        errors.push(`factions[${i}] invalid role: "${f.role}"`)
      }
    })
  }

  // ── 8. PowerSystem lore/system split quality ──

  if (Array.isArray(data.powerSystem)) {
    data.powerSystem.forEach((p, i) => {
      if (!p.loreSubtitle) warnings.push(`powerSystem[${i}] missing loreSubtitle`)
      if (!p.systemSubtitle) warnings.push(`powerSystem[${i}] missing systemSubtitle`)
    })
  }

  // ── 9. Relationship graph integrity ──

  if (Array.isArray(data.characters) && Array.isArray(data.relationships)) {
    const charNames = new Set(data.characters.map(c => c.name))
    data.relationships.forEach((r, i) => {
      if (!charNames.has(r.source)) {
        warnings.push(`relationships[${i}] source "${r.source}" is off-graph (not in characters)`)
      }
      if (!charNames.has(r.target)) {
        warnings.push(`relationships[${i}] target "${r.target}" is off-graph (not in characters)`)
      }
    })
  }

  // ── 10. Renderer-specific field requirements ──
  if (hint === 'timeline' && (!data.causalEvents || data.causalEvents.length === 0)) {
    warnings.push(`Renderer "${hint}" requires 'causalEvents' to properly layout.`)
  }
  if (hint === 'node-graph' && (!data.relationships || data.relationships.length === 0)) {
    warnings.push(`Renderer "${hint}" requires 'relationships' to wire the D3 graph.`)
  }
  if (hint === 'counter-tree' && (!data.counterplay || data.counterplay.length === 0)) {
    warnings.push(`Renderer "${hint}" requires 'counterplay' for the combat economy tree.`)
  }

  // ── 11. Renderer-aware structural density checks (Soft Guidance) ──

  const profile = STRUCTURAL_PROFILES[hint]
  if (profile) {
    const sections = {
      characters:    { data: data.characters,    label: 'characters' },
      powerSystem:   { data: data.powerSystem,   label: 'powerSystem' },
      rules:         { data: data.rules,         label: 'rules' },
      factions:      { data: data.factions,      label: 'factions' },
      relationships: { data: data.relationships, label: 'relationships' },
      causalEvents:  { data: data.causalEvents,  label: 'causalEvents' },
      counterplay:   { data: data.counterplay,   label: 'counterplay' },
      anomalies:     { data: data.anomalies,     label: 'anomalies' },
    }

    Object.entries(sections).forEach(([key, { data: arr, label }]) => {
      const count = Array.isArray(arr) ? arr.length : 0
      const [min, softMax] = profile[key] || [0, 99]

      if (count < min) {
        warnings.push(
          `${label} (${count}) is thin for ${profile.label} — recommend at least ${min}`
        )
      } else if (count > softMax) {
        warnings.push(
          `${label} (${count}) may be bloated for ${profile.label} — recommend at most ${softMax}`
        )
      }
    })
  }

  // ── Output ──

  const hasErrors = errors.length > 0
  const hasWarnings = warnings.length > 0

  if (hasErrors || hasWarnings) {
    console.group(
      `%c[ARCHIVE SCHEMA] ${hasErrors ? 'ERRORS' : 'Warnings'} for "${anime}" (${hint || 'no hint'})`,
      `color: ${hasErrors ? '#ef4444' : '#f59e0b'}; font-weight: bold;`
    )
    errors.forEach(e => console.error(e))
    warnings.forEach(w => console.warn(w))
    console.groupEnd()
  }

  return { errors, warnings }
}
