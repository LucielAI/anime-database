import { useEffect } from 'react'
import { X } from 'lucide-react'

const SHORTCUTS = [
  { key: '?', description: 'Show keyboard shortcuts', context: 'Global' },
  { key: 'Esc', description: 'Close this overlay', context: 'Global' },
  { key: 'j', description: 'Next tab', context: 'Dashboard' },
  { key: 'k', description: 'Previous tab', context: 'Dashboard' },
  { key: 't', description: 'Toggle system mode', context: 'Dashboard' },
  { key: 's', description: 'Open share menu', context: 'Dashboard' },
  { key: 'r', description: 'Open share frame', context: 'Dashboard' },
  { key: 'h', description: 'Go to homepage', context: 'Global' },
  { key: 'c', description: 'Open compare page', context: 'Global' },
  { key: 'u', description: 'Go to universes catalog', context: 'Global' },
]

export default function KeyboardShortcutsOverlay({ onClose }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="keyboard-shortcuts-heading"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md rounded-2xl border border-white/20 bg-[#0a0a10] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8" />
            </svg>
            <h2 id="keyboard-shortcuts-heading" className="text-sm font-bold uppercase tracking-[0.2em] text-white">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {['Global', 'Dashboard'].map((section) => (
            <div key={section}>
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2">{section}</p>
              <div className="space-y-1">
                {SHORTCUTS.filter((s) => s.context === section).map((s) => (
                  <div key={s.key} className="flex items-center justify-between py-1">
                    <span className="text-xs text-gray-300">{s.description}</span>
                    <kbd className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded border border-white/20 bg-white/5 text-[10px] font-mono text-gray-200 shadow-sm">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-white/10 bg-black/30">
          <p className="text-[10px] text-gray-600 text-center">Press <kbd className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded border border-white/10 bg-white/5 text-[9px] font-mono">?</kbd> anytime to open this overlay</p>
        </div>
      </div>
    </div>
  )
}
