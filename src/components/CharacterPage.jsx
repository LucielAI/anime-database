import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Shield, Lock, Zap, Star, ChevronRight } from 'lucide-react'
import ImageWithFallback from './ImageWithFallback'
import DangerBar from './DangerBar'
import SeoHead from './SeoHead'
import { buildCharacterSeo, buildCharacterStructuredData } from '../utils/seo'
import { resolveColor } from '../utils/resolveColor'

const DANGER_LABELS = {
  1: 'MINIMAL',
  2: 'MINIMAL',
  3: 'LOW',
  4: 'LOW',
  5: 'MODERATE',
  6: 'MODERATE',
  7: 'HIGH',
  8: 'HIGH',
  9: 'CRITICAL',
  10: 'ABSOLUTE',
}

const ROLE_BADGE_COLORS = {
  ally: { bg: 'rgba(34,211,238,0.15)', text: '#22d3ee', border: 'rgba(34,211,238,0.3)' },
  enemy: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', border: 'rgba(239,68,68,0.3)' },
  betrayal: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
  mirror: { bg: 'rgba(168,85,247,0.15)', text: '#a855f7', border: 'rgba(168,85,247,0.3)' },
  mentor: { bg: 'rgba(34,211,238,0.15)', text: '#22d3ee', border: 'rgba(34,211,238,0.3)' },
  rival: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
  dependent: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6', border: 'rgba(59,130,246,0.3)' },
  counter: { bg: 'rgba(16,185,129,0.15)', text: '#10b981', border: 'rgba(16,185,129,0.3)' },
  successor: { bg: 'rgba(34,211,238,0.15)', text: '#22d3ee', border: 'rgba(34,211,238,0.3)' },
}

