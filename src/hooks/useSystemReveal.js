import { useState, useCallback, useRef, useEffect } from 'react'

export function useSystemReveal() {
  const [isRevealing, setIsRevealing] = useState(false)
  const [revealStep, setRevealStep] = useState(0)
  const timeoutsRef = useRef([])
  const revealIdRef = useRef(0)

  const cancelReveal = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
    setIsRevealing(false)
    setRevealStep(0)
  }, [])

  const startReveal = useCallback(() => {
    const currentId = ++revealIdRef.current
    cancelReveal()
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    if (prefersReducedMotion) {
      setIsRevealing(true)
      setRevealStep(5)
      const t = setTimeout(() => {
        if (revealIdRef.current !== currentId) return
        setIsRevealing(false)
        setRevealStep(0)
      }, 1000)
      timeoutsRef.current.push(t)
      return
    }

    setIsRevealing(true)
    setRevealStep(1) // Emphasize header

    timeoutsRef.current.push(setTimeout(() => {
      if (revealIdRef.current !== currentId) return
      setRevealStep(2)
    }, 800)) // SystemSummary Bullets

    timeoutsRef.current.push(setTimeout(() => {
      if (revealIdRef.current !== currentId) return
      setRevealStep(3)
    }, 2500)) // WhyThisRenderer Highlight

    timeoutsRef.current.push(setTimeout(() => {
      if (revealIdRef.current !== currentId) return
      setRevealStep(4)
    }, 4000)) // Graph Wow Moment

    timeoutsRef.current.push(setTimeout(() => {
      if (revealIdRef.current !== currentId) return
      setRevealStep(5)
    }, 6000)) // AI Insight Reveal
    
    // End sequence
    timeoutsRef.current.push(setTimeout(() => {
      if (revealIdRef.current !== currentId) return
      setIsRevealing(false)
      setRevealStep(0)
    }, 14000))

  }, [cancelReveal])

  useEffect(() => {
    return () => cancelReveal()
  }, [cancelReveal])

  return { isRevealing, revealStep, startReveal, cancelReveal }
}
