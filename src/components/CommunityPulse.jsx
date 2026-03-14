import { useMemo, useState } from 'react'
import { Flame, HeartHandshake, Radio, Send } from 'lucide-react'

const SUPPORT_URL = 'https://buymeacoffee.com/hashiai'

const NEXT_UNIVERSE_CANDIDATES = [
  'Naruto',
  'One Piece',
  'Chainsaw Man',
  'Bleach',
  'Monster',
  'Frieren'
]

export default function CommunityPulse() {
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
        throw new Error('submission_failed')
      }

      setStatus(`Signal logged for ${sanitized}.`)
      setCustomSuggestion('')
    } catch {
      setStatus('Signal endpoint is temporarily unavailable.')
    } finally {
      setLoadingChoice('')
    }
  }

  return (
    <section className="max-w-6xl mx-auto px-6 mt-4 mb-12">
      <div className="rounded-xl border border-white/5 bg-[#0a0a10] p-5 md:p-6">
        <div className="flex items-center gap-2 mb-3">
          <Radio className="w-4 h-4 text-cyan-400" />
          <h2 className="text-[11px] tracking-[0.25em] uppercase font-bold text-white/80">Community Pulse</h2>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed mb-4">
          Help steer the next archive drop. One tap vote, optional custom request.
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {NEXT_UNIVERSE_CANDIDATES.map((candidate) => (
            <button
              key={candidate}
              onClick={() => submitSuggestion(candidate)}
              disabled={Boolean(loadingChoice)}
              className="px-3 py-2 min-h-[44px] rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] tracking-[0.18em] uppercase font-bold text-gray-300 transition-all disabled:opacity-50"
            >
              {loadingChoice === candidate ? 'Logging...' : candidate}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!canSubmitCustom || loadingChoice) return
            submitSuggestion(customSuggestion, 'custom-request')
          }}
          className="flex gap-2"
        >
          <input
            value={customSuggestion}
            onChange={(e) => setCustomSuggestion(e.target.value)}
            maxLength={100}
            placeholder="Request another universe..."
            className="flex-1 min-h-[44px] bg-transparent border-b border-white/10 focus:border-cyan-400/60 text-sm text-gray-300 px-1 outline-none"
          />
          <button
            type="submit"
            disabled={!canSubmitCustom || Boolean(loadingChoice)}
            className="min-h-[44px] px-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] tracking-[0.2em] uppercase font-bold text-cyan-300 transition-all disabled:opacity-40 flex items-center gap-1.5"
          >
            <Send className="w-3 h-3" />
            Submit
          </button>
        </form>

        {status && <p className="mt-3 text-[10px] tracking-[0.12em] uppercase text-cyan-300/90">{status}</p>}

        <div className="mt-5 pt-4 border-t border-white/5 flex flex-wrap gap-2">
          <a
            href="https://www.tiktok.com/@kenshipeak"
            target="_blank"
            rel="noreferrer"
            className="min-h-[44px] px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] tracking-[0.18em] uppercase font-bold text-gray-300 inline-flex items-center gap-1.5"
          >
            <Flame className="w-3 h-3 text-cyan-400" /> Follow updates
          </a>
          <a
            href={SUPPORT_URL}
            target="_blank"
            rel="noreferrer"
            className="min-h-[44px] px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] tracking-[0.18em] uppercase font-bold text-gray-300 inline-flex items-center gap-1.5"
          >
            <HeartHandshake className="w-3 h-3 text-emerald-400" /> Buy me a coffee
          </a>
        </div>
      </div>
    </section>
  )
}
