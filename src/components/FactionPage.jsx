import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Users, ChevronRight, Shield, Lock, Crown, Swords, Layers, HelpCircle } from 'lucide-react'
import SeoHead from './SeoHead'
import { buildFactionSeo, buildFactionStructuredData } from '../utils/seo'

const ROLE_COLORS = {
  protagonist: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.3)' },
  antagonist: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' },
  neutral: { color: '#22d3ee', bg: 'rgba(34,211,238,0.12)', border: 'rgba(34,211,238,0.3)' },
  chaotic: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
  systemic: { color: '#6366f1', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)' },
}

export default function FactionPage({ preview, data, factionIndex }) {
  const [isSystemMode, setIsSystemMode] = useState(false)

  const factions = data?.factions || []
  const faction = factions[factionIndex]

  const seo = buildFactionSeo(preview, faction, factionIndex)
  const structuredData = buildFactionStructuredData(preview, faction, factionIndex)

  if (!faction) {
    return (
      <div className="min-h-screen bg-[#050508] text-white font-mono flex items-center justify-center">
        <div className="text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-red-400 mb-2">Faction Not Found</p>
          <Link to={`/universe/${preview?.id}`} className="text-cyan-400 text-xs tracking-widest hover:text-cyan-300 transition-colors">
            ← Back to {preview?.anime || 'Universe'}
          </Link>
        </div>
      </div>
    )
  }

  const theme = data?.themeColors || {}
  const roleStyle = ROLE_COLORS[faction.role?.toLowerCase()] || ROLE_COLORS.neutral
  const accentColor = roleStyle.color
  const themeAccent = theme.primary || '#22d3ee'
  const themeSecondary = theme.secondary || '#8b5cf6'
  const glowColor = theme.glow || 'rgba(34,211,238,0.08)'

  const characters = data?.characters || []

  // Related factions: all others in this universe
  const relatedFactions = factions
    .map((f, i) => ({ ...f, index: i }))
    .filter((f) => f.index !== factionIndex)
    .slice(0, 4)

  // Resolve key members to character indices
  const keyMemberLinks = (faction.keyMembers || []).map((memberName) => {
    const charIndex = characters.findIndex(
      (c) => c.name.toLowerCase() === memberName.toLowerCase()
    )
    return { name: memberName, charIndex: charIndex >= 0 ? charIndex : null }
  })

  // Leader character link
  const leaderCharIndex = faction.leader
    ? characters.findIndex((c) => c.name.toLowerCase() === faction.leader.toLowerCase())
    : -1

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
          <span className="text-[10px] tracking-[0.2em] uppercase text-white/60 truncate">{faction.name}</span>
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
          <p className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: themeAccent }}>
            {preview.anime} — Faction
          </p>

          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-none mb-3 break-words">
                {faction.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="px-2.5 py-1 rounded text-[10px] font-bold tracking-widest uppercase border"
                  style={{ backgroundColor: roleStyle.bg, color: roleStyle.color, borderColor: roleStyle.border }}
                >
                  {faction.role}
                </span>
                {faction.memberCount && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold tracking-widest uppercase border border-white/10 bg-white/5 text-gray-300">
                    <Users className="w-3 h-3" />
                    {faction.memberCount}
                  </span>
                )}
              </div>
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
                  backgroundColor: isSystemMode ? `${themeSecondary}18` : `${themeAccent}18`,
                  borderColor: isSystemMode ? `${themeSecondary}60` : `${themeAccent}60`,
                  borderWidth: '1px',
                  boxShadow: isSystemMode
                    ? `0 0 12px ${themeSecondary}30, inset 0 0 8px ${themeSecondary}10`
                    : `0 0 12px ${themeAccent}30, inset 0 0 8px ${themeAccent}10`,
                }}
              />
              <div
                className="px-5 py-2.5 z-10 flex items-center justify-center gap-2 transition-all duration-500 select-none pointer-events-none"
                style={{ color: !isSystemMode ? themeAccent : '#4b5563', textShadow: !isSystemMode ? `0 0 10px ${themeAccent}60` : 'none' }}
              >
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[10px] font-bold tracking-[0.2em]">LORE</span>
              </div>
              <div
                className="px-5 py-2.5 z-10 flex items-center justify-center gap-2 transition-all duration-500 select-none pointer-events-none"
                style={{ color: isSystemMode ? themeSecondary : '#4b5563', textShadow: isSystemMode ? `0 0 10px ${themeSecondary}60` : 'none' }}
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
                {isSystemMode ? '// SYSTEMIC FUNCTION' : '// FACTION OVERVIEW'}
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                {isSystemMode ? faction.systemDesc : faction.loreDesc}
              </p>
            </section>

            {/* Strength / Weakness */}
            {(faction.strength || faction.weakness) && (
              <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {faction.strength && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5" style={{ borderTopColor: '#4ade80', borderTopWidth: '2px' }}>
                    <h2 className="text-[10px] tracking-[0.3em] uppercase text-gray-500 mb-2">
                      // {isSystemMode ? 'STRATEGIC ADVANTAGE' : 'STRENGTH'}
                    </h2>
                    <p className="text-sm text-gray-300 leading-relaxed">{faction.strength}</p>
                  </div>
                )}
                {faction.weakness && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5" style={{ borderTopColor: '#ef4444', borderTopWidth: '2px' }}>
                    <h2 className="text-[10px] tracking-[0.3em] uppercase text-gray-500 mb-2">
                      // {isSystemMode ? 'STRUCTURAL EXPLOIT' : 'WEAKNESS'}
                    </h2>
                    <p className="text-sm text-gray-300 leading-relaxed">{faction.weakness}</p>
                  </div>
                )}
              </section>
            )}

            {/* Key Members */}
            {keyMemberLinks.length > 0 && (
              <section className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-[10px] tracking-[0.3em] uppercase text-gray-500 mb-4">
                  <Users className="inline w-3 h-3 mr-1.5 mb-0.5" />
                  // {isSystemMode ? 'KEY ACTORS' : 'KEY MEMBERS'}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {keyMemberLinks.map((member) =>
                    member.charIndex !== null ? (
                      <Link
                        key={member.name}
                        to={`/universe/${preview.id}/character/${member.charIndex}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/30 border border-white/10 hover:border-cyan-400/40 hover:bg-white/5 text-[11px] font-bold text-gray-200 hover:text-white transition-all"
                      >
                        {member.name}
                        <ChevronRight className="w-3 h-3 text-gray-600" />
                      </Link>
                    ) : (
                      <span
                        key={member.name}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-black/30 border border-white/5 text-[11px] font-bold text-gray-400"
                      >
                        {member.name}
                      </span>
                    )
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Faction metadata */}
            <div
              className="rounded-xl border border-white/10 p-5"
              style={{ background: `radial-gradient(ellipse at top, ${accentColor}08 0%, transparent 70%)` }}
            >
              <h2 className="text-[9px] tracking-[0.3em] uppercase text-gray-500 mb-4">// FACTION PROFILE</h2>
              <dl className="space-y-3">
                <div className="flex justify-between items-center">
                  <dt className="text-[10px] text-gray-500 uppercase tracking-widest">Role</dt>
                  <dd>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest"
                      style={{ backgroundColor: roleStyle.bg, color: roleStyle.color }}
                    >
                      {faction.role}
                    </span>
                  </dd>
                </div>
                {faction.leader && (
                  <div className="flex justify-between items-start gap-2">
                    <dt className="text-[10px] text-gray-500 uppercase tracking-widest shrink-0">
                      <Crown className="inline w-3 h-3 mr-1 mb-0.5" />
                      Leader
                    </dt>
                    <dd className="text-right">
                      {leaderCharIndex >= 0 ? (
                        <Link
                          to={`/universe/${preview.id}/character/${leaderCharIndex}`}
                          className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          {faction.leader} →
                        </Link>
                      ) : (
                        <span className="text-[11px] font-bold text-gray-200">{faction.leader}</span>
                      )}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <dt className="text-[10px] text-gray-500 uppercase tracking-widest">Universe</dt>
                  <dd className="text-[11px] font-bold text-gray-200">{preview.anime}</dd>
                </div>
                {faction.memberCount && (
                  <div className="flex justify-between items-center">
                    <dt className="text-[10px] text-gray-500 uppercase tracking-widest">Members</dt>
                    <dd className="text-[11px] font-bold text-gray-200">{faction.memberCount}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Related factions */}
            {relatedFactions.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h2 className="text-[9px] tracking-[0.3em] uppercase text-gray-500 mb-4">// OTHER FACTIONS</h2>
                <div className="space-y-2">
                  {relatedFactions.map((f) => {
                    const fStyle = ROLE_COLORS[f.role?.toLowerCase()] || ROLE_COLORS.neutral
                    return (
                      <Link
                        key={f.index}
                        to={`/universe/${preview.id}/faction/${f.index}`}
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-black/30 border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all group"
                      >
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: fStyle.color }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-gray-200 truncate group-hover:text-white transition-colors">{f.name}</p>
                          <p className="text-[9px] uppercase tracking-widest" style={{ color: fStyle.color }}>{f.role}</p>
                        </div>
                        <ChevronRight className="w-3 h-3 text-gray-600 group-hover:text-gray-400 shrink-0 transition-colors" />
                      </Link>
                    )
                  })}
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
