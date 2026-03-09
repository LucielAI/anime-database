import { selectCoreFromExtended } from './selectCoreFromExtended'

/**
 * RESEARCH-TO-PAYLOAD TRANSFORMER
 *
 * This module turns structured research into a renderer-ready core payload.
 *
 * Operational intent:
 * 1) Thesis-first renderer mapping (not raw volume-first).
 * 2) Non-breaking defaults for missing fields.
 * 3) Layered support: extended -> deterministic core selection -> core payload.
 */
export function generateUniversePayload(animeName, structuredResearch, options = {}) {
  const sourceLayer = options.sourceLayer || 'core'

  // If research is extended, compress it deterministically before formatting.
  const baseResearch = sourceLayer === 'extended'
    ? selectCoreFromExtended(structuredResearch)
    : structuredResearch

  // The system thesis should drive visualization strategy.
  const thesis = baseResearch.structuralThesis || 'Unknown Mechanism'
  const themeColors = baseResearch.themeColors || {
    primary: '#22d3ee', secondary: '#8b5cf6', accent: '#f59e0b',
    glow: 'rgba(34,211,238,0.3)', tabActive: '#22d3ee',
    badgeBg: 'rgba(139,92,246,0.1)', badgeText: '#8b5cf6',
    modeGlow: 'rgba(34,211,238,0.2)', heroGradient: 'rgba(5,5,20,0.9)'
  }

  // Renderer hint selection priority: causality -> counter economy -> relationship web.
  let hint = 'standard-cards'
  let hintReason = 'Default fallback renderer.'

  const isCausal = thesis.toLowerCase().includes('time') || thesis.toLowerCase().includes('causal')
  const isEconomy = thesis.toLowerCase().includes('counter') || thesis.toLowerCase().includes('economy') || thesis.toLowerCase().includes('trade-off')
  const isWeb = thesis.toLowerCase().includes('network') || thesis.toLowerCase().includes('contract') || thesis.toLowerCase().includes('alliance')

  if (isCausal && baseResearch.causalEvents?.length > 1) {
    hint = 'timeline'
    hintReason = 'Universe relies on deterministic causality or cross-temporal architecture.'
  } else if (isEconomy && baseResearch.counterplay?.length > 1) {
    hint = 'counter-tree'
    hintReason = 'Universe defines combat explicitly through hard counters and energy economics.'
  } else if (isWeb && baseResearch.relationships?.length > 3) {
    hint = 'node-graph'
    hintReason = 'Universe relies on strategic exposure and deep interpersonal webs.'
  }

  // Keep formatting robust to partial research outputs.
  const processCharacters = (chars = []) => chars.map(c => {
    const imageUrl = c.imageUrl || null

    return {
      name: c.name || 'Unknown Entity',
      title: c.title || 'The Anomaly',
      rank: c.rank || 'Unclassified',
      primaryAbility: c.primaryAbility || 'Unknown',
      dangerLevel: c.dangerLevel || 5,
      loreBio: c.loreBio || 'No archival lore record exists.',
      systemBio: c.systemBio || 'No system metrics recorded.',
      gradientFrom: c.gradientFrom || '#1a1a2e',
      gradientTo: c.gradientTo || '#0f0f1a',
      accentColor: c.accentColor || '#38bdf8',
      icon: c.icon || 'circle',
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
    malId: baseResearch.malId || '00000',
    themeColors,
    visualizationHint: hint,
    visualizationReason: hintReason,
    powerSystem: baseResearch.powerSystem || [],
    characters: processCharacters(baseResearch.characters),
    relationships: processRelationships(baseResearch.relationships),
    factions: baseResearch.factions || [],
    rules: baseResearch.rules || [],
    anomalies: baseResearch.anomalies || [],
    counterplay: baseResearch.counterplay || [],
    causalEvents: baseResearch.causalEvents || [],
    rankings: baseResearch.rankings || {}
  }
}
