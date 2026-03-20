import { Link } from 'react-router-dom'
import { ArrowLeft, BrainCircuit, Target, Users, Zap, Compass, BookOpen } from 'lucide-react'
import SeoHead from './SeoHead'

const SYSTEM_TYPES = [
  {
    label: 'Timeline System',
    example: 'Attack on Titan, Steins;Gate',
    description: 'Causality itself is the battlefield. History, prophecy, and temporal mechanics shape every outcome.',
    color: 'text-purple-300',
    bg: 'bg-purple-400/10 border-purple-400/20',
  },
  {
    label: 'Counterplay System',
    example: 'Jujutsu Kaisen, Demon Slayer',
    description: 'Ability matchups define victory. Every technique has a counter — the question is who deploys first.',
    color: 'text-amber-300',
    bg: 'bg-amber-400/10 border-amber-400/20',
  },
  {
    label: 'Relational System',
    example: 'Chainsaw Man, My Hero Academia',
    description: 'Power flows through networks of obligation, loyalty, and control. Who you know determines what you can do.',
    color: 'text-cyan-300',
    bg: 'bg-cyan-400/10 border-cyan-400/20',
  },
]

export default function About() {
  return (
    <div className="min-h-screen bg-[#050508] text-white font-mono">
      <SeoHead
        title="About the Archive | Anime Architecture Archive"
        description="Anime Architecture Archive maps fictional universes as structured systems. Built by Hashi.Ai for fans who think deeper about power systems, worldbuilding, and causal logic."
        canonicalUrl="https://animearchive.app/about"
        type="website"
      />
      <main className="max-w-3xl mx-auto px-6 py-14">
        <div className="mb-10">
          <Link to="/" className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-gray-400 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-3 h-3" />
            Back to Archive
          </Link>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-3">About This Archive</h1>
          <p className="text-xs text-gray-400">Built by Hashi.Ai · For fans who think deeper</p>
        </div>

        {/* Mission */}
        <section className="rounded-xl border border-white/10 bg-white/5 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BrainCircuit className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-white">The Mission</h2>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed mb-3">
            Most anime wikis list what happens. This archive explains why it had to happen that way. Every universe is mapped as a system — a set of rules, constraints, power relationships, and causal chains that determine outcomes, not just describe them.
          </p>
          <p className="text-xs text-gray-400 leading-relaxed">
            The goal is to make it impossible to watch your favorite anime the same way again. To see the architecture underneath the story.
          </p>
        </section>

        {/* System Types */}
        <section className="rounded-xl border border-white/10 bg-white/5 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-white">System Types in the Archive</h2>
          </div>
          <div className="space-y-3">
            {SYSTEM_TYPES.map((type) => (
              <div key={type.label} className={`rounded-lg border p-4 ${type.bg}`}>
                <p className={`text-[11px] font-bold uppercase tracking-widest mb-1 ${type.color}`}>{type.label}</p>
                <p className="text-[10px] text-gray-500 mb-2">{type.example}</p>
                <p className="text-[11px] text-gray-300 leading-relaxed">{type.description}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-500 mt-3">Each universe in the archive is tagged with its primary system type. Use the system comparison tool to see how different shows handle power, strategy, and world logic differently.</p>
        </section>

        {/* How to Use */}
        <section className="rounded-xl border border-white/10 bg-white/5 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-white">How to Use This Archive</h2>
          </div>
          <div className="space-y-3">
            <div className="flex gap-3">
              <span className="text-cyan-400 font-black text-sm shrink-0">01</span>
              <div>
                <p className="text-[11px] font-bold text-white mb-1">Browse the catalog</p>
                <p className="text-[10px] text-gray-400 leading-relaxed">Search and filter 15 universes by system type, cluster, or name. Each card shows the system classification and tagline.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-cyan-400 font-black text-sm shrink-0">02</span>
              <div>
                <p className="text-[11px] font-bold text-white mb-1">Open any universe</p>
                <p className="text-[10px] text-gray-400 leading-relaxed">Each universe page opens in two modes: Lore View for narrative exploration, and System Mode for structural analysis. Toggle between them at the top of the page.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-cyan-400 font-black text-sm shrink-0">03</span>
              <div>
                <p className="text-[11px] font-bold text-white mb-1">Use the system tools</p>
                <p className="text-[10px] text-gray-400 leading-relaxed">Navigate tabs: Characters, Rules, Factions, Relationships, Causal Chain. Each tab maps a different dimension of how the universe functions.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-cyan-400 font-black text-sm shrink-0">04</span>
              <div>
                <p className="text-[11px] font-bold text-white mb-1">Compare universes</p>
                <p className="text-[10px] text-gray-400 leading-relaxed">Use the Compare tool on the homepage or go to /compare to put any two universes side-by-side across power systems, factions, and structural complexity.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Creator */}
        <section className="rounded-xl border border-white/10 bg-white/5 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-white">The Creator</h2>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed mb-4">
            Hashi.Ai is an AI-native project focused on structured intelligence and system-level analysis. Anime Architecture Archive is the first proof of concept — a demonstration that complex fictional universes can be rendered as interactive analytical systems, maintained by AI, useful for humans.
          </p>
          <p className="text-xs text-gray-400 leading-relaxed mb-4">
            The long-term goal is an autonomous intelligence layer that can map any complex system — fictional or real — into structured, interactive, queryable formats. Anime is the first domain.
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

        {/* Coverage */}
        <section className="rounded-xl border border-white/10 bg-white/5 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Compass className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-white">Current Coverage</h2>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed mb-3">
            15 anime universes across multiple genres: shonen action, psychological thriller, dark fantasy, sci-fi thriller, and more.
          </p>
          <p className="text-[10px] text-gray-500 tracking-wider">
            Request a universe by following <a href="https://www.tiktok.com/@hashi.ai" target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300">@hashi.ai on TikTok</a> or using the Community Pulse on the homepage.
          </p>
        </section>

        <div className="text-center">
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
