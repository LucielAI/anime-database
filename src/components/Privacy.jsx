import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import SeoHead from './SeoHead'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#050508] text-white font-mono px-6 py-14">
      <SeoHead
        title="Privacy Policy | Anime Architecture Archive"
        description="Privacy policy for Anime Architecture Archive. We use GoatCounter analytics (no cookies, no tracking), affiliate links, and temporary feedback storage."
        canonicalUrl="https://animearchive.app/privacy"
        type="website"
      />
      <main className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-gray-400 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-3 h-3" />
            Back to Archive
          </Link>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-xs text-gray-400">Last updated: 2026-03-20</p>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-white mb-3">Analytics</h2>
            <p className="text-xs text-gray-300 leading-relaxed mb-3">
              We use GoatCounter, a privacy-first analytics service. It does not use cookies, does not track across websites, and does not collect personal information. Data is hosted by the project creator and used only to understand aggregate traffic patterns.
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              GoatCounter collects: page views, referrer (if present), and user agent (browser type). No IP addresses are stored. No cross-site tracking. No advertising pixels.
            </p>
          </section>

          <section className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-white mb-3">External Links</h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              This archive contains links to MyAnimeList, TikTok, Amazon, and Buy Me a Coffee. These are external websites with their own privacy policies. Clicking those links means you are subject to their respective privacy practices.
            </p>
          </section>

          <section className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-white mb-3">Affiliate Links</h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              Some links to Amazon are affiliate links. If you purchase through those links, the creator may earn a small commission at no additional cost to you. This does not affect editorial independence — all universe analyses are created without commercial influence from any affiliate partners.
            </p>
          </section>

          <section className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-white mb-3">Feedback & Submissions</h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              If you submit anime suggestions, corrections, or other feedback through the archive's forms, that data is stored temporarily for community improvement purposes and may be used (without personal identification) to prioritize future universe additions.
            </p>
          </section>

          <section className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-white mb-3">Children's Privacy</h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              This archive is not directed at children under 13, and we do not knowingly collect information from children. The content covers anime series that are generally targeted at teen and adult audiences.
            </p>
          </section>

          <section className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-white mb-3">Contact</h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              For privacy concerns or data questions: reach out via the TikTok profile <a href="https://www.tiktok.com/@hashi.ai" target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300">@hashi.ai</a> or through the feedback form on any universe page.
            </p>
          </section>
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-300 transition-all"
          >
            Return to Archive Home
          </Link>
        </div>
      </main>
    </div>
  )
}
