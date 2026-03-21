import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Calendar } from 'lucide-react'
import SeoHead from './SeoHead'
import { SITE_URL, SITE_NAME } from '../utils/seo'

function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function BlogPostCard({ post }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex flex-col gap-3 px-6 py-5 rounded-xl border border-white/10 bg-white/[0.02] hover:border-cyan-400/30 hover:bg-white/[0.04] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
    >
      <div className="flex items-center gap-2 text-[9px] text-gray-500 tracking-[0.2em] uppercase">
        <Calendar className="w-3 h-3" />
        <span>{formatDate(post.date)}</span>
        {post.author && (
          <>
            <span className="text-white/10">·</span>
            <span>{post.author}</span>
          </>
        )}
      </div>

      <h2 className="text-base md:text-lg font-bold text-white leading-snug group-hover:text-cyan-100 transition-colors">
        {post.title}
      </h2>

      <p className="text-[11px] md:text-xs text-gray-400 leading-relaxed line-clamp-3">
        {post.description}
      </p>

      <span className="mt-1 inline-flex items-center gap-1.5 text-[9px] font-bold tracking-[0.2em] uppercase text-cyan-400 group-hover:gap-2.5 transition-all">
        Read post <ArrowRight className="w-3 h-3" />
      </span>
    </Link>
  )
}

export default function BlogIndex() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    fetch('/blog-index.json')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load blog index (${res.status})`)
        return res.json()
      })
      .then((data) => {
        if (cancelled) return
        setPosts(Array.isArray(data.posts) ? data.posts : [])
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message)
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  const canonicalUrl = `${SITE_URL}/blog`
  const seoTitle = `Anime Analysis Blog — Power Systems, Worldbuilding & More | ${SITE_NAME}`
  const seoDescription = 'Deep dives into anime power systems, worldbuilding structure, and universe mechanics. Expert analysis written for fans who love the craft behind the story.'
  const seoKeywords = 'anime blog, anime analysis, anime power systems, anime worldbuilding, best anime explanations'

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: `${SITE_NAME} Blog`,
      description: seoDescription,
      url: canonicalUrl,
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: `${SITE_URL}/` },
      blogPost: posts.map((post) => ({
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.description,
        url: `${SITE_URL}/blog/${post.slug}`,
        datePublished: post.date,
        author: { '@type': 'Organization', name: post.author || 'Archive Intelligence' },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Archive Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: canonicalUrl },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-[#050508] text-white font-mono selection:bg-cyan-500/30 overflow-x-hidden">
      <SeoHead
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        canonicalUrl={canonicalUrl}
        type="website"
        structuredData={structuredData}
      />

      {/* Nav */}
      <nav className="w-full px-6 py-4 flex items-center justify-between border-b border-white/5 sticky top-0 z-30 backdrop-blur-md bg-[#050508]/90">
        <Link to="/" className="text-[10px] tracking-[0.2em] uppercase text-gray-400 hover:text-white transition-colors">
          ← Archive Home
        </Link>
        <div className="flex items-center gap-4 text-[10px] text-gray-600 tracking-widest uppercase">
          <Link to="/universes" className="hover:text-white transition-colors">Browse Universes</Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="w-full px-6 py-16 md:py-20 flex flex-col items-center text-center border-b border-white/5" style={{ background: 'radial-gradient(ellipse at center, rgba(34,211,238,0.06) 0%, transparent 65%), #050508' }}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 mb-6">
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[9px] font-bold tracking-[0.24em] uppercase text-cyan-400">Archive Blog</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase text-white leading-tight max-w-3xl mb-5">
          Anime Analysis, Deep Dives & System Breakdowns
        </h1>

        <p className="text-sm text-gray-300/80 max-w-xl leading-relaxed">
          Power system rankings, worldbuilding critiques, and structural analysis — written for fans who want to understand the engineering behind the story.
        </p>
      </header>

      {/* Post List */}
      <main className="max-w-3xl mx-auto px-6 py-16">
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            <p className="text-xs text-rose-400 tracking-widest uppercase mb-2">Failed to load posts</p>
            <p className="text-[11px] text-gray-500">{error}</p>
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xs text-gray-500 tracking-widest uppercase mb-2">No posts yet</p>
            <p className="text-[11px] text-gray-600">Check back soon for anime analysis and system breakdowns.</p>
          </div>
        )}

        {!loading && !error && posts.length > 0 && (
          <div className="space-y-4">
            <p className="text-[9px] text-gray-600 tracking-[0.24em] uppercase mb-6">
              {posts.length} post{posts.length !== 1 ? 's' : ''}
            </p>
            {posts.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        )}

        {/* Cross-links */}
        <section className="mt-20 pt-10 border-t border-white/5 text-center">
          <p className="text-[10px] text-gray-600 tracking-widest uppercase mb-4">Ready to explore the archive?</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/universes"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-300 hover:border-cyan-400/40 hover:text-white transition-all"
            >
              Browse All Universes <ArrowRight className="w-3 h-3" />
            </Link>
            <Link
              to="/systems/power-economy-systems"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-indigo-400/30 bg-indigo-400/10 text-[10px] font-bold tracking-[0.2em] uppercase text-indigo-300 hover:border-indigo-400/60 transition-all"
            >
              Power Economy Systems <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-[10px] text-gray-600 tracking-widest uppercase">
        <p>
          <Link to="/" className="hover:text-gray-400 transition-colors">{SITE_NAME}</Link>
          {' · '}
          <Link to="/about" className="hover:text-gray-400 transition-colors">About</Link>
          {' · '}
          <Link to="/universes" className="hover:text-gray-400 transition-colors">Catalog</Link>
        </p>
      </footer>
    </div>
  )
}
