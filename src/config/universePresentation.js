// Data-driven presentation config for universe-specific visual behavior.
// New universes get reasonable defaults without touching component code.

// Background motif SVG patterns keyed by the `backgroundMotif` field in each payload.
// New universes can pick an existing motif or add a new one here (one place).
export const BACKGROUND_MOTIFS = {
  jagged: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10l20 30-10 40 30-20 40 30-20-40 30-20-40 10z' stroke='rgba(255,255,255,0.7)' fill='none' stroke-width='0.75'/%3E%3C/svg%3E")`,
  noise: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.02' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
  circles: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='60' cy='60' r='35' stroke='rgba(255,255,255,0.8)' fill='none' stroke-width='1.5'/%3E%3Ccircle cx='60' cy='60' r='55' stroke='rgba(255,255,255,0.4)' fill='none' stroke-width='0.5' stroke-dasharray='4 4'/%3E%3C/svg%3E")`,
  paper: `url("data:image/svg+xml,%3Csvg width='250' height='250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.05' result='noise'/%3E%3CfeColorMatrix type='matrix' values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.8 0' in='noise'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paper)'/%3E%3C/svg%3E")`,
  temporal: `url("data:image/svg+xml,%3Csvg width='160' height='160' viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cline x1='80' y1='10' x2='80' y2='150' stroke='rgba(34,211,238,0.6)' stroke-width='0.5'/%3E%3Ccircle cx='80' cy='80' r='40' stroke='rgba(168,85,247,0.5)' fill='none' stroke-width='0.5' stroke-dasharray='3 5'/%3E%3Ccircle cx='80' cy='80' r='60' stroke='rgba(34,211,238,0.3)' fill='none' stroke-width='0.3' stroke-dasharray='2 8'/%3E%3Cline x1='30' y1='80' x2='130' y2='80' stroke='rgba(168,85,247,0.4)' stroke-width='0.3' stroke-dasharray='4 4'/%3E%3C/svg%3E")`,
}

// Reveal vignette overlay styles keyed by the `revealOverlay` field in each payload.
// Each returns Tailwind classes for the inner overlay div during the reveal sequence.
export const REVEAL_OVERLAYS = {
  'hatch-red': {
    className: 'absolute inset-0 opacity-10',
    style: { backgroundImage: 'repeating-linear-gradient(45deg, #ef4444 0, #ef4444 1px, transparent 1px, transparent 10px)' },
  },
  'pulse-purple': {
    className: 'absolute inset-0 opacity-40 shadow-[inset_0_0_120px_rgba(168,85,247,0.4)] animate-pulse',
    style: {},
  },
  'glow-border': {
    className: 'absolute inset-0 opacity-30 shadow-[inset_0_0_80px_rgba(34,211,238,0.3)] border-2 border-[#22d3ee]/20 rounded-xl m-1 transition-all duration-1000',
    style: {},
  },
  'glow-border-soft': {
    className: 'absolute inset-0 opacity-20 shadow-[inset_0_0_100px_rgba(34,211,238,0.3)] border border-cyan-400/10 rounded-xl m-1 transition-all duration-1000',
    style: {},
  },
  'gradient-top': {
    className: 'absolute inset-x-0 top-0 h-96 bg-linear-to-b from-amber-700/10 to-transparent animate-pulse',
    style: {},
  },
}

// SYS warning color classes keyed by the `sysWarningColor` in headerFlavor.
export const SYS_WARNING_COLORS = {
  red: { text: 'text-red-400/70', bg: 'bg-red-900/10', border: 'border-red-500/20', dot: 'bg-red-500', dotGlow: 'shadow-[0_0_6px_rgba(239,68,68,0.7)]' },
  blue: { text: 'text-blue-400/70', bg: 'bg-blue-900/10', border: 'border-blue-500/20', dot: 'bg-blue-500', dotGlow: 'shadow-[0_0_6px_rgba(59,130,246,0.7)]' },
  green: { text: 'text-green-400/70', bg: 'bg-green-900/10', border: 'border-green-500/20', dot: 'bg-green-500', dotGlow: 'shadow-[0_0_6px_rgba(34,197,94,0.7)]' },
  amber: { text: 'text-amber-400/70', bg: 'bg-amber-900/10', border: 'border-amber-500/20', dot: 'bg-amber-500', dotGlow: '' },
  cyan: { text: 'text-cyan-400/70', bg: 'bg-cyan-900/10', border: 'border-cyan-500/20', dot: 'bg-cyan-500', dotGlow: '' },
  purple: { text: 'text-purple-400/70', bg: 'bg-purple-900/10', border: 'border-purple-500/20', dot: 'bg-purple-500', dotGlow: '' },
}

export function getBackgroundMotif(motifKey) {
  return BACKGROUND_MOTIFS[motifKey] || 'none'
}

export function getRevealOverlay(overlayKey) {
  return REVEAL_OVERLAYS[overlayKey] || null
}

export function getSysWarningColors(colorKey) {
  return SYS_WARNING_COLORS[colorKey] || SYS_WARNING_COLORS.cyan
}
