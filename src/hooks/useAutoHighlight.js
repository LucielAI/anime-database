import { useState, useEffect, useCallback, useRef } from 'react'

// Shared "wow graph moment" logic.
// Auto-selects the highest-degree node (or first match from `preferredNames`)
// after a delay, then clears after `duration` ms. Respects user interaction.
export function useAutoHighlight({
  items = [],
  relationships = [],
  isRevealing = false,
  revealStep = 0,
  delay = 600,
  duration = 2000,
}) {
  const [highlighted, setHighlighted] = useState(null)
  const [hasInteracted, setHasInteracted] = useState(false)
  const timerRef = useRef(null)
  const clearRef = useRef(null)

  const findBestTarget = useCallback(() => {
    if (items.length === 0) return null
    // Fallback: highest-degree node
    const degrees = {}
    relationships.forEach(r => {
      const sName = typeof r.source === 'object' ? r.source.name : r.source
      const tName = typeof r.target === 'object' ? r.target.name : r.target
      degrees[sName] = (degrees[sName] || 0) + 1
      degrees[tName] = (degrees[tName] || 0) + 1
    })
    const maxNode = Object.keys(degrees).reduce(
      (a, b) => (degrees[a] || 0) > (degrees[b] || 0) ? a : b,
      items[0]?.name || null
    )
    return maxNode
  }, [items, relationships])

  const triggerHighlight = useCallback((customDelay) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (clearRef.current) clearTimeout(clearRef.current)

    const d = customDelay ?? delay
    timerRef.current = setTimeout(() => {
      if (!hasInteracted) {
        const target = findBestTarget()
        if (target) {
          setHighlighted(target)
          clearRef.current = setTimeout(() => {
            setHighlighted(prev => prev === target ? null : prev)
          }, duration)
        }
      }
    }, d)

    return () => {
      clearTimeout(timerRef.current)
      clearTimeout(clearRef.current)
    }
  }, [delay, duration, hasInteracted, findBestTarget])

  // Initial highlight on mount
  useEffect(() => {
    if (!isRevealing && items.length > 0 && relationships.length > 0) {
      return triggerHighlight(delay)
    }
  }, [isRevealing, items.length, relationships.length, triggerHighlight, delay])

  // Reveal sequence highlight at step 4
  useEffect(() => {
    if (isRevealing && revealStep === 4) {
      return triggerHighlight(0)
    }
  }, [isRevealing, revealStep, triggerHighlight])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (clearRef.current) clearTimeout(clearRef.current)
    }
  }, [])

  const markInteracted = useCallback(() => {
    setHasInteracted(true)
  }, [])

  return { highlighted, setHighlighted, markInteracted, hasInteracted }
}
