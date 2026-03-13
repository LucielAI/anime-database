import { describe, it, expect } from 'vitest'
import { validateCorePayload, validateExtendedDataset } from '../utils/validateSchema'

// Minimal valid payload skeleton
function makePayload(overrides = {}) {
  return {
    anime: 'Test Anime',
    tagline: 'A test universe',
    malId: 12345,
    themeColors: {
      primary: '#22d3ee', secondary: '#8b5cf6', accent: '#f59e0b',
      glow: 'rgba(34,211,238,0.35)', tabActive: '#22d3ee',
      badgeBg: 'rgba(139,92,246,0.12)', badgeText: '#8b5cf6',
      modeGlow: 'rgba(34,211,238,0.25)', heroGradient: 'rgba(5,5,20,0.95)',
    },
    visualizationHint: 'node-graph',
    visualizationReason: 'Because relationships define this universe.',
    powerSystem: [{ name: 'Nen', loreDesc: 'Life energy', systemDesc: 'Energy API', loreSubtitle: 'sub', systemSubtitle: 'sub' }],
    characters: [makeCharacter('Hero'), makeCharacter('Villain')],
    factions: [{ name: 'Heroes', role: 'protagonist', loreDesc: 'Good guys', systemDesc: 'Main process' }],
    rules: [{ name: 'Rule 1', severity: 'high', loreSubtitle: 'sub', systemSubtitle: 'sub', loreConsequence: 'desc', systemEquivalent: 'desc' }],
    rankings: {},
    relationships: [{ source: 'Hero', target: 'Villain', type: 'enemy', loreDesc: 'They fight' }],
    aiInsights: { casual: 'Fun take', deep: 'Mechanics-focused take' },
    ...overrides,
  }
}

function makeCharacter(name, overrides = {}) {
  return {
    name, title: 'The One', rank: 'S', dangerLevel: 8,
    loreBio: 'A hero.', systemBio: 'Main process.',
    gradientFrom: 'red-500', gradientTo: 'red-900',
    accentColor: 'cyan-400', icon: '⚡', signatureMoment: 'Big moment',
    imageUrl: 'https://cdn.myanimelist.net/images/characters/1/1.jpg',
    ...overrides,
  }
}

