import { useState } from 'react'
import CounterTree from '../components/CounterTree'
import StandardCardsExplorer from './StandardCardsExplorer'
import { resolveColor } from '../utils/resolveColor'

export default function CounterTreeExplorer({ characters = [], counterplay = [], powerSystem = [], isSystemMode, theme }) {
  const [selectedPower, setSelectedPower] = useState(null)
  const accent = theme?.accent || '#22d3ee'

  const hasCounterplay = counterplay.length > 0

  if (characters.length === 0) {
    return (
      <div className="text-center text-gray-600 text-sm font-mono py-12">
        [ NO ENTITY DATA ]
      </div>
    )
  }

  return (
    <div className="space-y-6 font-mono">
      {/* Power hierarchy tree */}
      {powerSystem.length > 0 && (
        <div>
          <h3 className="text-xs tracking-widest text-gray-500 mb-3">// POWER HIERARCHY</h3>
          <div className="space-y-2">
            {powerSystem.map((ps, i) => {
              const isSelected = selectedPower === i
              const charsInSystem = characters.filter(c =>
                c.loreBio?.toLowerCase().includes(ps.name?.toLowerCase()) ||
                c.systemBio?.toLowerCase().includes(ps.name?.toLowerCase())
              )
              return (
                <div key={i}>
                  <div
                    className="flex items-center gap-3 p-3 rounded-lg border border-white/10 cursor-pointer hover:border-white/20 transition-colors"
                    style={{ backgroundColor: isSelected ? accent + '10' : '#0a0a14' }}
                    onClick={() => setSelectedPower(isSelected ? null : i)}
                  >
                    <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold" style={{ borderColor: accent, color: accent }}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-bold" style={{ color: accent }}>{ps.name}</span>
                      <p className="text-[10px] text-gray-500 truncate">{isSystemMode ? ps.systemDesc || ps.loreDesc : ps.loreDesc}</p>
                    </div>
                  </div>
                  {isSelected && charsInSystem.length > 0 && (
                    <div className="ml-8 mt-1 pl-3 border-l border-white/10 space-y-1">
                      {charsInSystem.map(c => (
                        <div key={c.name} className="text-[10px] text-gray-400 py-1">
                          <span style={{ color: resolveColor(c.accentColor, accent) }}>{c.name}</span> — {c.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Counterplay tree */}
      {hasCounterplay && (
        <div>
          <h3 className="text-xs tracking-widest text-gray-500 mb-3">// COUNTERPLAY MATRIX</h3>
          <CounterTree counterplay={counterplay} characters={characters} />
        </div>
      )}

      {/* Character cards fallback when no counterplay */}
      {!hasCounterplay && (
        <div>
          <h3 className="text-xs tracking-widest text-gray-500 mb-3">// ENTITY ROSTER</h3>
          <StandardCardsExplorer characters={characters} isSystemMode={isSystemMode} theme={theme} />
        </div>
      )}
    </div>
  )
}
