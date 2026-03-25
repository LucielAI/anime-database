import React, { useMemo, lazy, Suspense } from 'react'
import AffinityMatrix from '../components/AffinityMatrix'

// Deterministic hash from two name strings — replaces Math.random() to prevent
// matrix values from flickering on every render.
function nameHash(a, b) {
  let h = 0
  const s = a + b
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0
  }
  return Math.abs(h) % 15
}

const StandardCardsExplorer = lazy(() => import('./StandardCardsExplorer'))

export default React.memo(function AffinityMatrixExplorer({ characters = [], isSystemMode, theme }) {
  const types = useMemo(() => characters.map(c => c.name), [characters])

  // Memoized deterministic affinity matrix based on danger level similarity + name hash
  const matrix = useMemo(() =>
    characters.map((row, ri) =>
      characters.map((col, ci) => {
        if (ri === ci) return 100
        const dlDiff = Math.abs((row.dangerLevel || 5) - (col.dangerLevel || 5))
        return Math.max(10, 100 - dlDiff * 12 + nameHash(row.name, col.name))
      })
    ),
    [characters]
  )

  if (types.length === 0) {
    return (
      <Suspense fallback={<div className="w-full h-64 bg-white/5 rounded-xl animate-pulse" />}>
        <StandardCardsExplorer characters={characters} isSystemMode={isSystemMode} theme={theme} />
      </Suspense>
    )
  }

  return (
    <div className="space-y-6 font-mono">
      <h3 className="text-xs tracking-widest text-gray-500 mb-3">
        {isSystemMode ? '// COMPATIBILITY MATRIX' : '// CHARACTER AFFINITY WEB'}
      </h3>
      <AffinityMatrix types={types} matrix={matrix} />
      <div className="mt-6">
        <Suspense fallback={<div className="w-full h-64 bg-white/5 rounded-xl animate-pulse" />}>
          <StandardCardsExplorer characters={characters} isSystemMode={isSystemMode} theme={theme} />
        </Suspense>
      </div>
    </div>
  )
})
