import { useState } from 'react'
import Toggle from './components/Toggle.jsx'

const TABS = ['POWER ENGINE', 'ENTITY DATABASE', 'FACTIONS', 'CORE LAWS']

export default function Dashboard({ data }) {
  const [activeTab, setActiveTab] = useState(0)
  const [isSystemMode, setIsSystemMode] = useState(false)

  const animeName = data?.name || 'UNKNOWN ARCHIVE'

  return (
    <div className="min-h-screen bg-[#050508] font-mono text-gray-300 flex flex-col">
      {/* Header */}
      <header className="border-b border-cyan-900/50 px-6 py-4 flex items-center justify-between">
        <h1 className="text-cyan-400 text-xl tracking-widest">{animeName}</h1>
        <Toggle
          isSystemMode={isSystemMode}
          onToggle={() => setIsSystemMode(!isSystemMode)}
        />
      </header>

      {/* Tab Navigation */}
      <nav className="flex border-b border-cyan-900/30 px-6">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`py-3 px-4 text-xs tracking-wider transition-colors ${
              activeTab === i
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-600 hover:text-gray-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="text-cyan-700 text-sm tracking-widest">
          [ {TABS[activeTab]} — AWAITING DATA ]
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-cyan-900/30 px-6 py-3 text-center">
        <p className="text-gray-700 text-xs tracking-wider">
          ANIME ARCHITECTURE ARCHIVE // {isSystemMode ? 'SYS' : 'LORE'} MODE
        </p>
      </footer>
    </div>
  )
}
