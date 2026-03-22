import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Clock3, Network, Zap, Users, BookOpen, ChevronRight, Share2, Twitter } from 'lucide-react'

const INSIGHTS = [
  {
    slug: 'one-piece-power-economy',
    universe: 'one-piece',
    universeAnime: 'One Piece',
    title: 'Why the One Piece World Is Designed Like an Economy',
    subtitle: 'The Yonko system, maritime trade routes, and Devil Fruit markets.',
    readTime: '5 min',
    category: 'World Analysis',
    icon: <Network className="w-4 h-4" />,
    tags: ['economics', 'power systems', 'faction analysis'],
    teaser: 'In the One Piece world, political power flows through territorial control and trade monopoly — not individual strength alone. The Four Emperors maintain their positions not just through combat prowess, but by controlling the flow of goods, information, and human capital across the Grand Line.',
    featured: true,
  },
  {
    slug: 'naruto-chakra-meritocracy',
    universe: 'naruto',
    universeAnime: 'Naruto',
    title: 'Chakra as a Bureaucratic Resource',
    subtitle: 'How shinobi villages turned personal energy into a labor market.',
    readTime: '4 min',
    category: 'System Analysis',
    icon: <Zap className="w-4 h-4" />,
    tags: ['economics', 'shinobi systems', 'bureaucracy'],
    teaser: 'Naruto\'s world converts individual chakra into a tradeable resource through mission rankings, seal-based contracts, and village loyalty. The system rewards specialization and loyalty over raw power — which is why characters like Shikamaru and Gaara rise faster than stronger but less disciplined shinobi.',
    featured: false,
  },
  {
    slug: 'jjk-cursed-energy-thermodynamics',
    universe: 'jjk',
    universeAnime: 'Jujutsu Kaisen',
    title: "Cursed Energy as an Inverse Heat Engine",
    subtitle: "Why Gojo's Infinity works like a thermodynamic paradox.",
    readTime: '6 min',
    category: 'Mechanics',
    icon: <Zap className="w-4 h-4" />,
    tags: ['physics', 'combat systems', 'power analysis'],
    teaser: "Jujutsu Kaisen's power system is built on negative emotional energy — hate, fear, and grief generate power. But this creates a thermodynamic problem: the system extracts entropy from human suffering to fuel combat. Which means reducing suffering in the world literally weakens the fighters who depend on it.",
    featured: false,
  },
  {
    slug: 'aot-determinism-chaos',
    universe: 'aot',
    universeAnime: 'Attack on Titan',
    title: 'The Determinism Engine in Attack on Titan',
    subtitle: 'Why every freedom fight circles back to the same trap.',
    readTime: '5 min',
    category: 'World Analysis',
    icon: <Clock3 className="w-4 h-4" />,
    tags: ['philosophy', 'time', 'determinism'],
    teaser: 'Attack on Titan runs on a closed causal loop. The future sends memories backward; the past shapes the future; every rebellion creates the very system it opposes. This makes the world feel like a machine with no off switch — and the characters aware of it are the ones who suffer most.',
    featured: false,
  },
  {
    slug: 'hxh-nen-specialization',
    universe: 'hxh',
    universeAnime: 'Hunter x Hunter',
    title: 'Why Nen Is the Best Magic System in Anime',
    subtitle: 'Vow and Limitations as a self-limiting growth protocol.',
    readTime: '7 min',
    category: 'System Analysis',
    icon: <Users className="w-4 h-4" />,
    tags: ['power systems', 'strategy', 'depth'],
    teaser: 'Nen\'s vow-and-limitation mechanic is essentially a self-imposed constraint that trades one kind of power for another. By restricting yourself to a narrow ability, you gain exponentially more output. This mirrors real-world skill acquisition — the more you specialize, the more efficiently you develop mastery in that domain.',
    featured: false,
  },
  {
    slug: 'death-note-killing-archetype',
    universe: 'deathnote',
    universeAnime: 'Death Note',
    title: 'Death Note as a Tool Critique',
    subtitle: 'The notebook as a mirror for power fantasies.',
    readTime: '4 min',
    category: 'Thematic Analysis',
    icon: <BookOpen className="w-4 h-4" />,
    tags: ['power', 'morality', 'deconstruction'],
    teaser: 'Death Note asks: what happens when an ordinary person gets absolute power? Light Yagami starts as a moralist and becomes a tyrant — the tool doesn\'t change him, it reveals him. This makes Death Note less about the notebook and more about the psychology of people who believe they deserve to judge others.',
    featured: false,
  },
  {
    slug: 'demonslayer-breathing-economics',
    universe: 'demonslayer',
    universeAnime: 'Demon Slayer',
    title: 'Breathing Forms as Weaponized Poetry',
    subtitle: 'How swordsmanship became a language system.',
    readTime: '4 min',
    category: 'Combat Analysis',
    icon: <Zap className="w-4 h-4" />,
    tags: ['combat', 'aesthetics', 'power systems'],
    teaser: 'Demon Slayer\'s breathing system converts emotional states into combat techniques. Water Breathing, Flame Breathing — each is a philosophy of movement. Muzan\'s pursuit of the Blue Spider Lily makes sense in this framework: he\'s looking for the one breathing form that would complete his own fragmented system.',
    featured: false,
  },
  {
    slug: 'chainsawman-devil-economy',
    universe: 'chainsawman',
    universeAnime: 'Chainsaw Man',
    title: 'Why Devil Contracts Are a Raw Deal',
    subtitle: 'Fear as fuel, trauma as currency.',
    readTime: '5 min',
    category: 'System Analysis',
    icon: <Network className="w-4 h-4" />,
    tags: ['economics', 'power systems', 'power fantasy'],
    teaser: 'Every devil contract in Chainsaw Man trades something abstract — a memory, a sense, a relationship — for concrete power. This makes the system feel genuinely transactional: you give up part of yourself, you get exactly what you asked for, and the devil keeps the part you can\'t get back. No deception, no fine print. Just a clean, brutal exchange.',
    featured: false,
  },
]

