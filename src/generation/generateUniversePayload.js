/**
 * RESEARCH-TO-PAYLOAD TRANSFORMER
 * 
 * This engine converts structured research insights into a fully formatted Anime Archive JSON payload. 
 * It relies on explicit inputs to prevent blank-slate hallucination.
 * 
 * CORE PRINCIPLES:
 * 1. Thesis-first: The renderer hint is chosen based on the universe's structural focus, not just node counts.
 * 2. Soft Boundaries: It does not force rigid counts (e.g., exactly 6 rules); it translates what the research provides.
 * 3. Validation Ready: It maps research directly into the required fields for the schema validator.
 */

export function generateUniversePayload(animeName, structuredResearch) {
  // Step 1: Extract core identity and thesis
  const thesis = structuredResearch.structuralThesis || "Unknown Mechanism"
  const themeColors = structuredResearch.themeColors || {
    primary: '#22d3ee', secondary: '#8b5cf6', accent: '#f59e0b',
    glow: 'rgba(34,211,238,0.3)', tabActive: '#22d3ee',
    badgeBg: 'rgba(139,92,246,0.1)', badgeText: '#8b5cf6',
    modeGlow: 'rgba(34,211,238,0.2)', heroGradient: 'rgba(5,5,20,0.9)'
  }

  // Step 2: Identify optimal renderer based on the thesis and density
  // Order of priority: Causal loops -> Counterplay economy -> Relationship webs -> Fallback
  let hint = 'standard-cards'
  let hintReason = 'Default fallback renderer.'

  const isCausal = thesis.toLowerCase().includes('time') || thesis.toLowerCase().includes('causal')
  const isEconomy = thesis.toLowerCase().includes('counter') || thesis.toLowerCase().includes('economy') || thesis.toLowerCase().includes('trade-off')
  const isWeb = thesis.toLowerCase().includes('network') || thesis.toLowerCase().includes('contract') || thesis.toLowerCase().includes('alliance')

  if (isCausal && structuredResearch.causalEvents?.length > 1) {
    hint = 'timeline'
    hintReason = 'Universe relies on deterministic causality or cross-temporal architecture.'
  } else if (isEconomy && structuredResearch.counterplay?.length > 1) {
    hint = 'counter-tree'
    hintReason = 'Universe defines combat explicitly through hard counters and energy economics.'
  } else if (isWeb && structuredResearch.relationships?.length > 3) {
    hint = 'node-graph'
    hintReason = 'Universe relies on strategic exposure and deep interpersonal webs.'
  }

  // Step 3: Map and serialize collections with safeguards
  const processCharacters = (chars = []) => {
    return chars.map(c => ({
      name: c.name || "Unknown Entity",
      title: c.title || "The Anomaly",
      rank: c.rank || "Unclassified",
      primaryAbility: c.primaryAbility || "Unknown",
      dangerLevel: c.dangerLevel || 5,
      loreBio: c.loreBio || "No archival lore record exists.",
      systemBio: c.systemBio || "No system metrics recorded.",
      gradientFrom: c.gradientFrom || '#1a1a2e',
      gradientTo: c.gradientTo || '#0f0f1a',
      accentColor: c.accentColor || '#38bdf8',
      icon: c.icon || 'circle',
      signatureMoment: c.signatureMoment || "Data expunged.",
      imageUrl: c.imageUrl || null
    }))
  }

  // Ensure relationship mapping creates tight nodes
  const processRelationships = (rels = []) => {
    return rels.map(r => ({
      source: r.source,
      target: r.target,
      type: r.type || 'dependent',
      weight: r.weight || 5,
      loreDesc: r.loreDesc || "Standard operational bond.",
      systemDesc: r.systemDesc || "Symmetric edge established."
    }))
  }

  // Step 4: Construct the compliant payload object
  const payload = {
    anime: animeName,
    tagline: structuredResearch.tagline || "CLASSIFIED SYSTEM",
    malId: structuredResearch.malId || "00000",
    themeColors: themeColors,
    visualizationHint: hint,
    visualizationReason: hintReason,

    // Collections
    powerSystem: structuredResearch.powerSystem || [],
    characters: processCharacters(structuredResearch.characters),
    relationships: processRelationships(structuredResearch.relationships),
    factions: structuredResearch.factions || [],
    rules: structuredResearch.rules || [],
    anomalies: structuredResearch.anomalies || [],
    counterplay: structuredResearch.counterplay || [],
    causalEvents: structuredResearch.causalEvents || [],
    rankings: structuredResearch.rankings || {}
  }

  return payload
}
