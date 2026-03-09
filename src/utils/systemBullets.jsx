import { Zap, Scale, AlertTriangle, Clock, Shield } from 'lucide-react'

export const getCategoryIcon = (category) => {
  switch (category) {
    case 'ENGINE': return <Zap className="w-2.5 h-2.5" />
    case 'LAW': return <Scale className="w-2.5 h-2.5" />
    case 'EXCEPTION': return <AlertTriangle className="w-2.5 h-2.5" />
    case 'CAUSALITY BOUND': return <Clock className="w-2.5 h-2.5" />
    case 'HIERARCHY': return <Shield className="w-2.5 h-2.5" />
    default: return null
  }
}

// Extract best N bullets dynamically from payload depending on availability
export function deriveBullets(data, limit = 5) {
  const pool = []

  if (data?.powerSystem) {
    data.powerSystem.forEach(ps => {
      pool.push({
        id: `ps-${ps.name}`,
        category: 'ENGINE',
        lore: ps.loreDesc || ps.subtitle,
        sys: ps.systemDesc || ps.systemSubtitle || ps.subtitle
      })
    })
  }

  if (data?.rules) {
    data.rules.forEach(rule => {
      pool.push({
        id: `rule-${rule.name}`,
        category: 'LAW',
        lore: rule.loreDesc || rule.description,
        sys: rule.systemDesc || rule.description
      })
    })
  }

  if (data?.anomalies) {
    data.anomalies.forEach(ano => {
      pool.push({
        id: `ano-${ano.name}`,
        category: 'EXCEPTION',
        lore: ano.loreDesc || ano.description,
        sys: ano.systemDesc || ano.description
      })
    })
  }

  if (data?.causalEvents && data.visualizationHint === 'timeline') {
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

  if (data?.factions && data.factions.length > 0) {
    const mainFaction = data.factions[0]
    pool.push({
      id: `faction-${mainFaction.name}`,
      category: 'HIERARCHY',
      lore: mainFaction.loreDesc || mainFaction.description,
      sys: mainFaction.systemDesc || mainFaction.description
    })
  }

  // Sort pool arbitrarily to prioritize Engine, Law, Exception over others
  const priorityMap = {
    'ENGINE': 1,
    'LAW': 2,
    'CAUSALITY BOUND': 3,
    'EXCEPTION': 4,
    'HIERARCHY': 5
  }

  pool.sort((a, b) => priorityMap[a.category] - priorityMap[b.category])

  return pool.slice(0, limit)
}
