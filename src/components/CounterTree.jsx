import { useState, useEffect, useCallback, useRef, memo } from 'react'

export default memo(function CounterTree({ counterplay = [], characters = [], isRevealing, revealStep }) {
  const [selectedEdge, setSelectedEdge] = useState(null)
  const [hasInteracted, setHasInteracted] = useState(false)
  const timerRef = useRef(null)
  const clearRef = useRef(null)

  // Auto-highlight: select the first counterplay entry on load
  const triggerPulse = useCallback((delay = 600) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (clearRef.current) clearTimeout(clearRef.current)
    timerRef.current = setTimeout(() => {
      if (!hasInteracted && selectedEdge === null && counterplay.length > 0) {
        const targetIndex = 0
        setSelectedEdge(targetIndex)
        clearRef.current = setTimeout(() => {
          setSelectedEdge(prev => prev === targetIndex ? null : prev)
        }, 2000)
      }
    }, delay)
    return () => { clearTimeout(timerRef.current); clearTimeout(clearRef.current) }
  }, [counterplay, hasInteracted, selectedEdge])

  useEffect(() => {
    if (!isRevealing) return triggerPulse(600)
  }, [isRevealing, triggerPulse])

  useEffect(() => {
    if (isRevealing && revealStep === 4) return triggerPulse(0)
  }, [isRevealing, revealStep, triggerPulse])

  useEffect(() => {
    return () => { clearTimeout(timerRef.current); clearTimeout(clearRef.current) }
  }, [])

  const charMap = {}
  characters.forEach((c) => { charMap[c.name] = c })

  return (
    <div className="w-full font-mono space-y-3">
      {counterplay.map((cp, i) => {
        const isSelected = selectedEdge === i
        return (
          <div
            key={i}
            onClick={() => {
              setHasInteracted(true)
              setSelectedEdge(isSelected ? null : i)
            }}
            className="cursor-pointer"
          >
            {/* Desktop: horizontal layout */}
            <div className="hidden sm:flex items-center gap-2 p-3 bg-[#0a0a14] rounded-lg border border-white/10 hover:border-white/20 transition-colors">
              <div className="shrink-0 border-2 border-green-500 rounded-lg px-3 py-1.5">
                <span className="text-green-400 text-xs font-bold">{cp.attacker}</span>
              </div>

              <div className="flex-1 flex items-center gap-1 min-w-0">
                <div className="flex-1 h-px bg-white/20" />
                <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-0.5 whitespace-nowrap">
                  {cp.mechanic}
                </span>
                <div className="flex items-center gap-0">
                  <div className="flex-1 h-px bg-white/20" />
                  <span className="text-white/40 text-xs">▶</span>
                </div>
              </div>

              <div className="shrink-0 border-2 border-red-500 rounded-lg px-3 py-1.5">
                <span className="text-red-400 text-xs font-bold">{cp.defender}</span>
              </div>
            </div>

            {/* Mobile: stacked layout */}
            <div className="sm:hidden p-3 bg-[#0a0a14] rounded-lg border border-white/10 hover:border-white/20 transition-colors space-y-2">
              <div className="flex items-center gap-3">
                <div className="border-2 border-green-500 rounded-lg px-3 py-1.5 flex-1 min-w-0">
                  <span className="text-green-400 text-xs font-bold truncate block">{cp.attacker}</span>
                </div>
                <span className="text-white/40 text-xs shrink-0">▶</span>
                <div className="border-2 border-red-500 rounded-lg px-3 py-1.5 flex-1 min-w-0">
                  <span className="text-red-400 text-xs font-bold truncate block">{cp.defender}</span>
                </div>
              </div>
              <div className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-1 text-center">
                {cp.mechanic}
              </div>
            </div>

            {isSelected && cp.loreDesc && (
              <div className="mt-2 mx-2 sm:mx-4 bg-[#050508]/90 backdrop-blur-md border border-cyan-500/30 rounded-lg px-4 py-3 text-xs text-cyan-100 shadow-lg leading-relaxed">
                {cp.loreDesc}
              </div>
            )}
          </div>
        )
      })}

      {counterplay.length === 0 && (
        <div className="text-center text-gray-600 text-sm py-8">
          [ NO COUNTERPLAY DATA ]
        </div>
      )}
    </div>
  )
})
