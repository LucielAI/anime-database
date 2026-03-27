import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Zap, Users, Network, Clock3, ShieldAlert } from 'lucide-react'
import { UNIVERSE_CATALOG } from '../data/index.js'

const TYPE_ICONS = {
  'counter-tree': { Icon: Zap, label: 'Counter System', color: 'text-amber-400', bg: 'bg-amber-400/20' },
  'node-graph': { Icon: Network, label: 'Network System', color: 'text-cyan-400', bg: 'bg-cyan-400/20' },
  'affinity-matrix': { Icon: Users, label: 'Affinity System', color: 'text-violet-400', bg: 'bg-violet-400/20' },
  'timeline': { Icon: Clock3, label: 'Timeline System', color: 'text-emerald-400', bg: 'bg-emerald-400/20' },
  'counterplay': { Icon: ShieldAlert, label: 'Counter System', color: 'text-amber-400', bg: 'bg-amber-400/20' },
}

function getSystemMeta(hint) {
  return TYPE_ICONS[hint] || { Icon: ShieldAlert, label: 'System', color: 'text-gray-400', bg: 'bg-gray-400/20' }
}

// Universes with strong anime imagery for the hero carousel — most visually iconic
const CAROUSEL_IDS = [
  'naruto', 'one-piece', 'dragonballz', 'jjk', 'aot',
  'hunter-x-hunter', 'solo-leveling', 'demon-slayer', 'blue-lock',
  'one-punch-man', 'bleach', 'chainsaw-man', 're-zero', 'mob-psycho-100',
]

