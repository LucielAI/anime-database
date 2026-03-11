import { useState, useCallback, useRef, useMemo } from 'react'
import { ThumbsUp, ThumbsDown, AlertTriangle, Send, HeartHandshake, ExternalLink, Flag } from 'lucide-react'

export default function FeedbackBlock({ slug, theme }) {
  const [voteStatus, setVoteStatus] = useState(null) // 'up' | 'down' | 'needs-data' | null
  const [suggestion, setSuggestion] = useState('')
  const [suggestionSent, setSuggestionSent] = useState(false)
  const [correction, setCorrection] = useState('')
  const [correctionSent, setCorrectionSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorStatus, setErrorStatus] = useState(null) // 'feedback-error' | 'suggest-error' | 'correction-error' | null
  const lastActionTime = useRef(0)

  const accentColor = theme?.primary || '#22d3ee'
  const supportUrl = useMemo(() => import.meta.env.VITE_SUPPORT_URL || '', [])

  const canAct = useCallback(() => {
    const now = Date.now()
    if (now - lastActionTime.current < 5000) return false
    lastActionTime.current = now
    return true
  }, [])

  const submitVote = useCallback(async (vote) => {
    if (!canAct() || voteStatus) return
    setLoading(true)
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, vote })
      })
      setVoteStatus(vote)
    } catch {
      setErrorStatus('feedback-error')
    } finally {
      setLoading(false)
    }
  }, [slug, canAct, voteStatus])

  const submitSuggestion = useCallback(async (e) => {
    e.preventDefault()
    const name = suggestion.trim().replace(/<[^>]*>/g, '').slice(0, 100)
    if (!name || !canAct() || suggestionSent) return
    setLoading(true)
    try {
      await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animeName: name })
      })
      setSuggestionSent(true)
      setSuggestion('')
    } catch {
      setErrorStatus('suggest-error')
    } finally {
      setLoading(false)
    }
  }, [suggestion, canAct, suggestionSent])

  const submitCorrection = useCallback(async (e) => {
    e.preventDefault()
    const note = correction.trim().replace(/<[^>]*>/g, '').slice(0, 280)
    if (!note || !canAct() || correctionSent) return

    setLoading(true)
    try {
      await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animeName: `[CORRECTION:${slug}] ${note}` })
      })
      setCorrectionSent(true)
      setCorrection('')
    } catch {
      setErrorStatus('correction-error')
    } finally {
      setLoading(false)
    }
  }, [correction, canAct, correctionSent, slug])

  return (
    <div className="max-w-6xl mx-auto px-6 mt-12 mb-8">
      <div className="p-5 md:p-6 rounded-xl border border-white/5 bg-[#0a0a10]">
        <h3 className="text-[11px] uppercase tracking-[0.25em] font-bold text-gray-300 mb-5 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full opacity-60" style={{ backgroundColor: accentColor }} />
          HELP IMPROVE THIS ARCHIVE
        </h3>

        <div className="space-y-5">
          {/* Helpful Vote */}
          <div>
            <p className="text-[10px] text-gray-500 tracking-wider uppercase mb-2">Was this system analysis helpful?</p>
            {voteStatus ? (
              <p className="text-[10px] tracking-wider" style={{ color: accentColor }}>
                {voteStatus === 'needs_data' ? 'Flagged — thank you.' : 'Thanks for the feedback.'}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => submitVote('helpful')}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-bold tracking-wider text-gray-400 hover:text-green-400 transition-all cursor-pointer min-h-[44px] disabled:opacity-50"
                >
                  <ThumbsUp className="w-3 h-3" /> Yes
                </button>
                <button
                  onClick={() => submitVote('unhelpful')}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-bold tracking-wider text-gray-400 hover:text-red-400 transition-all cursor-pointer min-h-[44px] disabled:opacity-50"
                >
                  <ThumbsDown className="w-3 h-3" /> Needs improvement
                </button>
                <button
                  onClick={() => submitVote('needs_data')}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-bold tracking-wider text-gray-400 hover:text-amber-400 transition-all cursor-pointer min-h-[44px] disabled:opacity-50"
                >
                  <AlertTriangle className="w-3 h-3" /> Needs More Data
                </button>
              </div>
            )}
            {errorStatus === 'feedback-error' && (
              <p className="text-[10px] text-red-400 mt-2 uppercase tracking-tighter">Feedback temporarily unavailable.</p>
            )}
          </div>

          {/* Suggest an Anime */}
          <div className="border-t border-white/5 pt-4">
            <p className="text-[10px] text-gray-500 tracking-wider uppercase mb-2">Suggest an anime for the archive</p>
            {suggestionSent ? (
              <p className="text-[10px] tracking-wider" style={{ color: accentColor }}>Suggestion recorded. Thank you.</p>
            ) : (
              <form onSubmit={submitSuggestion} className="flex gap-2">
                <input
                  type="text"
                  value={suggestion}
                  onChange={e => setSuggestion(e.target.value)}
                  maxLength={100}
                  placeholder="Anime name..."
                  className="flex-1 bg-transparent border-b border-white/10 focus:border-white/30 text-sm text-gray-300 py-2 px-1 outline-none transition-colors placeholder:text-gray-600 min-h-[44px]"
                />
                <button
                  type="submit"
                  disabled={loading || !suggestion.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer min-h-[44px] disabled:opacity-30"
                  style={{ color: accentColor }}
                >
                  <Send className="w-3 h-3" />
                  Submit
                </button>
              </form>
            )}
            {errorStatus === 'suggest-error' && (
              <p className="text-[10px] text-red-400 mt-2 uppercase tracking-tighter">Suggestion system temporarily unavailable.</p>
            )}
          </div>

          {/* Report correction */}
          <div className="border-t border-white/5 pt-4">
            <p className="text-[10px] text-gray-500 tracking-wider uppercase mb-2">Report a correction for this universe</p>
            {correctionSent ? (
              <p className="text-[10px] tracking-wider" style={{ color: accentColor }}>Correction queued for review.</p>
            ) : (
              <form onSubmit={submitCorrection} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={correction}
                  onChange={(e) => setCorrection(e.target.value)}
                  maxLength={280}
                  placeholder="Ex: Rule X needs source/clarity..."
                  className="flex-1 bg-transparent border-b border-white/10 focus:border-white/30 text-sm text-gray-300 py-2 px-1 outline-none transition-colors placeholder:text-gray-600 min-h-[44px]"
                />
                <button
                  type="submit"
                  disabled={loading || !correction.trim()}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer min-h-[44px] disabled:opacity-30"
                  style={{ color: accentColor }}
                >
                  <Flag className="w-3 h-3" />
                  Report
                </button>
              </form>
            )}
            {errorStatus === 'correction-error' && (
              <p className="text-[10px] text-red-400 mt-2 uppercase tracking-tighter">Correction channel temporarily unavailable.</p>
            )}
          </div>

          {/* Follow + support actions */}
          <div className="border-t border-white/5 pt-4 flex flex-wrap gap-2">
            <a
              href="https://www.tiktok.com/@kenshipeak"
              target="_blank"
              rel="noreferrer"
              className="min-h-[44px] px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-bold tracking-[0.15em] uppercase text-gray-300 flex items-center gap-2"
            >
              Follow updates <ExternalLink className="w-3 h-3" />
            </a>
            {supportUrl && (
              <a
                href={supportUrl}
                target="_blank"
                rel="noreferrer"
                className="min-h-[44px] px-3 py-2 rounded-lg border border-amber-400/30 bg-amber-500/10 hover:bg-amber-500/20 text-[10px] font-bold tracking-[0.15em] uppercase text-amber-300 flex items-center gap-2"
              >
                <HeartHandshake className="w-3 h-3" /> Support the archive
              </a>
            )}
            <p className="text-[10px] text-gray-500 tracking-wider self-center">Signals are lightweight and anonymous.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
