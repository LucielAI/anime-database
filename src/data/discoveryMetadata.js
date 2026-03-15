export const DISCOVERY_CLUSTERS = {
  'combat-systems': {
    label: 'Combat Systems',
    shortLabel: 'Combat',
    description: 'Counterplay-heavy universes where matchup logic and execution windows dominate outcomes.',
  },
  'causal-systems': {
    label: 'Causal Systems',
    shortLabel: 'Causal',
    description: 'Universes where deterministic chains and delayed consequences govern strategy.',
  },
  'faction-heavy': {
    label: 'Faction-Heavy',
    shortLabel: 'Factions',
    description: 'Systems driven by coalition pressure, political blocs, and shifting institutional control.',
  },
  'hierarchy-heavy': {
    label: 'Hierarchy-Heavy',
    shortLabel: 'Hierarchy',
    description: 'Power structures defined by rank ladders, gatekeeping, and authority routing.',
  },
  inheritance: {
    label: 'Inheritance Systems',
    shortLabel: 'Inheritance',
    description: 'Universes where power transfer, succession, and legacy constraints shape the system.',
  },
  'anomaly-driven': {
    label: 'Anomaly-Driven',
    shortLabel: 'Anomalies',
    description: 'Worlds transformed by edge-case actors, exploits, and rule-breaking singularities.',
  },
}

