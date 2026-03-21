import { useState, useEffect, useRef, useCallback } from 'react'
import Fuse from 'fuse.js'

const FUSE_OPTIONS = {
  threshold: 0.4,
  includeScore: true,
  minMatchCharLength: 2,
  keys: [
    { name: 'name', weight: 2.0 },
    { name: 'title', weight: 1.5 },
    { name: 'anime', weight: 1.5 },
    { name: 'ability', weight: 1.0 },
    { name: 'description', weight: 0.5 },
  ],
}

const MAX_RESULTS = 20

function groupByType(fuseResults) {
  const groups = {
    universe: [],
    character: [],
    power: [],
    faction: [],
    rule: [],
  }

  for (const result of fuseResults) {
    const item = result.item
    const type = item.type
    if (groups[type] !== undefined) {
      groups[type].push(item)
    }
  }

  return groups
}

export function useSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [grouped, setGrouped] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isReady, setIsReady] = useState(false)

  const fuseRef = useRef(null)
  const indexLoadedRef = useRef(false)

  // Lazily load the search index on first use
  const loadIndex = useCallback(async () => {
    if (indexLoadedRef.current) return
    indexLoadedRef.current = true

    setIsLoading(true)
    try {
      const response = await fetch('/search-index.json')
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const entries = await response.json()
      fuseRef.current = new Fuse(entries, FUSE_OPTIONS)
      setIsReady(true)
    } catch (err) {
      console.error('[useSearch] Failed to load search index:', err)
      indexLoadedRef.current = false
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Run search whenever query changes and index is ready
  useEffect(() => {
    if (!isReady || !fuseRef.current) {
      setResults([])
      setGrouped({})
      return
    }

    const trimmed = query.trim()
    if (!trimmed) {
      setResults([])
      setGrouped({})
      return
    }

    const fuseResults = fuseRef.current.search(trimmed, { limit: MAX_RESULTS })
    const flatResults = fuseResults.map((r) => r.item)
    setResults(flatResults)
    setGrouped(groupByType(fuseResults))
  }, [query, isReady])

  return {
    query,
    setQuery,
    results,
    grouped,
    isLoading,
    isReady,
    loadIndex,
  }
}
