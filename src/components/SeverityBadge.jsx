const SEVERITY_STYLES = {
  low: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  high: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  fatal: 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse',
}

const SeverityBadge = ({ severity }) => (
  <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold uppercase ${SEVERITY_STYLES[severity] || SEVERITY_STYLES.medium}`}>
    {severity}
  </span>
)

export default SeverityBadge
