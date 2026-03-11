// ─── NON-NEGOTIABLE FIELD REQUIREMENTS ───────────────────────────────────────

const REQUIRED_TOP_LEVEL = [
  'anime', 'tagline', 'malId', 'themeColors', 'visualizationHint',
  'visualizationReason', 'powerSystem', 'characters', 'factions', 'rules', 'rankings', 'aiInsights'
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

const TAILWIND_COLOR_TOKEN = /^[a-z]+-\d{2,3}$/

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== ''
}

// ─── SAFE IMAGE HOST ALLOWLIST ───────────────────────────────────────────────
const ALLOWED_IMAGE_HOSTS = [
  'cdn.myanimelist.net',
  'images.myanimelist.net',
  'myanimelist.net'
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

export function validateCorePayload(data) {
  const errors = []
  const warnings = []
  const anime = data?.anime || 'Unknown'
  const hint = data?.visualizationHint

  // ── 1. Required top-level fields (hard errors) ──

  REQUIRED_TOP_LEVEL.forEach(f => {
    if (data[f] === undefined) errors.push(`Missing required field: ${f}`)
  })

  if (!isNonEmptyString(data.anime)) errors.push('anime must be a non-empty string')
  if (!isNonEmptyString(data.tagline)) errors.push('tagline must be a non-empty string')
  if (!Number.isInteger(data.malId) || data.malId <= 0) errors.push('malId must be a positive integer')
  if (!isNonEmptyString(data.visualizationReason)) errors.push('visualizationReason must be a non-empty string')

  if (!Array.isArray(data.powerSystem)) errors.push('powerSystem must be an array')
  if (!Array.isArray(data.characters)) errors.push('characters must be an array')
  if (!Array.isArray(data.factions)) errors.push('factions must be an array')
  if (!Array.isArray(data.rules)) errors.push('rules must be an array')
  if (typeof data.rankings !== 'object' || data.rankings === null || Array.isArray(data.rankings)) {
    errors.push('rankings must be an object')
  }

  const optionalCollections = ['relationships', 'counterplay', 'anomalies', 'causalEvents']
  optionalCollections.forEach((key) => {
    if (data[key] !== undefined && !Array.isArray(data[key])) {
      errors.push(`${key} must be an array when present`)
    }
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

      ;['gradientFrom', 'gradientTo', 'accentColor'].forEach((key) => {
        const token = c[key]
        if (token !== undefined && !TAILWIND_COLOR_TOKEN.test(token)) {
          errors.push(`characters[${i}] (${c.name || 'unnamed'}) ${key} must be a Tailwind color token (e.g. slate-900), received: ${token}`)
        }
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
      if (!r.severity) errors.push(`rules[${i}] missing required UI field: severity`)
      if (!r.name) errors.push(`rules[${i}] missing required UI field: name`)
      if (!r.loreConsequence) errors.push(`rules[${i}] missing required UI field: loreConsequence (Core Laws body renders blank in LORE mode)`)
      if (!r.systemEquivalent) errors.push(`rules[${i}] missing required UI field: systemEquivalent (Core Laws body renders blank in SYS mode)`)
      if (!r.loreSubtitle) errors.push(`rules[${i}] missing required UI field: loreSubtitle`)
      if (!r.systemSubtitle) errors.push(`rules[${i}] missing required UI field: systemSubtitle`)

      if (!r.name && r.ruleName) warnings.push(`rules[${i}] uses non-canonical key "ruleName"; expected "name"`)
      if (!r.loreConsequence && r.loreDesc) warnings.push(`rules[${i}] uses non-canonical key "loreDesc"; expected "loreConsequence"`)
      if (!r.systemEquivalent && r.systemDesc) warnings.push(`rules[${i}] uses non-canonical key "systemDesc"; expected "systemEquivalent"`)
    })
  }

  // ── 6b. UI-critical section field checks ──
  // These keys are required for the current tab components to render rich text
  // (and to avoid placeholder-only cards like [ATTACK] → [COUNTER]).

  if (Array.isArray(data.counterplay)) {
    data.counterplay.forEach((cp, i) => {
      if (!cp.attacker) errors.push(`counterplay[${i}] missing required UI field: attacker (Power Engine renders [ATTACK] placeholder)`)
      if (!cp.defender) errors.push(`counterplay[${i}] missing required UI field: defender (Power Engine renders [COUNTER] placeholder)`)
      if (!cp.mechanic) errors.push(`counterplay[${i}] missing required UI field: mechanic`)
      if (!cp.loreDesc && !cp.systemDesc) warnings.push(`counterplay[${i}] missing loreDesc/systemDesc (recommended for LORE/SYS richness)`)
    })
  }

  if (Array.isArray(data.anomalies)) {
    data.anomalies.forEach((a, i) => {
      if (!a.name) errors.push(`anomalies[${i}] missing required UI field: name (Rule Breakers heading renders blank)`)
      if (!a.ruleViolated) errors.push(`anomalies[${i}] missing required UI field: ruleViolated`)
      if (!a.loreDesc) errors.push(`anomalies[${i}] missing required LORE field: loreDesc`)
      if (!a.systemDesc) errors.push(`anomalies[${i}] missing required SYS field: systemDesc`)
    })
  }

  if (Array.isArray(data.causalEvents)) {
    data.causalEvents.forEach((evt, i) => {
      if (!evt.name) errors.push(`causalEvents[${i}] missing required UI field: name`)
      if (!evt.trigger) errors.push(`causalEvents[${i}] missing required UI field: trigger`)
      if (!evt.consequence) errors.push(`causalEvents[${i}] missing required UI field: consequence`)
      if (!evt.timelinePosition) errors.push(`causalEvents[${i}] missing required UI field: timelinePosition`)
      if (!evt.loreDesc) errors.push(`causalEvents[${i}] missing required LORE field: loreDesc`)
      if (!evt.systemDesc) errors.push(`causalEvents[${i}] missing required SYS field: systemDesc`)
    })
  }

  // ── 7. Faction role validation ──

  if (Array.isArray(data.factions)) {
    data.factions.forEach((f, i) => {
      if (f.role && !VALID_FACTION_ROLES.includes(f.role)) {
        errors.push(`factions[${i}] invalid role: "${f.role}"`)
      }
      if (!f.name) warnings.push(`factions[${i}] missing name (Faction card heading may render blank)`)
      if (!f.loreDesc) warnings.push(`factions[${i}] missing loreDesc`)
      if (!f.systemDesc) warnings.push(`factions[${i}] missing systemDesc`)
    })
  }

  // ── 8. PowerSystem lore/system split quality ──

  if (Array.isArray(data.powerSystem)) {
    data.powerSystem.forEach((p, i) => {
      if (!p.name) warnings.push(`powerSystem[${i}] missing name (Power Engine card heading may render blank)`)
      if (!p.loreDesc) warnings.push(`powerSystem[${i}] missing loreDesc`)
      if (!p.systemDesc) warnings.push(`powerSystem[${i}] missing systemDesc`)
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
    errors.push(`Renderer "${hint}" requires non-empty 'causalEvents' for runtime rendering.`)
  }
  if (hint === 'node-graph' && (!data.relationships || data.relationships.length === 0)) {
    errors.push(`Renderer "${hint}" requires non-empty 'relationships' to wire the D3 graph.`)
  }
  if (hint === 'counter-tree' && (!data.counterplay || data.counterplay.length === 0)) {
    errors.push(`Renderer "${hint}" requires non-empty 'counterplay' for the combat economy tree.`)
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

  // ── 12. AI Insights Validation (Hard requirement) ──

  if (typeof data.aiInsights !== 'object' || data.aiInsights === null) {
    errors.push(`aiInsights must be an object.`)
  } else {
    if (typeof data.aiInsights.casual !== 'string' || data.aiInsights.casual.trim() === '') {
      errors.push(`aiInsights.casual must be a non-empty string.`)
    }
    if (typeof data.aiInsights.deep !== 'string' || data.aiInsights.deep.trim() === '') {
      errors.push(`aiInsights.deep must be a non-empty string.`)
    }
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

export function validateAnimePayload(data) {
  return validateCorePayload(data)
}

export function validateExtendedDataset(data) {
  const errors = []
  const warnings = []

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    errors.push('Extended dataset must be a JSON object.')
    return { errors, warnings }
  }

  if (!data.anime || typeof data.anime !== 'string') {
    errors.push('Extended dataset missing required string field: anime')
  }

  const knownCollections = [
    'characters', 'relationships', 'factions', 'rules',
    'anomalies', 'counterplay', 'causalEvents', 'powerSystem'
  ]

  knownCollections.forEach((key) => {
    if (data[key] !== undefined && !Array.isArray(data[key])) {
      errors.push(`Extended field "${key}" must be an array when present.`)
    }
  })

  if (!data.structuralThesis && !data.visualizationHint) {
    warnings.push('Extended dataset should include structuralThesis or visualizationHint for core selection.')
  }

  return { errors, warnings }
}