export default function InsightsRoute() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const categories = useMemo(() => {
    const cats = ['all', ...new Set(INSIGHTS.map(i => i.category))]
    return cats
  }, [])

  const filtered = useMemo(() => {
    return INSIGHTS.filter(i => {
      const matchCat = activeCategory === 'all' || i.category === activeCategory
      const matchSearch = !searchQuery ||
        i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        i.universeAnime.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCat && matchSearch
    })
  }, [activeCategory, searchQuery])

  const featured = INSIGHTS.find(i => i.featured)
  const rest = filtered.filter(i => !i.featured)

  return (
    <div className="min-h-screen bg-[#050508] text-white font-mono">
      {/* Header */}
      <header className="w-full py-16 px-6 text-center border-b border-white/5" style={{ background: 'radial-gradient(ellipse at center, #101634 0%, #050508 100%)' }}>
        <p className="text-[10px] text-cyan-300/80 tracking-[0.24em] uppercase font-bold mb-3">Deep Dives & Analysis</p>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-3">System Breakdowns</h1>
        <p className="text-xs text-gray-400 max-w-xl mx-auto leading-relaxed">
          How anime worlds actually work — power mechanics, causal logic, and the systems behind the fights.
        </p>
        {/* Search */}
        <div className="mt-6 max-w-md mx-auto flex gap-2">
          <input
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search insights..."
            className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[11px] text-white placeholder-gray-600 outline-none focus:border-cyan-400/40 transition-colors"
          />
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'System Breakdowns — Anime Archive', url: window.location.href })
              } else {
                navigator.clipboard.writeText(window.location.href)
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2.5 border border-white/10 rounded-xl hover:border-cyan-400/40 transition-colors text-gray-400 hover:text-white"
            title="Share insights"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.14em] border transition-colors ${
                activeCategory === cat
                  ? 'border-cyan-400/60 bg-cyan-400/10 text-cyan-300'
                  : 'border-white/10 text-gray-500 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured insight */}
        {featured && activeCategory === 'all' && !searchQuery && (
          <Link
            to={`/insights/${featured.slug}`}
            className="block mb-10 group"
          >
            <div className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/8 to-transparent p-6 hover:border-cyan-400/40 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-cyan-400/20 text-cyan-300 text-[9px] uppercase tracking-widest font-bold rounded">Featured</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">{featured.universeAnime}</span>
                <span className="text-[10px] text-gray-600">·</span>
                <span className="flex items-center gap-1 text-[10px] text-gray-500">
                  <Clock3 className="w-3 h-3" /> {featured.readTime}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-2 group-hover:text-cyan-300 transition-colors">
                {featured.title}
              </h2>
              <p className="text-xs text-gray-400 mb-4">{featured.subtitle}</p>
              <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-3 mb-4">
                {featured.teaser}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-bold uppercase tracking-widest">
                Read analysis <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </Link>
        )}

        {/* Insights grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rest.map(insight => (
            <Link
              key={insight.slug}
              to={`/insights/${insight.slug}`}
              className="group"
            >
              <article className="h-full rounded-xl border border-white/10 p-5 hover:border-white/20 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-white/5 text-gray-400">
                    {insight.icon}
                  </div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">{insight.universeAnime}</span>
                  <span className="flex items-center gap-1 text-[10px] text-gray-600 ml-auto">
                    <Clock3 className="w-3 h-3" />{insight.readTime}
                  </span>
                </div>
                <h3 className="text-sm font-black uppercase tracking-tight mb-1 group-hover:text-cyan-300 transition-colors leading-snug">
                  {insight.title}
                </h3>
                <p className="text-[11px] text-gray-500 mb-3 line-clamp-2 leading-relaxed">{insight.subtitle}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {insight.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-white/5 text-[9px] text-gray-600 rounded uppercase tracking-wider">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-600 group-hover:text-cyan-400 transition-colors">
                  Read <ChevronRight className="w-3 h-3" />
                </div>
              </article>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-600">
            <p className="text-xs uppercase tracking-widest">No insights found.</p>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="max-w-xl mx-auto px-6 pb-16 text-center">
        <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-4">Want new insights every week?</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 text-[10px] font-bold uppercase tracking-widest text-cyan-300 hover:bg-cyan-400/20 transition-colors"
        >
          Subscribe to the newsletter
        </Link>
      </div>
    </div>
  )
}
