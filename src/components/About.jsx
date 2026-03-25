import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Network, Zap, Clock3, Users, Star, Mail } from 'lucide-react'
import SeoHead from './SeoHead'
import { SITE_NAME, SITE_URL } from '../utils/seo'

// CRO: Compact newsletter CTA for About page hero
function NewsletterCTASlim() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const lastSubmitTime = useRef(0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const now = Date.now()
    if (now - lastSubmitTime.current < 5000) return
    lastSubmitTime.current = now
    const trimmed = email.trim()
    if (!trimmed.includes('@')) return
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      })
      if (res.ok) { setStatus('success'); setEmail('') }
      else { setStatus('error') }
    } catch { setStatus('error') }
  }

  if (status === 'success') {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-400/30 bg-emerald-400/10">
        <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
        <span className="text-[10px] font-mono tracking-wider text-emerald-300 uppercase">You&apos;re in. New universes drop first.</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="inline-flex flex-col sm:flex-row gap-2 items-center">
      <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-white/10 bg-white/5 text-gray-400">
        <Mail className="w-3.5 h-3.5" />
        <span className="text-[10px] font-mono tracking-wider">New universes drop first</span>
      </div>
      <input
        type="email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle') }}
        placeholder="your@email.com"
        maxLength={254}
        disabled={status === 'loading'}
        className="min-h-[36px] w-44 bg-white/5 border border-white/20 focus:border-cyan-400/60 rounded-full px-3 py-1.5 text-xs text-gray-200 placeholder:text-gray-500 outline-none transition-colors font-mono"
      />
      <button
        type="submit"
        disabled={status === 'loading' || !email.trim()}
        className="min-h-[36px] px-4 py-1.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-[#020617] text-[9px] font-bold tracking-[0.15em] uppercase transition-colors disabled:opacity-40 whitespace-nowrap font-mono"
      >
        {status === 'loading' ? '...' : 'Notify Me'}
      </button>
    </form>
  )
}

const STATS = [
  { value: '21', label: 'Universes Mapped' },
  { value: '161+', label: 'Characters Analyzed' },
  { value: '8', label: 'System Insights' },
  { value: '3', label: 'Renderer Types' },
]

const SYSTEM_TYPES = [
  {
    icon: <Network className="w-5 h-5" />,
    title: 'Relational Networks',
    tagline: 'Who knows whom, and why it matters.',
    example: 'One Piece, Bleach, Hunter x Hunter',
    description: 'Power flows through alliances, debts, and territorial control. These worlds are won through relationships, not combat alone.',
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: 'Combat Economies',
    tagline: 'Resources, costs, and counterplay.',
    example: 'Dragon Ball Z, Demon Slayer, Tokyo Ghoul',
    description: 'Fighting has a price. Every attack costs something. Winners are those who understand the exchange rate.',
  },
  {
    icon: <Clock3 className="w-5 h-5" />,
    title: 'Causal Timelines',
    tagline: 'What happened, and what it caused.',
    example: 'Attack on Titan, Steins;Gate, Code Geass',
    description: 'Closed loops, prophecy, and butterfly effects. The past determines the future, and the future shapes the past.',
  },
]

const WHY = [
  {
    title: 'Not fan wiki.',
    text: "We don't list characters. We map systems. Every universe has rules that govern how power works — and those rules reveal something real about how the world functions.",
  },
  {
    title: 'Not a tier list.',
    text: 'Strength rankings miss the point. A universe where tactics beat raw power tells a different story than one where raw power beats tactics. We map the story.',
  },
  {
    title: 'Intelligence, not trivia.',
    text: "This is for people who watch anime and think about why it works. What makes the systems compelling isn't what happens — it's how the system makes what happens feel inevitable.",
  },
]

