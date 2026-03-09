import { describe, it, expect } from 'vitest'
import {
  getBackgroundMotif,
  getRevealOverlay,
  getSysWarningColors,
  BACKGROUND_MOTIFS,
  REVEAL_OVERLAYS,
  SYS_WARNING_COLORS,
} from '../config/universePresentation'

describe('getBackgroundMotif', () => {
  it('returns SVG pattern for known keys', () => {
    expect(getBackgroundMotif('jagged')).toContain('url(')
    expect(getBackgroundMotif('noise')).toContain('url(')
    expect(getBackgroundMotif('circles')).toContain('url(')
    expect(getBackgroundMotif('paper')).toContain('url(')
    expect(getBackgroundMotif('temporal')).toContain('url(')
  })

  it('returns none for unknown keys', () => {
    expect(getBackgroundMotif('unknown')).toBe('none')
    expect(getBackgroundMotif(undefined)).toBe('none')
  })
})

describe('getRevealOverlay', () => {
  it('returns overlay config for known keys', () => {
    const overlay = getRevealOverlay('hatch-red')
    expect(overlay).toBeTruthy()
    expect(overlay.className).toContain('absolute')
  })

  it('returns null for unknown keys', () => {
    expect(getRevealOverlay('unknown')).toBeNull()
    expect(getRevealOverlay(undefined)).toBeNull()
  })
})

describe('getSysWarningColors', () => {
  it('returns color classes for known keys', () => {
    const colors = getSysWarningColors('red')
    expect(colors.text).toContain('red')
    expect(colors.dot).toContain('red')
  })

  it('falls back to cyan for unknown keys', () => {
    const colors = getSysWarningColors('unknown')
    expect(colors).toEqual(SYS_WARNING_COLORS.cyan)
  })
})

describe('config completeness', () => {
  it('has all expected motif keys', () => {
    expect(Object.keys(BACKGROUND_MOTIFS)).toEqual(
      expect.arrayContaining(['jagged', 'noise', 'circles', 'paper', 'temporal'])
    )
  })

  it('has all expected overlay keys', () => {
    expect(Object.keys(REVEAL_OVERLAYS)).toEqual(
      expect.arrayContaining(['hatch-red', 'pulse-purple', 'glow-border', 'glow-border-soft', 'gradient-top'])
    )
  })

  it('has all expected warning color keys', () => {
    expect(Object.keys(SYS_WARNING_COLORS)).toEqual(
      expect.arrayContaining(['red', 'blue', 'green', 'amber', 'cyan', 'purple'])
    )
  })
})
