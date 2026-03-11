import { useCallback, useMemo, useState } from 'react'
import { HeartHandshake, Send, Sparkles, Share2, ExternalLink } from 'lucide-react'

const NEXT_UNIVERSE_CANDIDATES = [
  'One Piece',
  'Naruto',
  'Code Geass: Akito the Exiled',
  'Chainsaw Man'
]

export default function CommunityPulse() {
  const [suggestion, setSuggestion] = useState('')
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const supportUrl = useMemo(() => import.meta.env.VITE_SUPPORT_URL || '', [])

  const sendSuggestion = useCallback(async (animeName) => {
    const sanitized = animeName.trim().replace(/<[^>]*>/g, '').slice(0, 100)
    if (!sanitized) return

    setLoading(true)
    setStatus(null)
    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animeName: sanitized })
      })

      if (!res.ok) throw new Error('failed')
      setStatus('sent')
      setSuggestion('')
    } catch {
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }, [])

  const submitCustomSuggestion = useCallback((e) => {
    e.preventDefault()
    if (!suggestion.trim()) return
    sendSuggestion(suggestion)
  }, [sendSuggestion, suggestion])

  const shareArchive = useCallback(async () => {
    const title = 'Anime Architecture Archive'
    const text = 'Help choose the next universe for the archive.'
    const url = typeof window !== 'undefined' ? window.location.href : 'https://animearchive.app/'

    try {
      if (navigator.share) {
        await navigator.share({ title, text, url })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${title}\n${text}\n${url}`)
      }
      setStatus('shared')
    } catch {
      // no-op to keep interaction non-blocking
    }
  }, [])

  return (
    <section className="max-w-6xl mx-auto px-6 mb-12 animate-fade-in" aria-label="Community signals">
      <div className="rounded-xl border border-white/10 bg-[#0a0a10] p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-[11px] tracking-[0.22em] font-bold uppercase text-gray-300 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            COMMUNITY PULSE
          </h2>
          <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">No login · 10 seconds</span>
        </div>

        <p className="text-xs text-gray-400 mb-4 leading-relaxed">
          Help shape what gets archived next. Quick signals here directly guide future universe priorities.
        </p>

        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 mb-2">Vote a next target</p>
          <div className="flex flex-wrap gap-2">
            {NEXT_UNIVERSE_CANDIDATES.map((candidate) => (
              <button
                key={candidate}
                type="button"
                onClick={() => sendSuggestion(candidate)}
                disabled={loading}
                className="px-3 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] uppercase tracking-[0.15em] text-gray-300 min-h-[44px] disabled:opacity-50"
              >
                + {candidate}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={submitCustomSuggestion} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            placeholder="Suggest another universe…"
            maxLength={100}
            className="flex-1 min-h-[44px] rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-gray-200 placeholder:text-gray-600 outline-none focus:border-cyan-400/50"
          />
          <button
            type="submit"
            disabled={loading || !suggestion.trim()}
            className="min-h-[44px] px-4 rounded-lg border border-cyan-400/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-[10px] uppercase tracking-[0.18em] font-bold disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <Send className="w-3 h-3" />
            Send Signal
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <button
            type="button"
            onClick={shareArchive}
            className="min-h-[44px] px-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] uppercase tracking-[0.16em] text-gray-300 flex items-center gap-2"
          >
            <Share2 className="w-3 h-3" /> Share Archive
          </button>
          <a
            href="https://www.tiktok.com/@kenshipeak"
            target="_blank"
            rel="noreferrer"
            className="min-h-[44px] px-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] uppercase tracking-[0.16em] text-gray-300 flex items-center gap-2"
          >
            Follow Updates <ExternalLink className="w-3 h-3" />
          </a>
          {supportUrl && (
            <a
              href={supportUrl}
              target="_blank"
              rel="noreferrer"
              className="min-h-[44px] px-3 rounded-lg border border-amber-400/30 bg-amber-500/10 hover:bg-amber-500/20 text-[10px] uppercase tracking-[0.16em] text-amber-300 flex items-center gap-2"
            >
              <HeartHandshake className="w-3 h-3" /> Support the Archive
            </a>
          )}
        </div>

        {status === 'sent' && <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-cyan-300">Signal recorded. Thank you.</p>}
        {status === 'shared' && <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-cyan-300">Share link ready.</p>}
        {status === 'error' && <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-red-400">Signal system temporarily unavailable.</p>}
      </div>
    </section>
  )
}
