import { useState, useCallback, useRef } from 'react'
import { ThumbsUp, ThumbsDown, AlertTriangle, Send, Wrench } from 'lucide-react'

export default function FeedbackBlock({ slug, theme, animeName }) {
  const [voteStatus, setVoteStatus] = useState(null)
  const [suggestion, setSuggestion] = useState('')
  const [correction, setCorrection] = useState('')
  const [suggestionSent, setSuggestionSent] = useState(false)
  const [correctionSent, setCorrectionSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorStatus, setErrorStatus] = useState(null)
  const lastActionTime = useRef(0)

  const accentColor = theme?.primary || '#22d3ee'

  const canAct = useCallback(() => {
    const now = Date.now()
    if (now - lastActionTime.current < 3500) return false
    lastActionTime.current = now
    return true
  }, [])

  const submitVote = useCallback(async (vote) => {
    if (!canAct() || voteStatus) return
    setLoading(true)
    setErrorStatus(null)
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, vote })
      })
      if (!response.ok) throw new Error('feedback_failed')
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
    setErrorStatus(null)
    try {
      const response = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animeName: name, source: 'universe-page' })
      })
      if (!response.ok) throw new Error('suggest_failed')
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
    const message = correction.trim().replace(/<[^>]*>/g, '').slice(0, 280)
    if (!message || !canAct() || correctionSent) return
    setLoading(true)
    setErrorStatus(null)
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          vote: 'needs_data',
          note: message,
          context: animeName || slug
        })
      })
      if (!response.ok) throw new Error('correction_failed')
      setCorrectionSent(true)
      setCorrection('')
    } catch {
      setErrorStatus('correction-error')
    } finally {
      setLoading(false)
    }
  }, [animeName, correction, canAct, correctionSent, slug])

  return (
    <div className="max-w-6xl mx-auto px-6 mt-12 mb-8">
      <div className="p-5 md:p-6 rounded-xl border border-white/5 bg-[#0a0a10]">
        <h3 className="text-[11px] uppercase tracking-[0.25em] font-bold text-gray-300 mb-5 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full opacity-60" style={{ backgroundColor: accentColor }} />
          HELP IMPROVE THIS ARCHIVE
        </h3>

        <div className="space-y-5">
          <div>
            <p className="text-[10px] text-gray-500 tracking-wider uppercase mb-2">Was this system analysis helpful?</p>
            {voteStatus ? (
              <p className="text-[10px] tracking-wider" style={{ color: accentColor }}>
                {voteStatus === 'needs_data' ? 'Flagged — thank you.' : 'Thanks for the feedback.'}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button onClick={() => submitVote('helpful')} disabled={loading} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-bold tracking-wider text-gray-400 hover:text-green-400 transition-all cursor-pointer min-h-[44px] disabled:opacity-50">
                  <ThumbsUp className="w-3 h-3" /> Yes
                </button>
                <button onClick={() => submitVote('unhelpful')} disabled={loading} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-bold tracking-wider text-gray-400 hover:text-red-400 transition-all cursor-pointer min-h-[44px] disabled:opacity-50">
                  <ThumbsDown className="w-3 h-3" /> Needs improvement
                </button>
                <button onClick={() => submitVote('needs_data')} disabled={loading} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-bold tracking-wider text-gray-400 hover:text-amber-400 transition-all cursor-pointer min-h-[44px] disabled:opacity-50">
                  <AlertTriangle className="w-3 h-3" /> Needs More Data
                </button>
              </div>
            )}
            {errorStatus === 'feedback-error' && (
              <p className="text-[10px] text-red-400 mt-2 uppercase tracking-tighter">Feedback temporarily unavailable.</p>
            )}
          </div>

          <div className="border-t border-white/5 pt-4">
            <p className="text-[10px] text-gray-500 tracking-wider uppercase mb-2">Suggest an anime for the archive</p>
            {suggestionSent ? (
              <p className="text-[10px] tracking-wider" style={{ color: accentColor }}>Suggestion recorded. Thank you.</p>
            ) : (
              <form onSubmit={submitSuggestion} className="flex gap-2">
                <input type="text" value={suggestion} onChange={e => setSuggestion(e.target.value)} maxLength={100} placeholder="Anime name..." className="flex-1 bg-transparent border-b border-white/10 focus:border-white/30 text-sm text-gray-300 py-2 px-1 outline-none transition-colors placeholder:text-gray-600 min-h-[44px]" />
                <button type="submit" disabled={loading || !suggestion.trim()} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer min-h-[44px] disabled:opacity-30" style={{ color: accentColor }}>
                  <Send className="w-3 h-3" /> Submit
                </button>
              </form>
            )}
            {errorStatus === 'suggest-error' && (
              <p className="text-[10px] text-red-400 mt-2 uppercase tracking-tighter">Suggestion system temporarily unavailable.</p>
            )}
          </div>

          <div className="border-t border-white/5 pt-4">
            <p className="text-[10px] text-gray-500 tracking-wider uppercase mb-2">Spot a correction? Send a quick issue note</p>
            {correctionSent ? (
              <p className="text-[10px] tracking-wider" style={{ color: accentColor }}>Correction signal received.</p>
            ) : (
              <form onSubmit={submitCorrection} className="space-y-2">
                <textarea
                  value={correction}
                  onChange={(e) => setCorrection(e.target.value)}
                  maxLength={280}
                  placeholder="Example: Character rank should be revised, or relationship edge looks wrong..."
                  className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-gray-300 outline-none focus:border-white/25 min-h-[96px]"
                />
                <button
                  type="submit"
                  disabled={loading || !correction.trim()}
                  className="min-h-[44px] px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer disabled:opacity-30 inline-flex items-center gap-1.5"
                  style={{ color: accentColor }}
                >
                  <Wrench className="w-3 h-3" /> Send correction
                </button>
              </form>
            )}
            {errorStatus === 'correction-error' && (
              <p className="text-[10px] text-red-400 mt-2 uppercase tracking-tighter">Correction endpoint temporarily unavailable.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