export default function About() {
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: `About | ${SITE_NAME}`,
      description: 'The Anime Intelligence Archive maps fictional anime universes as structured systems — analyzing power mechanics, causal logic, and worldbuilding architecture.',
      url: `${SITE_URL}/about`,
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: `${SITE_URL}/` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Hashi.Ai',
      url: `${SITE_URL}/`,
      description: 'AI-native anime architecture platform. Structured analysis of fictional universes as systems.',
      sameAs: [
        'https://www.tiktok.com/@hashi.ai',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Archive Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'About', item: `${SITE_URL}/about` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is the Anime Architecture Archive?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The Anime Architecture Archive (animearchive.app) is an AI-powered platform that maps fictional anime universes as structured systems — analyzing power mechanics, causal logic, faction dynamics, and worldbuilding architecture. Each universe is broken down into its underlying rules so you can understand why the story works the way it does.',
          },
        },
        {
          '@type': 'Question',
          name: 'How is this different from a fan wiki or tier list?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Fan wikis list characters and their abilities. Tier lists rank characters by power level. This archive does neither — it maps the system itself. How does power work in this world? What are the costs and tradeoffs? What makes a fight meaningful versus arbitrary? We analyze the architecture of the fictional world, not the individuals within it.',
          },
        },
        {
          '@type': 'Question',
          name: 'Who runs the Anime Architecture Archive?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The archive is created and maintained by Hashi.Ai — an AI-native platform focused on structured analysis of fictional systems. The analysis is produced using AI models and verified for logical consistency.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I request a new anime universe be added?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Use the "Request a Universe" feature on the catalog page, or reach out via the feedback form on any universe page. The most-requested universes are prioritized for the next analysis cycle.',
          },
        },
        {
          '@type': 'Question',
          name: 'How often is the archive updated?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'New universes are added regularly based on community requests and platform priorities. Each universe page is updated when significant new information becomes available or when the analysis is refined.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is this site free to use?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, the Anime Architecture Archive is completely free to use. All universe analyses are publicly accessible without registration.',
          },
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-[#050508] text-white font-mono">
      <SeoHead
        title={`About the Anime Architecture Archive | ${SITE_NAME}`}
        description="Anime Architecture Archive maps fictional anime universes as structured systems — analyzing power mechanics, causal logic, and worldbuilding architecture. Created by Hashi.Ai."
        canonicalUrl={`${SITE_URL}/about`}
        type="website"
        keywords="anime archive, anime system analysis, anime worldbuilding, anime power systems, anime comparison"
        structuredData={structuredData}
      />
      {/* Hero */}
      <header className="relative w-full py-20 px-6 overflow-hidden" style={{ background: 'radial-gradient(ellipse at 50% 0%, #0a1628 0%, #050508 70%)' }}>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-cyan-400/20 rounded-full bg-cyan-400/5 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest text-cyan-400">The Archive is Live</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4 leading-none">
            The Anime Intelligence<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #22d3ee, #3b82f6)' }}>
              Archive.
            </span>
          </h1>

          <p className="text-sm text-gray-400 max-w-xl mx-auto leading-relaxed mb-8">
            Every anime world has a system. Power rules, causal chains, faction logic. We map them — so you can see why the fights mean something.
          </p>

          {/* CRO: Primary CTA hierarchy - Compare first, then newsletter */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Link
              to="/compare"
              className="flex items-center gap-2 px-6 py-3 bg-emerald-400 hover:bg-emerald-300 text-black text-[11px] font-bold uppercase tracking-widest rounded-lg transition-colors"
            >
              <Network className="w-3.5 h-3.5" />
              Compare Two Systems
            </Link>
            <Link
              to="/universes"
              className="flex items-center gap-2 px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-black text-[11px] font-bold uppercase tracking-widest rounded-lg transition-colors"
            >
              Explore Universes <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {/* CRO: Newsletter CTA - visible in hero for trust */}
          <NewsletterCTASlim />
        </div>

        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </header>

      {/* Stats */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map(stat => (
            <div key={stat.label}>
              <div className="text-3xl md:text-4xl font-black text-cyan-300 mb-1">{stat.value}</div>
              <div className="text-[10px] uppercase tracking-widest text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What is this */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-[10px] uppercase tracking-widest text-gray-600 mb-6 text-center">What We Do</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {WHY.map(item => (
            <div key={item.title} className="p-5 rounded-xl border border-white/10 bg-white/[0.02]">
              <h3 className="text-[11px] font-black uppercase text-white mb-2">{item.title}</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* System Types */}
      <section className="border-t border-white/5 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-[10px] uppercase tracking-widest text-gray-600 mb-2 text-center">Three Ways Anime Worlds Work</h2>
          <p className="text-xs text-gray-500 text-center mb-10 max-w-lg mx-auto">Not every anime is the same kind of system. We categorize them by how power actually functions.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SYSTEM_TYPES.map(type => (
              <div key={type.title} className="p-5 rounded-xl border border-white/10 bg-white/[0.02] hover:border-white/20 transition-colors">
                <div className="text-gray-400 mb-3">{type.icon}</div>
                <h3 className="text-[11px] font-black uppercase text-white mb-1">{type.title}</h3>
                <p className="text-[10px] text-cyan-400 mb-3">{type.tagline}</p>
                <p className="text-[10px] text-gray-500 mb-3 leading-relaxed">{type.description}</p>
                <p className="text-[9px] text-gray-600 italic">{type.example}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-white/5 py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-[10px] uppercase tracking-widest text-gray-600 mb-6">How It Works</h2>
          <div className="space-y-6">
            {[
              { step: '01', title: 'Choose a universe.', text: 'Browse the archive by system type, faction complexity, or raw combat density.' },
              { step: '02', title: 'Open the system.', text: 'Every universe page shows you the rules, factions, power mechanics, and causal chains.' },
              { step: '03', title: 'Understand why it matters.', text: 'The system tells you what the story is really about — not just what happens, but how it had to happen.' },
            ].map(item => (
              <div key={item.step} className="flex gap-4 items-start text-left">
                <div className="shrink-0 w-10 h-10 rounded-full border border-cyan-400/30 bg-cyan-400/5 flex items-center justify-center text-[11px] font-black text-cyan-400">{item.step}</div>
                <div>
                  <h3 className="text-[11px] font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-[11px] text-gray-400 leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/5 py-16">
        <div className="max-w-xl mx-auto px-6 text-center">
          <h2 className="text-xl font-black uppercase tracking-tight mb-3">Ready to see how it works?</h2>
          <p className="text-[11px] text-gray-400 mb-6 leading-relaxed">
            Start with the system that interests you most. Or browse the latest insights below.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/compare"
              className="flex items-center gap-2 px-6 py-3 bg-emerald-400 hover:bg-emerald-300 text-black text-[11px] font-bold uppercase tracking-widest rounded-lg transition-colors"
            >
              <Network className="w-3.5 h-3.5" />
              Compare Two Systems
            </Link>
            <Link
              to="/universes"
              className="flex items-center gap-2 px-6 py-3 border border-white/20 hover:border-white/40 text-[11px] uppercase tracking-widest rounded-lg transition-colors"
            >
              Browse All Universes <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer nav */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4 text-[10px] text-gray-600 uppercase tracking-widest">
          <Link to="/universes">Archive</Link>
          <Link to="/insights">Insights</Link>
          <Link to="/compare">Compare</Link>
          <Link to="/privacy">Privacy</Link>
          <span>© 2026 Anime Architecture Archive</span>
        </div>
      </footer>
    </div>
  )
}
