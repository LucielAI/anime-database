const SEVERITY_STYLES = {
  low: 'border-green-500 text-green-400',
  medium: 'border-yellow-500 text-yellow-400',
  high: 'border-orange-500 text-orange-400',
  fatal: 'border-red-500 text-red-400 animate-pulse',
}

export default function SeverityBadge({ severity }) {
  const style = SEVERITY_STYLES[severity] || SEVERITY_STYLES.low

  return (
    <span
      className={`inline-block border rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${style}`}
    >
      {severity}
    </span>
  )
}
