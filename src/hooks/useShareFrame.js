import { useState, useCallback } from 'react'

export function useShareFrame() {
  const [isShareFrame, setIsShareFrame] = useState(false)
  const toggleShareFrame = useCallback(() => setIsShareFrame(prev => !prev), [])
  return { isShareFrame, toggleShareFrame }
}
