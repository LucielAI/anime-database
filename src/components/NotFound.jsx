import { Link } from 'react-router-dom'
import { Home, Search, Compass, ArrowRight } from 'lucide-react'
import { UNIVERSE_CATALOG } from '../data/index.js'

function RandomUniverseButton() {
  const handleRandom = () => {
    const random = UNIVERSE_CATALOG[Math.floor(Math.random() * UNIVERSE_CATALOG.length)]
    window.location.href = `/universe/${random.id}`
  }

  return (
    <button
      onClick={handleRandom}
      className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-cyan-400/40 bg-cyan-400/10 hover:bg-cyan-400/20 text-[10px] font-bold tracking-[0.2em] uppercase text-cyan-200 transition-all cursor-pointer min-h-[44px]"
    >
      <Compass className="w-3.5 h-3.5" />
      Explore Random Universe
    </button>
  )
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050508] text-white font-mono flex flex-col items-center justify-center px-6 py-20">
      <div className="text-center max-w-lg mx-auto">
        {/* 404 Display */}
        <div className="mb-8">
          <p className="text-[10px] tracking-[0.3em] uppercase text-cyan-400/70 mb-3">System Error</p>
          <h1 className="text-8xl md:text-9xl font-black tracking-tighter text-white/10 select-none">
            404
          </h1>
          <div className="-mt-6">
            <p className="text-lg md:text-xl font-bold uppercase tracking-tight text-white/80">
              Universe Not Found
            </p>
          </div>
        </div>

        {/* Explanation */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 mb-8">
          <p className="text-xs text-gray-400 leading-relaxed mb-4">
            This universe doesn't exist in the archive yet — or the path you followed led somewhere that collapsed.
          </p>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            The archive currently covers {UNIVERSE_CATALOG.length} universes. Every path not taken is a system waiting to be mapped.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex flex-col items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-cyan-400 text-[#020617] font-bold text-[10px] tracking-[0.2em] uppercase hover:bg-cyan-300 transition-colors min-h-[44px]"
          >
            <Home className="w-3.5 h-3.5" />
            Return to Archive Home
          </Link>

          <Link
            to="/universes"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-300 transition-all min-h-[44px]"
          >
            <Search className="w-3.5 h-3.5" />
            Browse All Universes
          </Link>

          <RandomUniverseButton />

          <p className="text-[10px] text-gray-600 mt-4 tracking-wider">
            Found a broken link?{' '}
            <a
              href="https://www.tiktok.com/@hashi.ai"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400/60 hover:text-cyan-400 transition-colors"
            >
              Let us know →
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