export default function CharacterPage({ preview, data, charIndex }) {
  const [isSystemMode, setIsSystemMode] = useState(false)

  const characters = data?.characters || []
  const character = characters[charIndex]

  const seo = buildCharacterSeo(preview, character, charIndex)
  const structuredData = buildCharacterStructuredData(preview, character, charIndex)

  if (!character) {
    return (
      <div className="min-h-screen bg-[#050508] text-white font-mono flex items-center justify-center">
        <div className="text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-red-400 mb-2">Entity Not Found</p>
          <Link to={`/universe/${preview?.id}`} className="text-cyan-400 text-xs tracking-widest hover:text-cyan-300 transition-colors">
            ← Back to {preview?.anime || 'Universe'}
          </Link>
        </div>
      </div>
    )
  }

  const accentHex = resolveColor(character.accentColor, '#22d3ee')
  const gradientFromHex = resolveColor(character.gradientFrom, '#0f172a')
  const gradientToHex = resolveColor(character.gradientTo, '#1e293b')

  const dangerLevel = character.dangerLevel || 0
  const dangerLabel = DANGER_LABELS[Math.round(dangerLevel)] || 'UNKNOWN'

  // Related characters: all others in same universe
  const relatedChars = characters
    .map((c, i) => ({ ...c, index: i }))
    .filter((c) => c.index !== charIndex)
    .slice(0, 4)

  // Relationships involving this character
  const relationships = (data?.relationships || []).filter(
    (r) => r.source === character.name || r.target === character.name
  )

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
          <span className="text-[10px] tracking-[0.2em] uppercase text-white/60 truncate">{character.name}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12">

        {/* Hero Section */}
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8 mb-10">

          {/* Character image */}
          <div className="mx-auto md:mx-0 w-56 md:w-full">
            <div
              className="rounded-xl overflow-hidden border border-white/10 aspect-[225/350] w-full"
              style={{ boxShadow: `0 0 40px ${accentHex}20` }}
            >
              <ImageWithFallback
                src={character.imageUrl}
                alt={character.name}
                gradientFrom={character.gradientFrom}
                gradientTo={character.gradientTo}
                accentColor={character.accentColor}
                fetchFailed={character._fetchFailed}
              />
            </div>
          </div>

          {/* Identity block */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Universe label */}
              <p className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: accentHex }}>
                {preview.anime}
              </p>

              {/* Name */}
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-none mb-3 break-words">
                {character.name}
              </h1>

              {/* Title + Rank */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {character.title && (
                  <span
                    className="px-2.5 py-1 rounded text-[10px] font-bold tracking-widest uppercase border"
                    style={{ backgroundColor: `${accentHex}15`, color: accentHex, borderColor: `${accentHex}40` }}
                  >
                    {character.title}
                  </span>
                )}
                {character.rank && (
                  <span className="px-2.5 py-1 rounded text-[10px] font-bold tracking-widest uppercase border border-white/10 bg-white/5 text-gray-300">
                    {character.rank}
                  </span>
                )}
              </div>

              {/* Icon */}
              {character.icon && (
                <p className="text-4xl mb-4 leading-none">{character.icon}</p>
              )}
            </div>

            {/* Danger level */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] tracking-[0.3em] uppercase text-gray-500">Threat Level</span>
                <span
                  className="text-[9px] tracking-[0.25em] uppercase font-bold"
                  style={{ color: dangerLevel >= 9 ? '#ef4444' : dangerLevel >= 7 ? '#fb923c' : dangerLevel >= 5 ? '#facc15' : '#4ade80' }}
                >
                  {dangerLabel} — {dangerLevel}/10
                </span>
              </div>
              <DangerBar level={dangerLevel} />
            </div>
          </div>
        </div>

        {/* LORE / SYS toggle */}
        <div className="flex justify-center mb-8">
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
                backgroundColor: isSystemMode ? `${accentHex}18` : `${accentHex}18`,
                borderColor: `${accentHex}60`,
                borderWidth: '1px',
                boxShadow: `0 0 12px ${accentHex}30, inset 0 0 8px ${accentHex}10`,
              }}
            />
            <div
              className="px-5 py-2.5 z-10 flex items-center justify-center gap-2 transition-all duration-500 select-none pointer-events-none"
              style={{ color: !isSystemMode ? accentHex : '#4b5563', textShadow: !isSystemMode ? `0 0 10px ${accentHex}60` : 'none' }}
            >
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[10px] font-bold tracking-[0.2em]">LORE</span>
            </div>
            <div
              className="px-5 py-2.5 z-10 flex items-center justify-center gap-2 transition-all duration-500 select-none pointer-events-none"
              style={{ color: isSystemMode ? accentHex : '#4b5563', textShadow: isSystemMode ? `0 0 10px ${accentHex}60` : 'none' }}
            >
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[10px] font-bold tracking-[0.2em]">SYS</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main content column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Bio */}
            <section className="bg-white/5 border border-white/10 rounded-xl p-6" style={{ borderLeftColor: accentHex, borderLeftWidth: '3px' }}>
              <h2 className="text-[10px] tracking-[0.3em] uppercase text-gray-500 mb-3">
                {isSystemMode ? '// SYSTEM PROFILE' : '// OPERATIVE DOSSIER'}
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                {isSystemMode ? character.systemBio : character.loreBio}
              </p>
            </section>

            {/* Primary Ability */}
            {character.primaryAbility && (
              <section className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-[10px] tracking-[0.3em] uppercase text-gray-500 mb-3">
                  <Zap className="inline w-3 h-3 mr-1.5 mb-0.5" />
                  {isSystemMode ? '// PRIMARY FUNCTION' : '// SIGNATURE ABILITY'}
                </h2>
                <p
                  className="text-base md:text-lg font-bold uppercase tracking-wide"
                  style={{ color: accentHex }}
                >
                  {character.primaryAbility}
                </p>
              </section>
            )}

            {/* Signature Moment */}
            {character.signatureMoment && (
              <section className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-[10px] tracking-[0.3em] uppercase text-gray-500 mb-3">
                  <Star className="inline w-3 h-3 mr-1.5 mb-0.5" />
                  // SIGNATURE MOMENT
                </h2>
                <blockquote className="text-sm text-gray-300 italic leading-relaxed border-l-2 pl-4" style={{ borderColor: `${accentHex}60` }}>
                  &ldquo;{character.signatureMoment}&rdquo;
                </blockquote>
              </section>
            )}

            {/* Relationships */}
            {relationships.length > 0 && (
              <section className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-[10px] tracking-[0.3em] uppercase text-gray-500 mb-4">
                  // {isSystemMode ? 'DEPENDENCY EDGES' : 'RELATIONSHIPS'}
                </h2>
                <div className="space-y-3">
                  {relationships.map((rel, i) => {
                    const isSource = rel.source === character.name
                    const other = isSource ? rel.target : rel.source
                    const arrow = isSource ? '→' : '←'
                    const badgeColor = ROLE_BADGE_COLORS[rel.type] || ROLE_BADGE_COLORS.ally
                    return (
                      <div key={i} className="flex flex-wrap items-start gap-3 p-3 rounded-lg bg-black/30 border border-white/5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-gray-300 font-bold">{arrow} {other}</span>
                          <span
                            className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase"
                            style={{ backgroundColor: badgeColor.bg, color: badgeColor.text, border: `1px solid ${badgeColor.border}` }}
                          >
                            {rel.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 w-full leading-relaxed">
                          {isSystemMode ? (rel.systemDesc || rel.loreDesc) : rel.loreDesc}
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

            {/* Stats card */}
            <div
              className="rounded-xl border border-white/10 p-5"
              style={{ background: `linear-gradient(160deg, ${gradientFromHex}80 0%, ${gradientToHex}80 100%)` }}
            >
              <h2 className="text-[9px] tracking-[0.3em] uppercase text-gray-500 mb-4">// ENTITY STATS</h2>
              <dl className="space-y-3">
                {character.rank && (
                  <div className="flex justify-between items-center">
                    <dt className="text-[10px] text-gray-500 uppercase tracking-widest">Rank</dt>
                    <dd className="text-[11px] font-bold text-gray-200">{character.rank}</dd>
                  </div>
                )}
                {character.title && (
                  <div className="flex justify-between items-center">
                    <dt className="text-[10px] text-gray-500 uppercase tracking-widest">Title</dt>
                    <dd className="text-[11px] font-bold text-gray-200">{character.title}</dd>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <dt className="text-[10px] text-gray-500 uppercase tracking-widest">Threat</dt>
                  <dd
                    className="text-[11px] font-bold"
                    style={{ color: dangerLevel >= 9 ? '#ef4444' : dangerLevel >= 7 ? '#fb923c' : dangerLevel >= 5 ? '#facc15' : '#4ade80' }}
                  >
                    {dangerLevel}/10
                  </dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-[10px] text-gray-500 uppercase tracking-widest">Universe</dt>
                  <dd className="text-[11px] font-bold text-gray-200">{preview.anime}</dd>
                </div>
              </dl>
            </div>

            {/* Related characters */}
            {relatedChars.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h2 className="text-[9px] tracking-[0.3em] uppercase text-gray-500 mb-4">// OTHER ENTITIES</h2>
                <div className="space-y-2">
                  {relatedChars.map((c) => {
                    const cAccent = resolveColor(c.accentColor, '#22d3ee')
                    return (
                      <Link
                        key={c.index}
                        to={`/universe/${preview.id}/character/${c.index}`}
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-black/30 border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all group"
                      >
                        <div
                          className="w-8 h-8 rounded-full overflow-hidden shrink-0 border"
                          style={{ borderColor: `${cAccent}40` }}
                        >
                          <ImageWithFallback
                            src={c.imageUrl}
                            alt={c.name}
                            gradientFrom={c.gradientFrom}
                            gradientTo={c.gradientTo}
                            accentColor={c.accentColor}
                            fetchFailed={c._fetchFailed}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-gray-200 truncate group-hover:text-white transition-colors">{c.name}</p>
                          {c.rank && <p className="text-[9px] text-gray-600 truncate">{c.rank}</p>}
                        </div>
                        <ChevronRight className="w-3 h-3 text-gray-600 group-hover:text-gray-400 shrink-0 transition-colors" />
                      </Link>
                    )
                  })}
                </div>
                {characters.length > 5 && (
                  <Link
                    to={`/universe/${preview.id}`}
                    className="mt-3 block text-center text-[10px] text-gray-600 hover:text-cyan-400 transition-colors tracking-widest uppercase"
                  >
                    View all {characters.length} entities →
                  </Link>
                )}
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
