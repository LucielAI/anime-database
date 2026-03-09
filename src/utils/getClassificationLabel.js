export function getClassificationLabel(hint) {
  switch (hint) {
    case 'timeline': return 'TIMELINE SYSTEM'
    case 'counter-tree': return 'COUNTERPLAY SYSTEM'
    case 'node-graph': return 'RELATIONAL SYSTEM'
    case 'affinity-matrix': return 'AFFINITY SYSTEM'
    case 'standard-cards': return 'CARD SYSTEM'
    default: return 'CLASSIFIED SYSTEM'
  }
}
