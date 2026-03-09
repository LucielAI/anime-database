import { useState, useEffect } from 'react'
import { Terminal, ChevronRight, Zap, Target } from 'lucide-react'

export default function AIInsightPanel({ aiInsights, theme, isSystemMode, revealStep, isRevealing }) {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState('casual') // 'casual' | 'deep'
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  
  const content = aiInsights?.[mode] || 'No system analysis available for this configuration.'

  // System sequence auto-open
  useEffect(() => {
    if (isRevealing && revealStep >= 5 && !isOpen) {
      setTimeout(() => setIsOpen(true), 0)
    }
  }, [isRevealing, revealStep, isOpen])

  useEffect(() => {
    let isMounted = true
    
    if (!isOpen || !content) {
      const resetTimer = setTimeout(() => {
        if (isMounted) {
          setDisplayedText('')
          setIsTyping(false)
        }
      }, 0)
      return () => {
        isMounted = false
        clearTimeout(resetTimer)
      }
    }
    
    // Reset state when switching modes or opening
    let currentIndex = 0
    let active = true
    
    setTimeout(() => {
      if (active) {
        setDisplayedText('')
        setIsTyping(true)
      }
    }, 0)

    const typeSpeed = 15 // ms per chunk
    const chunkSize = 2 // reveal 2 chars at a time for smooth performance

    const revealText = () => {
      if (!active) return
      
      currentIndex += chunkSize
      if (currentIndex >= content.length) {
        setDisplayedText(content)
        setIsTyping(false)
      } else {
        setDisplayedText(content.slice(0, currentIndex))
        // using setTimeout to avoid layout thrashing and keep React batching happy
        setTimeout(revealText, typeSpeed) 
      }
    }

    // Start typing effect
    const timer = setTimeout(revealText, typeSpeed)
    
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [isOpen, mode, content])

  // Only render if aiInsights exist in payload
  if (!aiInsights || Object.keys(aiInsights).length === 0) return null

  const accentColor = isSystemMode ? (theme?.secondary || '#22d3ee') : (theme?.primary || '#8b5cf6')
  const glowAttr = isSystemMode ? (theme?.modeGlow || 'rgba(34,211,238,0.25)') : (theme?.glow || 'rgba(139,92,246,0.25)')

  return (
    <div className="max-w-6xl mx-auto px-6 mb-6">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center justify-between w-full p-4 border rounded-xl bg-[#050508]/60 hover:bg-white/5 transition-all duration-300 backdrop-blur-sm"
          style={{ borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <div className="flex items-center gap-3">
            <Terminal className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
            <span className="font-mono text-xs md:text-sm font-bold tracking-[0.2em] uppercase text-gray-400 group-hover:text-white transition-colors">
              Request Archive Analysis
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
        </button>
      ) : (
        <div 
          className="border rounded-xl bg-[#050508]/80 backdrop-blur-md overflow-hidden relative"
          style={{ 
            borderColor: accentColor,
            boxShadow: `0 0 25px ${glowAttr}`
          }}
        >
          {/* subtle background glow */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-10" 
            style={{ backgroundImage: `radial-gradient(circle at 50% 0%, ${accentColor}, transparent 70%)` }}
          />
          
          {/* Header & Tabs */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 p-3 bg-black/40 gap-3">
            <div className="flex items-center gap-2 pl-1">
              <Terminal className="w-4 h-4 text-white/70 animate-pulse" />
              <span className="font-mono text-[10px] tracking-[0.3em] font-bold text-white/50 uppercase">
                [SYSTEM READOUT ACTIVE]
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setMode('casual')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-[10px] font-bold tracking-[0.2em] transition-colors ${mode === 'casual' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
              >
                <Zap className="w-3 h-3" />
                CASUAL
              </button>
              <button 
                onClick={() => setMode('deep')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-[10px] font-bold tracking-[0.2em] transition-colors ${mode === 'deep' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
              >
                <Target className="w-3 h-3" />
                DEEP
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="ml-2 pl-3 border-l border-white/10 text-[10px] font-bold tracking-[0.2em] text-gray-500 hover:text-red-400 transition-colors uppercase"
              >
                CLOSE
              </button>
            </div>
          </div>
          
          {/* Body content */}
          <div className="relative z-10 p-5 md:p-6 min-h-[140px] font-mono text-sm leading-relaxed text-gray-300">
            {displayedText}
            {isTyping && (
              <span 
                className="inline-block w-2 h-4 ml-1 translate-y-1 animate-pulse"
                style={{ backgroundColor: accentColor }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
