import { useState, useCallback, useRef, useEffect } from 'react'

export function useSystemReveal() {
  const [isRevealing, setIsRevealing] = useState(false)
  const [revealStep, setRevealStep] = useState(0)
  const timeoutsRef = useRef([])

  const cancelReveal = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
    setIsRevealing(false)
    setRevealStep(0)
  }, [])

  const startReveal = useCallback(() => {
    cancelReveal()
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    if (prefersReducedMotion) {
      setIsRevealing(true)
      setRevealStep(5)
      timeoutsRef.current.push(setTimeout(() => {
        setIsRevealing(false)
        setRevealStep(0)
      }, 1000))
      return
    }

    setIsRevealing(true)
    setRevealStep(1) // Emphasize header

    timeoutsRef.current.push(setTimeout(() => setRevealStep(2), 800)) // SystemSummary Bullets
    timeoutsRef.current.push(setTimeout(() => setRevealStep(3), 2500)) // WhyThisRenderer Highlight
    timeoutsRef.current.push(setTimeout(() => setRevealStep(4), 4000)) // Graph Wow Moment
    timeoutsRef.current.push(setTimeout(() => setRevealStep(5), 6000)) // AI Insight Reveal
    
    // End sequence
    timeoutsRef.current.push(setTimeout(() => {
      setIsRevealing(false)
      setRevealStep(0)
    }, 14000))

  }, [cancelReveal])

  useEffect(() => {
    return () => cancelReveal()
  }, [cancelReveal])

  return { isRevealing, revealStep, startReveal, cancelReveal }
}
