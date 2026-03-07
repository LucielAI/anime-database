import { useState } from 'react'

export default function CounterTree({ counterplay = [], characters = [] }) {
  const [selectedEdge, setSelectedEdge] = useState(null)

  const charMap = {}
  characters.forEach((c) => { charMap[c.name] = c })

  return (
    <div className="w-full font-mono space-y-3">
      {counterplay.map((cp, i) => {
        const isSelected = selectedEdge === i
        return (
          <div
            key={i}
            onClick={() => setSelectedEdge(isSelected ? null : i)}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-2 p-3 bg-[#0a0a14] rounded-lg border border-white/10 hover:border-white/20 transition-colors">
              <div className="flex-shrink-0 border-2 border-green-500 rounded-lg px-3 py-1.5">
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

              <div className="flex-shrink-0 border-2 border-red-500 rounded-lg px-3 py-1.5">
                <span className="text-red-400 text-xs font-bold">{cp.defender}</span>
              </div>
            </div>

            {isSelected && cp.loreDesc && (
              <div className="mt-1 ml-4 mr-4 bg-black/60 border border-cyan-900 rounded px-3 py-2 text-xs text-cyan-300">
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
}
