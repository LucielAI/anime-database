const TAILWIND_COLORS = {
  'slate-900': '#0f172a', 'slate-800': '#1e293b', 'slate-500': '#64748b',
  'red-900': '#7f1d1d', 'red-800': '#991b1b', 'red-500': '#ef4444', 'red-400': '#f87171',
  'orange-800': '#9a3412', 'orange-600': '#ea580c', 'orange-500': '#f97316', 'orange-400': '#fb923c',
  'amber-700': '#b45309', 'amber-400': '#fbbf24',
  'yellow-700': '#a16207', 'yellow-500': '#eab308',
  'emerald-800': '#065f46', 'emerald-600': '#059669', 'emerald-400': '#34d399',
  'green-900': '#14532d', 'green-800': '#166534', 'green-500': '#22c55e',
  'rose-900': '#881337', 'rose-400': '#fb7185',
  'indigo-500': '#6366f1', 'indigo-300': '#a5b4fc',
  'blue-900': '#1e3a8a', 'blue-400': '#60a5fa',
  'purple-900': '#581c87', 'purple-400': '#c084fc',
  'fuchsia-700': '#a21caf',
  'stone-900': '#1c1917',
  'gray-900': '#111827', 'gray-950': '#030712', 'gray-500': '#6b7280', 'gray-300': '#d1d5db',
  'cyan-400': '#22d3ee',
}

export function resolveColor(name, fallback = '#6b7280') {
  if (!name) return fallback
  // Already a hex/rgb value — pass through
  if (name.startsWith('#') || name.startsWith('rgb')) return name
  return TAILWIND_COLORS[name] || fallback
}
