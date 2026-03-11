import { selectCoreFromExtended } from './selectCoreFromExtended'

const DEFAULT_THEME = {
  primary: '#22d3ee',
  secondary: '#8b5cf6',
  accent: '#f59e0b',
  glow: 'rgba(34,211,238,0.3)',
  tabActive: '#22d3ee',
  badgeBg: 'rgba(139,92,246,0.1)',
  badgeText: '#8b5cf6',
  modeGlow: 'rgba(34,211,238,0.2)',
  heroGradient: 'rgba(5,5,20,0.9)'
}

const DEFAULT_CHARACTER_COLORS = {
  gradientFrom: 'slate-900',
  gradientTo: 'slate-700',
  accentColor: 'cyan-400'
}

/**
 * RESEARCH-TO-PAYLOAD TRANSFORMER
 *
 * NOTE: This is a starter utility, not a final authoring path.
 * Output must always be manually reviewed against:
 * - src/utils/validateSchema.js
 * - playbooks/06-payload-field-reference.md
 */
export function generateUniversePayload(animeName, structuredResearch, options = {}) {
  const sourceLayer = options.sourceLayer || 'core'

  const baseResearch = sourceLayer === 'extended'
    ? selectCoreFromExtended(structuredResearch)
    : structuredResearch

  const thesis = baseResearch.structuralThesis || 'Unknown Mechanism'
  const themeColors = { ...DEFAULT_THEME, ...(baseResearch.themeColors || {}) }

  let hint = 'standard-cards'
  let hintReason = 'Fallback renderer used because no stronger thesis signal was detected.'

  const thesisLower = thesis.toLowerCase()
  const isCausal = thesisLower.includes('time') || thesisLower.includes('causal')
  const isEconomy = thesisLower.includes('counter') || thesisLower.includes('economy') || thesisLower.includes('trade-off')
  const isWeb = thesisLower.includes('network') || thesisLower.includes('contract') || thesisLower.includes('alliance')

  if (isCausal && baseResearch.causalEvents?.length > 1) {
    hint = 'timeline'
    hintReason = 'Universe behavior is primarily causal; timeline best exposes trigger-consequence chains.'
  } else if (isEconomy && baseResearch.counterplay?.length > 1) {
    hint = 'counter-tree'
    hintReason = 'Universe behavior is primarily matchup/counter economy; counter-tree surfaces exploit paths.'
  } else if (isWeb && baseResearch.relationships?.length > 3) {
    hint = 'node-graph'
    hintReason = 'Universe behavior is primarily relational control; node-graph surfaces dependencies and betrayals.'
  }

  const processCharacters = (chars = []) => chars.map(c => {
    const imageUrl = c.imageUrl || null

    return {
      name: c.name || 'Unknown Entity',
      title: c.title || 'The Anomaly',
      rank: c.rank || 'Unclassified',
      primaryAbility: c.primaryAbility || 'Unknown',
      dangerLevel: Number.isFinite(Number(c.dangerLevel)) ? Number(c.dangerLevel) : 5,
      loreBio: c.loreBio || 'No archival lore record exists.',
      systemBio: c.systemBio || 'No system metrics recorded.',
      gradientFrom: c.gradientFrom || DEFAULT_CHARACTER_COLORS.gradientFrom,
      gradientTo: c.gradientTo || DEFAULT_CHARACTER_COLORS.gradientTo,
      accentColor: c.accentColor || DEFAULT_CHARACTER_COLORS.accentColor,
      icon: c.icon || 'Circle',
      signatureMoment: c.signatureMoment || 'Data expunged.',
      imageUrl,
      ...(imageUrl === null ? { _fetchFailed: true } : {})
    }
  })

  const processRelationships = (rels = []) => rels.map(r => ({
    source: r.source,
    target: r.target,
    type: r.type || 'dependent',
    weight: r.weight || 5,
    loreDesc: r.loreDesc || 'Standard operational bond.',
    systemDesc: r.systemDesc || 'Symmetric edge established.'
  }))

  return {
    anime: animeName,
    tagline: baseResearch.tagline || 'CLASSIFIED SYSTEM',
    malId: Number.isInteger(baseResearch.malId) && baseResearch.malId > 0 ? baseResearch.malId : 1,
    themeColors,
    visualizationHint: hint,
    visualizationReason: baseResearch.visualizationReason || hintReason,
    powerSystem: baseResearch.powerSystem || [],
    characters: processCharacters(baseResearch.characters),
    relationships: processRelationships(baseResearch.relationships),
    factions: baseResearch.factions || [],
    rules: baseResearch.rules || [],
    anomalies: baseResearch.anomalies || [],
    counterplay: baseResearch.counterplay || [],
    causalEvents: baseResearch.causalEvents || [],
    rankings: baseResearch.rankings || {},
    aiInsights: baseResearch.aiInsights || {
      casual: 'System scan pending. Replace with a concise fan-facing interpretation.',
      deep: 'System scan pending. Replace with mechanics-focused analysis of constraints and causality.'
    }
  }
}
