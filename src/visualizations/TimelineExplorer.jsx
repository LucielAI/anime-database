import Timeline from '../components/Timeline'
import StandardCardsExplorer from './StandardCardsExplorer'

export default function TimelineExplorer({ characters = [], causalEvents = [], relationships = [], isSystemMode, theme }) {
  if (causalEvents.length === 0 && characters.length === 0) {
    return <StandardCardsExplorer characters={characters} isSystemMode={isSystemMode} theme={theme} />
  }

  return (
    <Timeline
      characters={characters}
      causalEvents={causalEvents}
      isSystemMode={isSystemMode}
      theme={theme}
    />
  )
}
