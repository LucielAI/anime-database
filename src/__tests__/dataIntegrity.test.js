import { describe, it, expect } from 'vitest'
import { validateCorePayload } from '../utils/validateSchema'
import fs from 'fs'
import path from 'path'

const DATA_DIR = path.resolve(import.meta.dirname, '../data')
const slugs = ['aot', 'jjk', 'hxh', 'vinlandsaga', 'steinsgate']

describe('live payload integrity', () => {
  slugs.forEach(slug => {
    it(`${slug}.json passes schema validation with zero errors`, () => {
      const raw = fs.readFileSync(path.join(DATA_DIR, `${slug}.json`), 'utf-8')
      const data = JSON.parse(raw)
      const { errors } = validateCorePayload(data)
      expect(errors).toEqual([])
    })

    it(`${slug}.json has required presentation fields`, () => {
      const raw = fs.readFileSync(path.join(DATA_DIR, `${slug}.json`), 'utf-8')
      const data = JSON.parse(raw)
      expect(data.anime).toBeTruthy()
      expect(data.tagline).toBeTruthy()
      expect(data.visualizationHint).toBeTruthy()
      expect(data.visualizationReason).toBeTruthy()
      expect(data.themeColors).toBeTruthy()
    })

    it(`${slug}.json has aiInsights`, () => {
      const raw = fs.readFileSync(path.join(DATA_DIR, `${slug}.json`), 'utf-8')
      const data = JSON.parse(raw)
      expect(data.aiInsights).toBeTruthy()
      expect(typeof data.aiInsights.casual).toBe('string')
      expect(typeof data.aiInsights.deep).toBe('string')
    })

    it(`${slug}.json has headerFlavor for data-driven presentation`, () => {
      const raw = fs.readFileSync(path.join(DATA_DIR, `${slug}.json`), 'utf-8')
      const data = JSON.parse(raw)
      expect(data.headerFlavor).toBeTruthy()
      expect(data.headerFlavor.loreQuote).toBeTruthy()
      expect(data.headerFlavor.sysWarning).toBeTruthy()
      expect(data.headerFlavor.sysWarningColor).toBeTruthy()
    })

    it(`${slug}.json has backgroundMotif and revealOverlay`, () => {
      const raw = fs.readFileSync(path.join(DATA_DIR, `${slug}.json`), 'utf-8')
      const data = JSON.parse(raw)
      expect(data.backgroundMotif).toBeTruthy()
      expect(data.revealOverlay).toBeTruthy()
    })
  })
})


describe('demon slayer image mapping regression checks', () => {
  it('maps Douma to the expected MAL character id and image', () => {
    const raw = fs.readFileSync(path.join(DATA_DIR, 'demonslayer.core.json'), 'utf-8')
    const data = JSON.parse(raw)
    const douma = (data.characters || []).find(c => c.name === 'Douma')

    expect(douma).toBeTruthy()
    expect(douma.malId).toBe(170152)
    expect(douma.imageUrl).toContain('/characters/3/465011.jpg')
  })
})
