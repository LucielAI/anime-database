// Extract best bullets dynamically from payload depending on availability
// Reused by: SystemSummary, landing page snapshot cards, hero card, Share Frame
export function deriveBullets(data) {
  const pool = []

  if (data.powerSystem) {
    data.powerSystem.forEach(ps => {
      pool.push({
        id: `ps-${ps.name}`,
        category: 'ENGINE',
        lore: ps.loreDesc || ps.subtitle,
        sys: ps.systemDesc || ps.systemSubtitle || ps.subtitle
      })
    })
  }

  if (data.rules) {
    data.rules.forEach(rule => {
      pool.push({
        id: `rule-${rule.name}`,
        category: 'LAW',
        lore: rule.loreDesc || rule.description,
        sys: rule.systemDesc || rule.description
      })
    })
  }

  if (data.anomalies) {
    data.anomalies.forEach(ano => {
      pool.push({
        id: `ano-${ano.name}`,
        category: 'EXCEPTION',
        lore: ano.loreDesc || ano.description,
        sys: ano.systemDesc || ano.description
      })
    })
  }

  if (data.causalEvents && data.visualizationHint === 'timeline') {
    const rootEvent = data.causalEvents[0]
    if (rootEvent) {
      pool.push({
        id: `event-${rootEvent.name}`,
        category: 'CAUSALITY BOUND',
        lore: rootEvent.loreDesc || rootEvent.description,
        sys: rootEvent.systemDesc || rootEvent.description
      })
    }
  }

  if (data.factions && data.factions.length > 0) {
    const mainFaction = data.factions[0]
    pool.push({
      id: `faction-${mainFaction.name}`,
      category: 'HIERARCHY',
      lore: mainFaction.loreDesc || mainFaction.description,
      sys: mainFaction.systemDesc || mainFaction.description
    })
  }

  const priorityMap = {
    'ENGINE': 1,
    'LAW': 2,
    'CAUSALITY BOUND': 3,
    'EXCEPTION': 4,
    'HIERARCHY': 5
  }

  pool.sort((a, b) => priorityMap[a.category] - priorityMap[b.category])

  return pool.slice(0, 5)
}
