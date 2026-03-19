import { useMemo, useState } from 'react'
import { Flame, HeartHandshake, Radio, Send } from 'lucide-react'

const SUPPORT_URL = 'https://buymeacoffee.com/hashiai'

export default function CommunityPulse({ quickVoteCandidates = [] }) {
  const [customSuggestion, setCustomSuggestion] = useState('')
  const [loadingChoice, setLoadingChoice] = useState('')
  const [status, setStatus] = useState(null)

  const canSubmitCustom = useMemo(() => customSuggestion.trim().length > 0, [customSuggestion])

  const submitSuggestion = async (name, source = 'quick-vote') => {
    const sanitized = name.trim().slice(0, 100)
    if (!sanitized) return

    setLoadingChoice(sanitized)
    setStatus(null)

    try {
      const response = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animeName: sanitized, source })
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        if (payload?.code === 'config_missing') throw new Error('config_missing')
        throw new Error('submission_failed')
      }

      setStatus(`Added ${sanitized} to the request list.`)
      setCustomSuggestion('')
    } catch (error) {
      setStatus(error?.message === 'config_missing' ? 'Suggestion endpoint is offline: missing Supabase configuration.' : 'Suggestion endpoint is temporarily unavailable.')
    } finally {
      setLoadingChoice('')
    }
  }

  return (
    <section className="max-w-6xl mx-auto px-6 mt-2 mb-10" aria-labelledby="community-pulse-heading">
      <div className="rounded-xl border border-white/5 bg-[#0a0a10] p-4 md:p-4.5">
        <div className="flex items-center gap-2 mb-3">
          <Radio className="w-4 h-4 text-cyan-400" />
          <h2 id="community-pulse-heading" className="text-[10px] tracking-[0.22em] uppercase font-bold text-white/70">What Should We Cover Next?</h2>
        </div>

        <p className="text-[11px] text-gray-400 leading-relaxed mb-3">
          Vote for the next anime breakdown, or send your own request.
        </p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {quickVoteCandidates.length > 0 ? quickVoteCandidates.map((candidate) => (
            <button
              key={candidate}
              onClick={() => submitSuggestion(candidate)}
              disabled={Boolean(loadingChoice)}
              className="px-2.5 py-1.5 min-h-[38px] rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] tracking-[0.14em] uppercase font-bold text-gray-300 transition-all disabled:opacity-50"
            >
              {loadingChoice === candidate ? 'Saving...' : candidate}
            </button>
          )) : (
            <p className="text-[11px] text-gray-500">Updating suggestions… you can still submit your own request below.</p>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!canSubmitCustom || loadingChoice) return
            submitSuggestion(customSuggestion, 'custom-request')
          }}
          className="flex gap-2 items-end"
        >
          <input
            value={customSuggestion}
            onChange={(e) => setCustomSuggestion(e.target.value)}
            maxLength={100}
            placeholder="Request another anime..."
            className="flex-1 min-h-[38px] bg-transparent border-b border-white/10 focus:border-cyan-400/60 text-sm text-gray-300 px-1 outline-none"
          />
          <button
            type="submit"
            disabled={!canSubmitCustom || Boolean(loadingChoice)}
            className="min-h-[38px] px-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] tracking-[0.16em] uppercase font-bold text-cyan-300 transition-all disabled:opacity-40 flex items-center gap-1.5"
          >
            <Send className="w-3 h-3" />
            Submit
          </button>
        </form>

        {status && <p className="mt-3 text-[10px] tracking-[0.12em] uppercase text-cyan-300/90">{status}</p>}

        <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap gap-1.5">
          <a
            href="https://www.tiktok.com/@hashi.ai"
            target="_blank"
            rel="noreferrer"
            className="min-h-[38px] px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] tracking-[0.14em] uppercase font-bold text-gray-300 inline-flex items-center gap-1.5"
          >
            <Flame className="w-3 h-3 text-cyan-400" /> Follow updates
          </a>
          <a
            href={SUPPORT_URL}
            target="_blank"
            rel="noreferrer"
            className="min-h-[38px] px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] tracking-[0.14em] uppercase font-bold text-gray-300 inline-flex items-center gap-1.5"
          >
            <HeartHandshake className="w-3 h-3 text-emerald-400" /> Buy me a coffee
          </a>
        </div>
      </div>
    </section>
  )
}
