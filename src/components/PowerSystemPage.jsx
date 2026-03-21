import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Shield, Lock, Star, Zap, ChevronRight } from 'lucide-react'
import SeoHead from './SeoHead'
import { buildPowerSystemSeo, buildPowerSystemStructuredData } from '../utils/seo'

export default function PowerSystemPage({ preview, data, powerIndex }) {
  const [isSystemMode, setIsSystemMode] = useState(false)

  const powerSystem = data?.powerSystem || []
  const power = powerSystem[powerIndex]

  const seo = buildPowerSystemSeo(preview, power, powerIndex)
  const structuredData = buildPowerSystemStructuredData(preview, power, powerIndex)

  if (!power) {
    return (
      <div className="min-h-screen bg-[#050508] text-white font-mono flex items-center justify-center">
        <div className="text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-red-400 mb-2">Power System Not Found</p>
          <Link to={`/universe/${preview?.id}`} className="text-cyan-400 text-xs tracking-widest hover:text-cyan-300 transition-colors">
            ← Back to {preview?.anime || 'Universe'}
          </Link>
        </div>
      </div>
    )
  }

  const theme = data?.themeColors || {}
  const accentColor = theme.primary || '#22d3ee'
  const secondaryColor = theme.secondary || '#8b5cf6'
  const glowColor = theme.glow || 'rgba(34,211,238,0.08)'

  // Related power systems: all others in this universe
  const relatedPowers = powerSystem
    .map((p, i) => ({ ...p, index: i }))
    .filter((p) => p.index !== powerIndex)
    .slice(0, 4)

  const rules = data?.rules || []

  return (
    <div className="min-h-screen bg-[#050508] text-white font-mono selection:bg-cyan-500/30">
      <SeoHead {...seo} structuredData={structuredData} />

      {/* Back nav */}
      <div className="sticky top-0 z-50 bg-[#050508]/90 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
          <Link
            to={`/universe/${preview.id}`}
            className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-gray-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            {preview.anime}
          </Link>
          <span className="text-gray-700 text-xs">/</span>
          <span className="text-[10px] tracking-[0.2em] uppercase text-white/60 truncate">{power.name}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12">

        {/* Hero */}
        <div
          className="rounded-2xl border border-white/10 p-8 md:p-10 mb-8"
          style={{
            background: `radial-gradient(ellipse at top left, ${glowColor} 0%, transparent 60%), radial-gradient(ellipse at bottom right, ${accentColor}08 0%, transparent 60%)`,
            borderLeftColor: accentColor,
            borderLeftWidth: '3px',
          }}
        >
          <p className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: accentColor }}>
            {preview.anime} — Power System
          </p>

          <div className="flex items-start gap-4 mb-4">
            {power.icon && (
              <div
                className="text-3xl w-14 h-14 flex items-center justify-center rounded-xl shrink-0 border border-white/10"
                style={{ backgroundColor: `${accentColor}12` }}
              >
                {power.icon}
              </div>
            )}
            <div>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-none mb-2 break-words">
                {power.name}
              </h1>
              {power.subtitle && (
                <p className="text-sm font-bold tracking-widest uppercase" style={{ color: accentColor }}>
                  {isSystemMode ? (power.systemSubtitle || power.subtitle) : (power.loreSubtitle || power.subtitle)}
                </p>
              )}
            </div>
          </div>

          {/* LORE / SYS toggle */}
          <div className="flex mt-6">
            <div
              role="switch"
              aria-checked={isSystemMode}
              aria-label={`Switch to ${isSystemMode ? 'Lore' : 'System'} mode`}
              tabIndex={0}
              onClick={() => setIsSystemMode(!isSystemMode)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsSystemMode(!isSystemMode) } }}
              className="bg-black/40 p-1 rounded-full border border-white/10 flex items-center gap-1 cursor-pointer transition-all duration-500 relative overflow-hidden backdrop-blur-xl hover:border-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
            >
              <div
                className={`absolute top-1 bottom-1 w-[calc(50%-2px)] rounded-full transition-all duration-500 ease-in-out pointer-events-none ${isSystemMode ? 'translate-x-[calc(100%+2px)]' : 'translate-x-0'}`}
                style={{
                  backgroundColor: isSystemMode ? `${secondaryColor}18` : `${accentColor}18`,
                  borderColor: isSystemMode ? `${secondaryColor}60` : `${accentColor}60`,
                  borderWidth: '1px',
                  boxShadow: isSystemMode
                    ? `0 0 12px ${secondaryColor}30, inset 0 0 8px ${secondaryColor}10`
                    : `0 0 12px ${accentColor}30, inset 0 0 8px ${accentColor}10`,
                }}
              />
              <div
                className="px-5 py-2.5 z-10 flex items-center justify-center gap-2 transition-all duration-500 select-none pointer-events-none"
                style={{ color: !isSystemMode ? accentColor : '#4b5563', textShadow: !isSystemMode ? `0 0 10px ${accentColor}60` : 'none' }}
              >
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[10px] font-bold tracking-[0.2em]">LORE</span>
              </div>
              <div
                className="px-5 py-2.5 z-10 flex items-center justify-center gap-2 transition-all duration-500 select-none pointer-events-none"
                style={{ color: isSystemMode ? secondaryColor : '#4b5563', textShadow: isSystemMode ? `0 0 10px ${secondaryColor}60` : 'none' }}
              >
                <Shield className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[10px] font-bold tracking-[0.2em]">SYS</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Description */}
            <section className="bg-white/5 border border-white/10 rounded-xl p-6" style={{ borderLeftColor: accentColor, borderLeftWidth: '3px' }}>
              <h2 className="text-[10px] tracking-[0.3em] uppercase text-gray-500 mb-3">
                {isSystemMode ? '// SYSTEM MECHANICS' : '// LORE OVERVIEW'}
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                {isSystemMode ? power.systemDesc : power.loreDesc}
              </p>
            </section>

            {/* Signature Moment */}
            {power.signatureMoment && (
              <section className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-[10px] tracking-[0.3em] uppercase text-gray-500 mb-3">
                  <Star className="inline w-3 h-3 mr-1.5 mb-0.5" />
                  // SIGNATURE MOMENT
                </h2>
                <blockquote className="text-sm text-gray-300 italic leading-relaxed border-l-2 pl-4" style={{ borderColor: `${accentColor}60` }}>
                  &ldquo;{power.signatureMoment}&rdquo;
                </blockquote>
              </section>
            )}

            {/* Governing Rules */}
            {rules.length > 0 && (
              <section className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-[10px] tracking-[0.3em] uppercase text-gray-500 mb-4">
                  // {isSystemMode ? 'CONSTRAINT MATRIX' : 'GOVERNING RULES'}
                </h2>
                <div className="space-y-3">
                  {rules.slice(0, 5).map((rule, i) => {
                    const severityColor = {
                      fatal: '#ef4444',
                      high: '#fb923c',
                      medium: '#facc15',
                      low: '#4ade80',
                    }[rule.severity?.toLowerCase()] || '#6b7280'
                    return (
                      <div key={i} className="p-3 rounded-lg bg-black/30 border border-white/5">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest"
                            style={{ color: severityColor, backgroundColor: `${severityColor}15`, border: `1px solid ${severityColor}30` }}
                          >
                            {rule.severity}
                          </span>
                          <span className="text-xs font-bold text-gray-200">{rule.name}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-relaxed">
                          {isSystemMode ? (rule.systemDesc || rule.loreDesc) : rule.loreDesc}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Power metadata */}
            <div
              className="rounded-xl border border-white/10 p-5"
              style={{ background: `radial-gradient(ellipse at top, ${accentColor}08 0%, transparent 70%)` }}
            >
              <h2 className="text-[9px] tracking-[0.3em] uppercase text-gray-500 mb-4">// SYSTEM METADATA</h2>
              <dl className="space-y-3">
                <div className="flex justify-between items-center">
                  <dt className="text-[10px] text-gray-500 uppercase tracking-widest">Universe</dt>
                  <dd className="text-[11px] font-bold text-gray-200">{preview.anime}</dd>
                </div>
                {power.subtitle && (
                  <div className="flex justify-between items-center">
                    <dt className="text-[10px] text-gray-500 uppercase tracking-widest">Type</dt>
                    <dd className="text-[11px] font-bold text-gray-200 text-right">{power.subtitle}</dd>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <dt className="text-[10px] text-gray-500 uppercase tracking-widest">Index</dt>
                  <dd className="text-[11px] font-bold text-gray-200">#{powerIndex + 1} of {powerSystem.length}</dd>
                </div>
              </dl>
            </div>

            {/* Related power systems */}
            {relatedPowers.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h2 className="text-[9px] tracking-[0.3em] uppercase text-gray-500 mb-4">// OTHER MECHANICS</h2>
                <div className="space-y-2">
                  {relatedPowers.map((p) => (
                    <Link
                      key={p.index}
                      to={`/universe/${preview.id}/power/${p.index}`}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-black/30 border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all group"
                    >
                      {p.icon ? (
                        <span className="text-lg shrink-0 w-8 flex items-center justify-center">{p.icon}</span>
                      ) : (
                        <Zap className="w-4 h-4 shrink-0 text-gray-600" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-gray-200 truncate group-hover:text-white transition-colors">{p.name}</p>
                        {p.subtitle && <p className="text-[9px] text-gray-600 truncate">{p.subtitle}</p>}
                      </div>
                      <ChevronRight className="w-3 h-3 text-gray-600 group-hover:text-gray-400 shrink-0 transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Back to universe */}
            <Link
              to={`/universe/${preview.id}`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-300 transition-all"
            >
              <ArrowLeft className="w-3 h-3" />
              Full Universe Analysis
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
