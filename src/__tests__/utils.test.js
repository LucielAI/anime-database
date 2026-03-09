import { describe, it, expect } from 'vitest'
import { deriveBullets } from '../utils/deriveBullets'
import { getClassificationLabel } from '../utils/getClassificationLabel'
import { resolveColor } from '../utils/resolveColor'
import { computeRadialPositions } from '../utils/radialLayout'

describe('deriveBullets', () => {
  it('returns empty array for empty data', () => {
    expect(deriveBullets({})).toEqual([])
  })

  it('derives bullets from powerSystem', () => {
    const data = { powerSystem: [{ name: 'Nen', loreDesc: 'Life energy' }] }
    const bullets = deriveBullets(data)
    expect(bullets).toHaveLength(1)
    expect(bullets[0].category).toBe('ENGINE')
    expect(bullets[0].lore).toBe('Life energy')
  })

  it('derives bullets from rules', () => {
    const data = { rules: [{ name: 'R1', loreDesc: 'No killing' }] }
    const bullets = deriveBullets(data)
    expect(bullets[0].category).toBe('LAW')
  })

  it('prioritizes ENGINE over LAW', () => {
    const data = {
      powerSystem: [{ name: 'P', loreDesc: 'Power' }],
      rules: [{ name: 'R', loreDesc: 'Rule' }],
    }
    const bullets = deriveBullets(data)
    expect(bullets[0].category).toBe('ENGINE')
    expect(bullets[1].category).toBe('LAW')
  })

  it('limits to 5 bullets by default', () => {
    const data = {
      powerSystem: Array.from({ length: 10 }, (_, i) => ({ name: `P${i}`, loreDesc: `Power ${i}` })),
    }
    expect(deriveBullets(data)).toHaveLength(5)
  })

  it('includes causalEvents only for timeline hint', () => {
    const events = [{ name: 'E1', loreDesc: 'Event 1' }]
    const timelineData = { causalEvents: events, visualizationHint: 'timeline' }
    const otherData = { causalEvents: events, visualizationHint: 'node-graph' }
    expect(deriveBullets(timelineData).some(b => b.category === 'CAUSALITY BOUND')).toBe(true)
    expect(deriveBullets(otherData).some(b => b.category === 'CAUSALITY BOUND')).toBe(false)
  })

  it('includes faction data', () => {
    const data = { factions: [{ name: 'F1', loreDesc: 'A faction' }] }
    const bullets = deriveBullets(data)
    expect(bullets.some(b => b.category === 'HIERARCHY')).toBe(true)
  })
})

describe('getClassificationLabel', () => {
  it('maps timeline to TIMELINE SYSTEM', () => {
    expect(getClassificationLabel('timeline')).toBe('TIMELINE SYSTEM')
  })

  it('maps counter-tree', () => {
    expect(getClassificationLabel('counter-tree')).toBe('COUNTERPLAY SYSTEM')
  })

  it('maps node-graph', () => {
    expect(getClassificationLabel('node-graph')).toBe('RELATIONAL SYSTEM')
  })

  it('returns CLASSIFIED SYSTEM for unknown hint', () => {
    expect(getClassificationLabel('unknown')).toBe('CLASSIFIED SYSTEM')
  })

  it('handles undefined', () => {
    expect(getClassificationLabel(undefined)).toBe('CLASSIFIED SYSTEM')
  })
})

describe('resolveColor', () => {
  it('resolves known Tailwind color names', () => {
    expect(resolveColor('cyan-400')).toBe('#22d3ee')
    expect(resolveColor('red-500')).toBe('#ef4444')
  })

  it('passes through hex values', () => {
    expect(resolveColor('#ff0000')).toBe('#ff0000')
  })

  it('passes through rgb values', () => {
    expect(resolveColor('rgb(255,0,0)')).toBe('rgb(255,0,0)')
  })

  it('returns fallback for unknown names', () => {
    expect(resolveColor('not-a-color')).toBe('#6b7280')
  })

  it('returns fallback for null/undefined', () => {
    expect(resolveColor(null)).toBe('#6b7280')
    expect(resolveColor(undefined)).toBe('#6b7280')
  })

  it('respects custom fallback', () => {
    expect(resolveColor('nope', '#fff')).toBe('#fff')
  })
})

describe('computeRadialPositions', () => {
  it('places items in a circle', () => {
    const items = [{ name: 'A' }, { name: 'B' }, { name: 'C' }, { name: 'D' }]
    const result = computeRadialPositions(items, 100, 100, 50)
    expect(result).toHaveLength(4)
    // All items should have x/y coordinates
    result.forEach(item => {
      expect(typeof item.x).toBe('number')
      expect(typeof item.y).toBe('number')
    })
    // First item should be at top of circle (angle = -PI/2)
    expect(result[0].x).toBeCloseTo(100, 0) // cx
    expect(result[0].y).toBeCloseTo(50, 0)  // cy - radius
  })

  it('preserves original item properties', () => {
    const items = [{ name: 'A', rank: 'S' }]
    const result = computeRadialPositions(items, 0, 0, 10)
    expect(result[0].name).toBe('A')
    expect(result[0].rank).toBe('S')
  })

  it('handles empty array', () => {
    expect(computeRadialPositions([], 0, 0, 10)).toEqual([])
  })
})