describe('validateCorePayload', () => {
  it('passes with a valid payload', () => {
    const { errors } = validateCorePayload(makePayload())
    expect(errors).toHaveLength(0)
  })

  it('reports missing required top-level fields', () => {
    const { errors } = validateCorePayload({ anime: 'Test' })
    expect(errors.length).toBeGreaterThan(0)
    expect(errors.some(e => e.includes('tagline'))).toBe(true)
  })

  it('reports missing theme color fields', () => {
    const { errors } = validateCorePayload(makePayload({ themeColors: { primary: '#fff' } }))
    expect(errors.some(e => e.includes('themeColors missing'))).toBe(true)
  })

  it('rejects invalid visualization hints', () => {
    const { errors } = validateCorePayload(makePayload({ visualizationHint: 'invalid-hint' }))
    expect(errors.some(e => e.includes('Invalid visualizationHint'))).toBe(true)
  })

  it('validates character image URLs against allowlist', () => {
    const badChar = makeCharacter('Bad', { imageUrl: 'https://evil.com/img.jpg' })
    const { errors } = validateCorePayload(makePayload({ characters: [badChar] }))
    expect(errors.some(e => e.includes('ALLOWED_IMAGE_HOSTS'))).toBe(true)
  })

  it('accepts null imageUrl with _fetchFailed flag', () => {
    const fallbackChar = makeCharacter('Missing', { imageUrl: null, _fetchFailed: true })
    const { errors } = validateCorePayload(makePayload({ characters: [fallbackChar] }))
    const imageErrors = errors.filter(e => e.includes('imageUrl') || e.includes('fetchFailed'))
    expect(imageErrors).toHaveLength(0)
  })

  it('warns on duplicate character imageUrl values', () => {
    const shared = 'https://cdn.myanimelist.net/images/characters/1/1.jpg'
    const { warnings } = validateCorePayload(makePayload({
      characters: [
        makeCharacter('Hero', { imageUrl: shared, malId: 11 }),
        makeCharacter('Villain', { imageUrl: shared, malId: 22 }),
      ]
    }))
    expect(warnings.some(w => w.includes('Duplicate character imageUrl detected'))).toBe(true)
  })

  it('warns on duplicate character malId values', () => {
    const { warnings } = validateCorePayload(makePayload({
      characters: [
        makeCharacter('Hero', { malId: 999 }),
        makeCharacter('Villain', { malId: 999, imageUrl: 'https://cdn.myanimelist.net/images/characters/2/2.jpg' }),
      ]
    }))
    expect(warnings.some(w => w.includes('Duplicate character malId detected'))).toBe(true)
  })

  it('errors on invalid character malId values', () => {
    const { errors } = validateCorePayload(makePayload({
      characters: [makeCharacter('Broken', { malId: -1 })]
    }))
    expect(errors.some(e => e.includes('invalid malId'))).toBe(true)
  })

  it('errors when imageUrl is null without _fetchFailed', () => {
    const noFlag = makeCharacter('NoFlag', { imageUrl: null })
    const { errors } = validateCorePayload(makePayload({ characters: [noFlag] }))
    expect(errors.some(e => e.includes('_fetchFailed'))).toBe(true)
  })

  it('validates relationship types', () => {
    const { errors } = validateCorePayload(makePayload({
      relationships: [{ source: 'Hero', target: 'Villain', type: 'romance' }]
    }))
    expect(errors.some(e => e.includes('invalid type'))).toBe(true)
  })

  it('validates rule severity', () => {
    const { errors } = validateCorePayload(makePayload({
      rules: [{ name: 'Rule', severity: 'extreme', loreSubtitle: 's', systemSubtitle: 's' }]
    }))
    expect(errors.some(e => e.includes('invalid severity'))).toBe(true)
  })


  it('errors on missing rule runtime body fields', () => {
    const { errors } = validateCorePayload(makePayload({
      rules: [{ name: 'Rule', severity: 'high', loreSubtitle: 's', systemSubtitle: 's' }]
    }))
    expect(errors.some(e => e.includes('loreConsequence'))).toBe(true)
    expect(errors.some(e => e.includes('systemEquivalent'))).toBe(true)
  })

  it('errors on missing counterplay runtime fields', () => {
    const { errors } = validateCorePayload(makePayload({
      visualizationHint: 'counter-tree',
      counterplay: [{ attacker: 'A' }]
    }))
    expect(errors.some(e => e.includes('counterplay'))).toBe(true)
  })


  it('rejects malformed top-level types', () => {
    const { errors } = validateCorePayload(makePayload({
      malId: '123',
      rankings: [],
      relationships: {}
    }))
    expect(errors.some(e => e.includes('malId'))).toBe(true)
    expect(errors.some(e => e.includes('rankings must be an object'))).toBe(true)
    expect(errors.some(e => e.includes('relationships must be an array'))).toBe(true)
  })

  it('rejects hex character gradient values', () => {
    const { errors } = validateCorePayload(makePayload({
      characters: [makeCharacter('Hexy', { gradientFrom: '#111111' })]
    }))
    expect(errors.some(e => e.includes('Tailwind color token'))).toBe(true)
  })

  it('validates faction roles', () => {
    const { errors } = validateCorePayload(makePayload({
      factions: [{ name: 'F', role: 'anti-hero' }]
    }))
    expect(errors.some(e => e.includes('invalid role'))).toBe(true)
  })

  it('errors when aiInsights is missing', () => {
    const payload = makePayload()
    delete payload.aiInsights
    const { errors } = validateCorePayload(payload)
    expect(errors.some(e => e.includes('aiInsights'))).toBe(true)
  })

  it('validates aiInsights structure when present', () => {
    const { errors } = validateCorePayload(makePayload({
      aiInsights: { casual: '', deep: 'Analysis' }
    }))
    expect(errors.some(e => e.includes('casual'))).toBe(true)
  })

  it('passes valid aiInsights', () => {
    const { errors } = validateCorePayload(makePayload({
      aiInsights: { casual: 'Fun take', deep: 'Deep take' }
    }))
    const aiErrors = errors.filter(e => e.includes('aiInsights'))
    expect(aiErrors).toHaveLength(0)
  })

  it('warns about off-graph relationship nodes', () => {
    const { warnings } = validateCorePayload(makePayload({
      relationships: [{ source: 'Hero', target: 'Ghost', type: 'ally' }]
    }))
    expect(warnings.some(w => w.includes('off-graph'))).toBe(true)
  })

  it('warns about structural density', () => {
    // node-graph wants 8+ relationships, we only give 1
    const { warnings } = validateCorePayload(makePayload())
    expect(warnings.some(w => w.includes('thin'))).toBe(true)
  })
})

describe('validateExtendedDataset', () => {
  it('accepts valid extended dataset', () => {
    const { errors } = validateExtendedDataset({
      anime: 'Test',
      structuralThesis: 'Combat',
      characters: [],
    })
    expect(errors).toHaveLength(0)
  })

  it('rejects non-object input', () => {
    const { errors } = validateExtendedDataset('string')
    expect(errors.length).toBeGreaterThan(0)
  })

  it('requires anime field', () => {
    const { errors } = validateExtendedDataset({ characters: [] })
    expect(errors.some(e => e.includes('anime'))).toBe(true)
  })

  it('validates collection fields are arrays', () => {
    const { errors } = validateExtendedDataset({ anime: 'Test', characters: 'not array' })
    expect(errors.some(e => e.includes('characters'))).toBe(true)
  })
})
