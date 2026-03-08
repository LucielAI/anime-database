import { useState, Fragment } from 'react'

function getCellColor(value, isDiagonal) {
  if (isDiagonal) return 'bg-cyan-500/30 text-cyan-300'
  if (value >= 80) return 'bg-emerald-500/25 text-emerald-300'
  if (value >= 60) return 'bg-yellow-500/25 text-yellow-300'
  if (value >= 40) return 'bg-orange-500/25 text-orange-300'
  return 'bg-red-500/25 text-red-300'
}

export default function AffinityMatrix({ types = [], matrix = [] }) {
  const [tooltip, setTooltip] = useState(null)

  if (types.length === 0) {
    return (
      <div className="text-center text-gray-600 text-sm font-mono py-8">
        [ NO TYPE DATA ]
      </div>
    )
  }

  return (
    <div className="relative w-full font-mono overflow-x-auto">
      <div
        className="inline-grid gap-px bg-white/5 rounded-lg p-1"
        style={{
          gridTemplateColumns: `80px repeat(${types.length}, 56px)`,
        }}
      >
        {/* Header row */}
        <div />
        {types.map((t) => (
          <div
            key={`h-${t}`}
            className="text-[9px] text-gray-500 text-center py-1 truncate px-1"
            title={t}
          >
            {t.slice(0, 6)}
          </div>
        ))}

        {/* Data rows */}
        {types.map((rowType, ri) => (
          <Fragment key={`row-${ri}`}>
            <div
              className="text-[9px] text-gray-500 flex items-center pr-2 truncate"
              title={rowType}
            >
              {rowType.slice(0, 8)}
            </div>
            {types.map((colType, ci) => {
              const value = matrix[ri]?.[ci] ?? 0
              const isDiagonal = ri === ci
              return (
                <div
                  key={`${ri}-${ci}`}
                  className={`w-14 h-8 flex items-center justify-center text-[10px] font-bold rounded-sm cursor-default transition-all hover:scale-110 hover:z-10 ${getCellColor(value, isDiagonal)}`}
                  onMouseEnter={() =>
                    setTooltip({ rowType, colType, value })
                  }
                  onMouseLeave={() => setTooltip(null)}
                >
                  {value}%
                </div>
              )
            })}
          </Fragment>
        ))}
      </div>

      {tooltip && (
        <div className="absolute top-0 right-0 bg-black/90 border border-cyan-800 rounded px-3 py-2 text-xs text-cyan-300 pointer-events-none z-20">
          {tooltip.rowType} vs {tooltip.colType}: {tooltip.value}% compatibility
        </div>
      )}
    </div>
  )
}