export const DISCOVERY_METADATA = {
  aot: {
    addedAt: '2024-02-02', popularityBaseline: 98, featuredRank: 2, classification: 'causal', startTab: 'core-laws', startLabel: 'Start with CORE LAWS for deterministic constraints first.',
    clusterTags: ['causal-systems', 'faction-heavy', 'inheritance'],
    appealTags: ['deterministic-systems', 'high-stakes-escalation'],
    systemProfile: { factionComplexity: 3, causalDensity: 3, powerStructure: 'inheritance' }
  },
  jjk: {
    addedAt: '2024-02-10', popularityBaseline: 96, featuredRank: 1, classification: 'combat', startTab: 'power-engine', startLabel: 'Start with POWER ENGINE for matchup logic.',
    clusterTags: ['combat-systems', 'hierarchy-heavy', 'anomaly-driven'],
    appealTags: ['technical-counterplay', 'power-scaling'],
    systemProfile: { factionComplexity: 2, causalDensity: 1, powerStructure: 'matchup' }
  },
  demonslayer: {
    addedAt: '2024-02-21', popularityBaseline: 94, featuredRank: 3, classification: 'combat', startTab: 'power-engine', startLabel: 'Start with POWER ENGINE for kill-window counterplay.',
    clusterTags: ['combat-systems', 'hierarchy-heavy', 'inheritance'],
    appealTags: ['technical-counterplay', 'high-stakes-escalation'],
    systemProfile: { factionComplexity: 2, causalDensity: 1, powerStructure: 'matchup' }
  },
  hxh: {
    addedAt: '2024-03-01', popularityBaseline: 88, classification: 'network', startTab: 'entity-database', startLabel: 'Start with ENTITY DATABASE to map Nen-era power hubs.',
    clusterTags: ['faction-heavy', 'combat-systems', 'anomaly-driven'],
    appealTags: ['technical-counterplay', 'strategy-network'],
    systemProfile: { factionComplexity: 3, causalDensity: 2, powerStructure: 'modular' }
  },
  vinlandsaga: {
    addedAt: '2024-03-12', popularityBaseline: 78, classification: 'network', startTab: 'factions', startLabel: 'Start with FACTIONS to see violence-economy blocs.',
    clusterTags: ['faction-heavy', 'causal-systems'],
    appealTags: ['deterministic-systems', 'strategy-network'],
    systemProfile: { factionComplexity: 3, causalDensity: 2, powerStructure: 'resource' }
  },
  steinsgate: {
    addedAt: '2024-03-27', popularityBaseline: 84, classification: 'causal', startTab: 'core-laws', startLabel: 'Start with CORE LAWS to understand convergence pressure.',
    clusterTags: ['causal-systems', 'anomaly-driven'],
    appealTags: ['deterministic-systems', 'high-stakes-escalation'],
    systemProfile: { factionComplexity: 1, causalDensity: 3, powerStructure: 'causal' }
  },
  deathnote: {
    addedAt: '2024-04-10', popularityBaseline: 90, classification: 'combat', startTab: 'entity-database', startLabel: 'Start with ENTITY DATABASE for control-network warfare.',
    clusterTags: ['faction-heavy', 'anomaly-driven', 'hierarchy-heavy'],
    appealTags: ['strategy-network', 'high-stakes-escalation'],
    systemProfile: { factionComplexity: 3, causalDensity: 2, powerStructure: 'control' }
  },
  fmab: {
    addedAt: '2024-04-28', popularityBaseline: 91, classification: 'affinity', startTab: 'power-engine', startLabel: 'Start with POWER ENGINE for alchemy exchange mechanics.',
    clusterTags: ['hierarchy-heavy', 'inheritance', 'anomaly-driven'],
    appealTags: ['deterministic-systems', 'strategy-network'],
    systemProfile: { factionComplexity: 2, causalDensity: 2, powerStructure: 'exchange' }
  },
  codegeass: {
    addedAt: '2024-05-18', popularityBaseline: 86, classification: 'network', startTab: 'factions', startLabel: 'Start with FACTIONS for empire-scale command structures.',
    clusterTags: ['faction-heavy', 'hierarchy-heavy', 'anomaly-driven'],
    appealTags: ['strategy-network', 'high-stakes-escalation'],
    systemProfile: { factionComplexity: 3, causalDensity: 2, powerStructure: 'control' }
  },
  mha: {
    addedAt: '2024-06-01', popularityBaseline: 87, classification: 'network', startTab: 'entity-database', startLabel: 'Start with ENTITY DATABASE to parse quirk-role ecosystems.',
    clusterTags: ['hierarchy-heavy', 'inheritance', 'faction-heavy'],
    appealTags: ['power-scaling', 'strategy-network'],
    systemProfile: { factionComplexity: 3, causalDensity: 1, powerStructure: 'inheritance' }
  },
  frieren: {
    addedAt: '2024-06-22', popularityBaseline: 95, classification: 'causal', startTab: 'core-laws', startLabel: 'Start with CORE LAWS for suppression and visualization constraints.',
    clusterTags: ['causal-systems', 'anomaly-driven', 'combat-systems'],
    appealTags: ['deterministic-systems', 'technical-counterplay'],
    systemProfile: { factionComplexity: 2, causalDensity: 3, powerStructure: 'suppression' }
  },
  sololeveling: {
    addedAt: '2024-07-05', popularityBaseline: 93, featuredRank: 4, classification: 'network', startTab: 'entity-database', startLabel: 'Start with ENTITY DATABASE to map gate pressure, sovereign scaling, and dependency edges.',
    clusterTags: ['hierarchy-heavy', 'combat-systems', 'faction-heavy'],
    appealTags: ['power-scaling', 'high-stakes-escalation'],
    systemProfile: { factionComplexity: 2, causalDensity: 1, powerStructure: 'growth-loop' }
  },
  goblinslayer: {
    addedAt: '2024-07-16', popularityBaseline: 82, classification: 'network', startTab: 'entity-database', startLabel: 'Start with ENTITY DATABASE to trace guild dispatch, specialist execution, and civilian resilience links.',
    clusterTags: ['combat-systems', 'faction-heavy', 'hierarchy-heavy'],
    appealTags: ['technical-counterplay', 'strategy-network'],
    systemProfile: { factionComplexity: 3, causalDensity: 2, powerStructure: 'specialization' }
  },
  mushokutensei: {
    addedAt: '2024-08-03', popularityBaseline: 89, classification: 'causal', startTab: 'core-laws', startLabel: 'Start with CORE LAWS for fate pressure and timeline constraints.',
    clusterTags: ['causal-systems', 'hierarchy-heavy', 'anomaly-driven'],
    appealTags: ['deterministic-systems', 'high-stakes-escalation'],
    systemProfile: { factionComplexity: 2, causalDensity: 3, powerStructure: 'causal' }
  }

}
