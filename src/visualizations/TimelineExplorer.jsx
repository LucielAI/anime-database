import React from 'react'
import Timeline from '../components/Timeline'
import { lazy, Suspense } from 'react'

const StandardCardsExplorer = lazy(() => import('./StandardCardsExplorer'))

export default React.memo(function TimelineExplorer({ characters = [], causalEvents = [], relationships = [], isSystemMode, theme }) {
  if (causalEvents.length === 0 && characters.length === 0) {
    return (
      <Suspense fallback={<div className="w-full h-64 bg-white/5 rounded-xl animate-pulse" />}>
        <StandardCardsExplorer characters={characters} isSystemMode={isSystemMode} theme={theme} />
      </Suspense>
    )
  }

  return (
    <Timeline
      characters={characters}
      causalEvents={causalEvents}
      relationships={relationships}
      isSystemMode={isSystemMode}
      theme={theme}
    />
  )
})
