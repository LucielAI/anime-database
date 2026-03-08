import TimelineExplorer from './TimelineExplorer'
import NodeGraphExplorer from './NodeGraphExplorer'
import CounterTreeExplorer from './CounterTreeExplorer'
import StandardCardsExplorer from './StandardCardsExplorer'

export const VISUALIZATION_REGISTRY = {
  'timeline': TimelineExplorer,
  'node-graph': NodeGraphExplorer,
  'counter-tree': CounterTreeExplorer,
  'standard-cards': StandardCardsExplorer,
}

export function getVisualization(hint) {
  const Component = VISUALIZATION_REGISTRY[hint]
  if (!Component) {
    console.warn(`[ARCHIVE] No visualization found for hint: "${hint}". Falling back to standard-cards.`)
    return StandardCardsExplorer
  }
  return Component
}
