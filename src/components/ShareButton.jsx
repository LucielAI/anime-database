import { useState, useCallback } from 'react'
import { Link2, Check } from 'lucide-react'
import { trackShareButton } from '../utils/analytics'

export default function ShareButton({ id, title, systemLabel, url, theme }) {
  const [copied, setCopied] = useState(false)

  const handleShare = useCallback(async () => {
    const shareText = `${title} — ${systemLabel}`
    const shareData = { title: shareText, url }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        trackShareButton('native')
        return
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareText}\n${url}`)
      setCopied(true)
      trackShareButton('clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard also failed — silent fail
    }
  }, [title, systemLabel, url])

  return (
    <button
      id={id}
      onClick={handleShare}
      className="group flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer min-h-[44px]"
      style={{ color: copied ? '#22c55e' : (theme?.primary || '#9ca3af') }}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5" />
          COPIED!
        </>
      ) : (
        <>
          <Link2 className="w-3.5 h-3.5" />
          SHARE SYSTEM
        </>
      )}
    </button>
  )
}
