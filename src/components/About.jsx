import { Link } from 'react-router-dom'
import { ArrowLeft, BrainCircuit, Target, Users } from 'lucide-react'
import SeoHead from './SeoHead'

export default function About() {
  return (
    <div className="min-h-screen bg-[#050508] text-white font-mono px-6 py-14">
      <SeoHead
        title="About the Archive | Anime Architecture Archive"
        description="Anime Architecture Archive maps fictional universes as structured systems. Built by Hashi.Ai for fans who think deeper about power systems, worldbuilding, and causal logic."
        canonicalUrl="https://animearchive.app/about"
        type="website"
      />
      <main className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-gray-400 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-3 h-3" />
            Back to Archive
          </Link>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-3">About This Archive</h1>
          <p className="text-xs text-gray-400">Created by Hashi.Ai · Built for fans who think deeper.</p>
        </div>

        <div className="space-y-8">
          <section className="rounded-xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-2 mb-4">
              <BrainCircuit className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-white">What is Anime Architecture Archive?</h2>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed mb-3">
              Anime Architecture Archive maps fictional anime universes as structured systems — not just summarizing plots, but analyzing the underlying mechanics that make each world function. Power systems, governing rules, faction dynamics, causal chains, and strategic constraints.
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Each universe is structured as a dual-mode experience: a lore view for casual exploration and a system mode for deep analysis. Every data point is categorized, cross-referenced, and validated against the source material.
            </p>
          </section>

          <section className="rounded-xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-white">Why It Exists</h2>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed mb-3">
              Most anime wikis are databases. This archive is an analysis engine. We don't just list characters and abilities — we map the structural logic of each universe: why certain powers counter others, how institutions shape outcomes, and what the unbreakable rules mean for every decision.
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Built for fans who watch anime multiple times, for writers who need consistent power scaling, for analysts who want structured comparisons across universes. If you've ever wanted to understand <em className="text-gray-300 not-italic">why</em> a fight unfolded the way it did — this is the archive for you.
            </p>
          </section>

          <section className="rounded-xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-white">The Creator</h2>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed mb-3">
              Hashi.Ai is an AI-native project focused on structured intelligence and system-level analysis. Anime Architecture Archive is the first proof of concept — a demonstration that complex fictional universes can be rendered as interactive analytical systems, maintained by AI, useful for humans.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <a
                href="https://www.tiktok.com/@hashi.ai"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-bold tracking-[0.16em] uppercase text-gray-300 transition-all"
              >
                Follow on TikTok →
              </a>
              <a
                href="https://buymeacoffee.com/hashiai"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-emerald-300/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-[10px] font-bold tracking-[0.16em] uppercase text-emerald-300 transition-all"
              >
                Support this project →
              </a>
            </div>
          </section>

          <section className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-white mb-4">Currently Covering</h2>
            <p className="text-xs text-gray-400 leading-relaxed mb-3">
              15 anime universes across multiple genres: shonen action, psychological thriller, dark fantasy, sci-fi thriller, and more.
            </p>
            <p className="text-[10px] text-gray-500 tracking-wider">
              Request a universe using the form at the bottom of any universe page, or via the Community Pulse section on the homepage.
            </p>
          </section>
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/universes"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-cyan-400 text-[#020617] font-bold text-[10px] tracking-[0.2em] uppercase hover:bg-cyan-300 transition-colors"
          >
            Explore the Archive
          </Link>
        </div>
      </main>
    </div>
  )
}
