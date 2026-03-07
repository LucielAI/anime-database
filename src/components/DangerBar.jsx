import { useState, useEffect } from 'react'

export default function DangerBar({ level }) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(level * 10)
    }, 100)
    return () => clearTimeout(timer)
  }, [level])

  const color =
    level >= 9
      ? 'bg-red-500'
      : level >= 7
        ? 'bg-orange-400'
        : level >= 5
          ? 'bg-yellow-400'
          : 'bg-green-400'

  return (
    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} rounded-full transition-all duration-700`}
        style={{ width: `${width}%` }}
      />
    </div>
  )
}
