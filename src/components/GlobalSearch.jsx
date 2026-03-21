import { useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, User, Zap, Users, ShieldAlert, Globe } from 'lucide-react'
import { useSearch } from '../hooks/useSearch'

const TYPE_META = {
  universe: {
    label: 'Universe',
    icon: Globe,
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10 border-cyan-400/30',
  },
  character: {
    label: 'Character',
    icon: User,
    color: 'text-violet-400',
    bg: 'bg-violet-400/10 border-violet-400/30',
  },
  power: {
    label: 'Power',
    icon: Zap,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10 border-amber-400/30',
  },
  faction: {
    label: 'Faction',
    icon: Users,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10 border-emerald-400/30',
  },
  rule: {
    label: 'Rule',
    icon: ShieldAlert,
    color: 'text-rose-400',
    bg: 'bg-rose-400/10 border-rose-400/30',
  },
}

const GROUP_ORDER = ['universe', 'character', 'power', 'faction', 'rule']

function TypeBadge({ type }) {
  const meta = TYPE_META[type] || TYPE_META.universe
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold tracking-[0.15em] uppercase border ${meta.bg} ${meta.color}`}>
      {meta.label}
    </span>
  )
}

function ResultItem({ item, onNavigate, isFirst }) {
  const meta = TYPE_META[item.type] || TYPE_META.universe
  const Icon = meta.icon

  return (
    <button
      onClick={() => onNavigate(item.url)}
      className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors group ${isFirst ? 'border-l-2 border-cyan-400' : 'border-l-2 border-transparent hover:border-white/20'}`}
    >
      <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${meta.bg}`}>
        <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-white truncate">{item.name}</span>
          <TypeBadge type={item.type} />
        </div>
        {item.anime && item.type !== 'universe' && (
          <p className="text-[10px] tracking-[0.12em] uppercase text-gray-500 mt-0.5">{item.anime}</p>
        )}
        {item.description && (
          <p className="text-xs text-gray-400 mt-1 line-clamp-1">{item.description}</p>
        )}
      </div>
    </button>
  )
}

function ResultsGroup({ type, items, onNavigate, firstOverallIndex }) {
  if (!items || items.length === 0) return null
  const meta = TYPE_META[type]

  return (
    <div>
      <div className="px-4 py-1.5 border-b border-white/5">
        <p className={`text-[9px] font-bold tracking-[0.22em] uppercase ${meta.color}`}>{meta.label}s</p>
      </div>
      {items.map((item, index) => (
        <ResultItem
          key={item.id}
          item={item}
          onNavigate={onNavigate}
          isFirst={firstOverallIndex === 0 && index === 0}
        />
      ))}
    </div>
  )
}

export default function GlobalSearch({ isOpen, onClose }) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const { query, setQuery, grouped, isLoading, isReady, loadIndex } = useSearch()

  // Load index when modal opens
  useEffect(() => {
    if (isOpen) {
      loadIndex()
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen, loadIndex])

  // Reset query when modal closes
  useEffect(() => {
    if (!isOpen) setQuery('')
  }, [isOpen, setQuery])

  const handleNavigate = useCallback((url) => {
    navigate(url)
    onClose()
  }, [navigate, onClose])

  // Keyboard handler
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'Enter') {
        // Navigate to first result
        for (const type of GROUP_ORDER) {
          const items = grouped[type]
          if (items && items.length > 0) {
            handleNavigate(items[0].url)
            return
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, grouped, onClose, handleNavigate])

  const hasResults = GROUP_ORDER.some((type) => grouped[type]?.length > 0)
  const totalResults = GROUP_ORDER.reduce((sum, type) => sum + (grouped[type]?.length || 0), 0)

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh] px-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-2xl bg-[#0a0a12] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">

        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search characters, powers, factions, rules..."
            className="flex-1 bg-transparent text-base text-white placeholder-gray-500 outline-none font-mono tracking-wide"
            autoComplete="off"
            spellCheck={false}
          />
          <div className="flex items-center gap-2">
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-gray-500 hover:text-gray-300 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              aria-label="Close search"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results area */}
        <div className="max-h-[60vh] overflow-y-auto">
          {!query && (
            <div className="px-4 py-8 text-center">
              <Search className="w-8 h-8 text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-mono">
                {isReady ? 'Type to search across all universes' : isLoading ? 'Loading search index…' : 'Search index loading…'}
              </p>
              <p className="text-[10px] text-gray-600 mt-2 tracking-[0.14em] uppercase">Characters · Powers · Factions · Rules</p>
            </div>
          )}

          {query && !hasResults && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-gray-400">No results for <span className="text-white">"{query}"</span></p>
              <p className="text-xs text-gray-600 mt-2">Try a character name, power system, or anime title</p>
            </div>
          )}

          {query && hasResults && (
            <>
              {GROUP_ORDER.map((type) => (
                <ResultsGroup
                  key={type}
                  type={type}
                  items={grouped[type]}
                  onNavigate={handleNavigate}
                  firstOverallIndex={GROUP_ORDER.indexOf(type)}
                />
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[9px] tracking-[0.14em] uppercase text-gray-600">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-gray-400 font-mono text-[9px]">↵</kbd>
              first result
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-gray-400 font-mono text-[9px]">esc</kbd>
              close
            </span>
          </div>
          {totalResults > 0 && (
            <button
              onClick={() => { navigate(`/search?q=${encodeURIComponent(query)}`); onClose() }}
              className="text-[9px] tracking-[0.14em] uppercase text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              View all {totalResults} results →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
