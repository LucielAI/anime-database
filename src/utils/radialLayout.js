// Shared radial layout calculation for positioning nodes in a circle.
export function computeRadialPositions(items, cx, cy, radius) {
  return items.map((item, i) => {
    const angle = (2 * Math.PI * i) / items.length - Math.PI / 2
    return {
      ...item,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    }
  })
}
