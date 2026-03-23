import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Clock3, Network, Zap, Users, BookOpen, ChevronRight, Share2 } from 'lucide-react'
import SeoHead from './SeoHead'
import { SITE_URL, SITE_NAME } from '../utils/seo'

const ICON_MAP = { Network, Zap, Users, BookOpen }

import { INSIGHTS_BY_SLUG } from '../data/insights'

function InsightBlock({ block }) {
  if (block.type === 'thesis') return (
    <blockquote className="border-l-2 border-cyan-400 pl-6 py-1 my-6 text-[13px] text-gray-300 leading-relaxed italic">
      {block.text}
    </blockquote>
  )
  if (block.type === 'breakdown') return (
    <div className="my-6">
      <h3 className="text-[11px] uppercase tracking-widest text-cyan-400 font-bold mb-3">{block.title}</h3>
      <p className="text-[12px] text-gray-400 leading-relaxed">{block.text}</p>
    </div>
  )
  if (block.type === 'key_insight') return (
    <div className="my-6 p-4 rounded-xl bg-cyan-400/5 border border-cyan-400/20">
      <p className="text-[11px] uppercase tracking-widest text-cyan-400 font-bold mb-2">Key Insight</p>
      <p className="text-[12px] text-gray-300 leading-relaxed">{block.text}</p>
    </div>
  )
  return null
}

export default function InsightPost() {
  const { slug } = useParams()
  const insight = INSIGHTS_BY_SLUG[slug]
  const IconComp = insight ? ICON_MAP[insight.iconKey] : null

  if (!insight) {
    return (
      <div className="min-h-screen bg-[#050508] text-white font-mono flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-xs uppercase tracking-widest mb-4">Insight not found.</p>
          <Link to="/insights" className="text-cyan-400 hover:text-cyan-300 text-[11px] uppercase tracking-widest">← Back to Insights</Link>
        </div>
      </div>
    )
  }

  const pageUrl = `${SITE_URL}/insights/${slug}`
  const description = insight.content.find(b => b.type === 'thesis')?.text?.slice(0, 160) || insight.title

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'ScholarlyArticle',
      name: insight.title,
      description,
      url: pageUrl,
      about: {
        '@type': 'Thing',
        name: insight.universeAnime,
      },
      genre: 'System Analysis',
      keywords: insight.tags?.join(', '),
      datePublished: '2026-01-01',
      author: { '@type': 'Organization', name: 'Hashi.Ai' },
      publisher: { '@type': 'Organization', name: SITE_NAME, url: `${SITE_URL}/` },
      isPartOf: { '@type': 'Blog', name: `${SITE_NAME} Insights`, url: `${SITE_URL}/insights` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Archive Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Insights', item: `${SITE_URL}/insights` },
        { '@type': 'ListItem', position: 3, name: insight.title, item: pageUrl },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-[#050508] text-white font-mono">
      {insight && (
        <SeoHead
          title={`${insight.title} — Anime Archive`}
          description={description}
          canonicalUrl={pageUrl}
          image="https://animearchive.app/og-default.png"
          type="article"
          keywords={insight.tags?.join(', ')}
          structuredData={structuredData}
        />
      )}
      <div className="w-full px-6 py-12 border-b border-white/5" style={{ background: 'radial-gradient(ellipse at 20% 50%, #0a1628 0%, #050508 70%)' }}>
        <div className="max-w-2xl mx-auto">
          <Link to="/insights" className="inline-flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-white uppercase tracking-widest mb-8 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Insights
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <Link
              to={`/universe/${insight.universe}`}
              className="px-2.5 py-1 rounded-full border border-white/10 text-[9px] uppercase tracking-widest text-gray-400 hover:text-white hover:border-white/30 transition-colors"
            >
              {insight.universeAnime}
            </Link>
            {IconComp && (
              <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
                <IconComp className="w-3.5 h-3.5" />
                {insight.category}
              </span>
            )}
            <span className="flex items-center gap-1 text-[10px] text-gray-600 ml-auto">
              <Clock3 className="w-3 h-3" />{insight.readTime}
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-3">
            {insight.title}
          </h1>

          <div className="flex flex-wrap gap-2 mt-4">
            {insight.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-white/5 text-[9px] text-gray-600 rounded uppercase tracking-wider">{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-10">
        {insight.content.map((block, i) => (
          <InsightBlock key={i} block={block} />
        ))}

        {/* CTA */}
        <div className="mt-12 p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
          <p className="text-[11px] text-gray-400 mb-4 leading-relaxed">
            Explore the full {insight.universeAnime} system breakdown in the archive.
          </p>
          <Link
            to={`/universe/${insight.universe}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors"
          >
            Open {insight.universeAnime} System <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Share */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
          <button
            onClick={() => {
              const url = window.location.href
              if (navigator.share) navigator.share({ title: insight.title, url })
              else navigator.clipboard.writeText(url)
            }}
            className="flex items-center gap-2 text-[10px] text-gray-500 hover:text-white uppercase tracking-widest transition-colors"
          >
            <Share2 className="w-3 h-3" /> Share
          </button>
          <Link to="/insights" className="text-[10px] text-gray-600 hover:text-white uppercase tracking-widest transition-colors">
            ← More insights
          </Link>
        </div>
      </div>
    </div>
  )
}