export default function SpotlightCarousel() {
  const [index, setIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [touchStart, setTouchStart] = useState(null)
  const [touchDelta, setTouchDelta] = useState(0)
  const intervalRef = useRef(null)
  const trackRef = useRef(null)

  const candidates = UNIVERSE_CATALOG.filter(u => CAROUSEL_IDS.includes(u.id)).slice(0, 7)
  const count = candidates.length

  const goTo = useCallback((next) => {
    if (isTransitioning || count === 0) return
    setIsTransitioning(true)
    setIndex(((next % count) + count) % count)
    setTimeout(() => setIsTransitioning(false), 500)
  }, [isTransitioning, count])

  const next = useCallback(() => goTo(index + 1), [goTo, index])
  const prev = useCallback(() => goTo(index - 1), [goTo, index])

  // Auto-advance
  useEffect(() => {
    intervalRef.current = setInterval(next, 5000)
    return () => clearInterval(intervalRef.current)
  }, [next])

  // Pause on visibility change
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) {
        clearInterval(intervalRef.current)
      } else {
        intervalRef.current = setInterval(next, 5000)
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [next])

  // Touch/swipe handling
  const onTouchStart = useCallback((e) => {
    clearInterval(intervalRef.current)
    setTouchStart(e.touches[0].clientX)
    setTouchDelta(0)
  }, [])

  const onTouchMove = useCallback((e) => {
    if (touchStart === null) return
    setTouchDelta(e.touches[0].clientX - touchStart)
  }, [touchStart])

  const onTouchEnd = useCallback(() => {
    if (touchStart === null) return
    if (touchDelta < -50) next()
    else if (touchDelta > 50) prev()
    setTouchStart(null)
    setTouchDelta(0)
    // Restart auto-advance
    intervalRef.current = setInterval(next, 5000)
  }, [touchStart, touchDelta, next, prev])

  // Keyboard nav
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

  if (count === 0) return null

  const current = candidates[index]
  const meta = getSystemMeta(current.visualizationHint)
  const MetaIcon = meta.Icon

  // Preload adjacent images
  const prevIdx = (index - 1 + count) % count
  const nextIdx = (index + 1) % count

  return (
    <div className="w-full" ref={trackRef}>
      {/* Main carousel */}
      <div
        className="relative w-full overflow-hidden rounded-2xl border border-white/10 select-none"
        style={{ minHeight: 'clamp(280px, 45vw, 380px)' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        role="region"
        aria-label="Featured anime universe carousel"
        aria-live="polite"
      >
        {/* Image layers — prev, current, next */}
        {[prevIdx, index, nextIdx].map((uIdx, layerIdx) => {
          const u = candidates[uIdx]
          const isActive = uIdx === index
          const offset = (uIdx - index + count) % count
          // Only render current + adjacent
          if (offset > 1) return null
          return (
            <div
              key={u.id}
              className="absolute inset-0 transition-opacity duration-500"
              style={{
                backgroundImage: `url(${u.animeImageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: isActive ? (isTransitioning ? 0 : 1) : 0,
                zIndex: isActive ? 1 : 0,
                transform: `translateX(${offset === 0 ? touchDelta : offset * 100}%)`,
                transition: offset === 0 ? 'none' : undefined,
              }}
              aria-hidden={!isActive}
            />
          )
        })}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, rgba(5,5,8,0.96) 0%, rgba(5,5,8,0.82) 45%, rgba(5,5,8,0.3) 100%)',
          }}
        />
        {/* Mobile gradient */}
        <div
          className="absolute inset-0 z-10 pointer-events-none sm:hidden"
          style={{ background: 'linear-gradient(to top, rgba(5,5,8,0.98) 0%, rgba(5,5,8,0.5) 50%, rgba(5,5,8,0.1) 100%)' }}
        />

        {/* Content */}
        <div
          className="relative z-20 flex flex-col justify-end h-full p-5 md:p-8"
          style={{ minHeight: 'clamp(280px, 45vw, 380px)' }}
        >
          <div className="max-w-lg">
            {/* System badge + character count */}
            <div className="flex items-center gap-2 mb-2.5 md:mb-3">
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-[0.15em] uppercase ${meta.bg} ${meta.color}`}>
                <MetaIcon className="w-2.5 h-2.5" />
                {meta.label}
              </span>
              <span className="text-[9px] text-gray-500 hidden sm:block">{current.stats?.characters || 10}+ characters mapped</span>
            </div>

            {/* Title */}
            <h2
              className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white leading-[0.93] mb-2 transition-all duration-300"
              style={{
                opacity: isTransitioning ? 0 : 1,
                transform: `translateY(${isTransitioning ? 6 : 0}px)`,
              }}
            >
              {current.anime}
            </h2>

            {/* Tagline */}
            <p
              className="text-[11px] md:text-sm text-gray-400 leading-relaxed mb-4 line-clamp-2 max-w-md transition-all duration-300 delay-75"
              style={{
                opacity: isTransitioning ? 0 : 1,
                transform: `translateY(${isTransitioning ? 6 : 0}px)`,
              }}
            >
              {current.tagline}
            </p>

            {/* CTAs */}
            <div
              className="flex items-center gap-2 transition-all duration-300 delay-150"
              style={{ opacity: isTransitioning ? 0 : 1 }}
            >
              <Link
                to={`/universe/${current.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-cyan-400 hover:bg-cyan-300 active:scale-95 text-[#020617] text-[10px] font-bold tracking-[0.16em] uppercase transition-all min-h-[44px]"
              >
                Explore
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
              <Link
                to={`/compare?left=${current.id}&right=jjk`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-white/25 hover:border-white/50 active:scale-95 text-white/70 hover:text-white text-[10px] font-bold tracking-[0.16em] uppercase transition-all min-h-[44px]"
              >
                Compare
              </Link>
            </div>
          </div>
        </div>

        {/* Prev/Next arrows — touch-friendly 48px targets */}
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/40 hover:bg-black/70 border border-white/15 text-white/60 hover:text-white flex items-center justify-center transition-all active:scale-90 backdrop-blur-sm"
          aria-label="Previous universe"
          tabIndex={0}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/40 hover:bg-black/70 border border-white/15 text-white/60 hover:text-white flex items-center justify-center transition-all active:scale-90 backdrop-blur-sm"
          aria-label="Next universe"
          tabIndex={0}
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
          {candidates.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === index ? 'w-6 h-1.5 bg-cyan-400' : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        {/* Swipe hint for mobile (shows briefly on first load) */}
        <div className="absolute bottom-3 right-3 z-30 flex items-center gap-1 text-[9px] text-white/30 sm:hidden">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
          swipe
        </div>
      </div>

      {/* Thumbnail strip — horizontal scroll, hidden on very small screens */}
      <div
        className="flex gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        role="tablist"
        aria-label="Carousel universes"
      >
        {candidates.map((u, i) => (
          <button
            key={u.id}
            onClick={() => goTo(i)}
            role="tab"
            aria-selected={i === index}
            aria-label={u.anime}
            className={`shrink-0 flex items-center gap-2 rounded-lg px-2.5 py-1.5 border transition-all snap-start ${
              i === index
                ? 'border-cyan-400/60 bg-cyan-400/10 text-white'
                : 'border-white/10 bg-white/[0.03] text-gray-500 hover:border-white/20 hover:text-white'
            }`}
          >
            <img
              src={u.animeImageUrl}
              alt=""
              className="w-6 h-6 rounded object-cover shrink-0"
              loading="lazy"
              decoding="async"
            />
            <span className="text-[10px] font-bold uppercase tracking-[0.08em] whitespace-nowrap">{u.anime}</span>
          </button>
        ))}
      </div>

      {/* Preload adjacent images */}
      {count > 1 && (
        <>
          <link rel="preload" as="image" href={candidates[prevIdx].animeImageUrl} />
          <link rel="preload" as="image" href={candidates[nextIdx].animeImageUrl} />
        </>
      )}
    </div>
  )
}
