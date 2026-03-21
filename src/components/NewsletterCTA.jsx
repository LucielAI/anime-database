import { useState, useCallback, useRef } from 'react'
import { Mail, Check, AlertCircle } from 'lucide-react'

function isValidEmail(email) {
  return typeof email === 'string' && email.includes('@') && email.length <= 254
}

export default function NewsletterCTA() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // 'idle' | 'loading' | 'success' | 'error'
  const lastSubmitTime = useRef(0)

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      const now = Date.now()
      if (now - lastSubmitTime.current < 5000) return
      lastSubmitTime.current = now

      const trimmed = email.trim()
      if (!isValidEmail(trimmed)) return

      setStatus('loading')

      try {
        const response = await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmed }),
        })

        if (!response.ok) {
          setStatus('error')
          return
        }

        setStatus('success')
        setEmail('')
      } catch {
        setStatus('error')
      }
    },
    [email]
  )

  return (
    <div className="w-full">
      <div className="rounded-xl border border-cyan-400/20 bg-[#0a0a10] p-5 md:p-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="mt-0.5 flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-md bg-cyan-400/10 border border-cyan-400/20">
            <Mail className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white font-mono">
              Get notified when new universes drop
            </h3>
            <p className="text-[11px] text-gray-500 tracking-wide mt-0.5 font-mono">
              No spam. Just structural intelligence.
            </p>
          </div>
        </div>

        {/* Success state */}
        {status === 'success' ? (
          <div className="flex items-center gap-2 py-2">
            <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <p className="text-[11px] font-mono tracking-wider text-cyan-400 uppercase">
              You&apos;re in. Welcome to the archive.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (status === 'error') setStatus('idle')
              }}
              placeholder="your@email.com"
              maxLength={254}
              disabled={status === 'loading'}
              className="flex-1 min-w-0 bg-transparent border border-white/10 focus:border-cyan-400/40 rounded-lg px-3 py-2.5 text-xs text-gray-300 placeholder:text-gray-600 outline-none transition-colors font-mono disabled:opacity-50 min-h-[44px]"
            />
            <button
              type="submit"
              disabled={status === 'loading' || !email.trim()}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-cyan-400/30 bg-cyan-400/10 hover:bg-cyan-400/20 text-[10px] font-bold tracking-[0.15em] uppercase text-cyan-400 transition-all cursor-pointer disabled:opacity-40 min-h-[44px] font-mono"
            >
              {status === 'loading' ? (
                <span className="opacity-70">...</span>
              ) : (
                'Subscribe'
              )}
            </button>
          </form>
        )}

        {/* Error state */}
        {status === 'error' && (
          <div className="flex items-center gap-1.5 mt-2">
            <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
            <p className="text-[10px] font-mono tracking-wider text-red-400 uppercase">
              Something broke. Try again.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
