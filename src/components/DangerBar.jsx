import { useState, useEffect } from 'react'

const DangerBar = ({ level }) => {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setWidth(level * 10), 100)
    return () => clearTimeout(t)
  }, [level])

  const color = level >= 9 ? 'red-500' : level >= 7 ? 'orange-400' : level >= 5 ? 'yellow-400' : 'green-400'

  return (
    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-full bg-${color} transition-all duration-700 rounded-full`}
        style={{ width: `${width}%` }}
      />
    </div>
  )
}

export default DangerBar
