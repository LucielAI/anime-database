const SEVERITY_STYLES = {
  low: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  fatal: "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse"
};

const SeverityBadge = ({ severity }) => {
  const normalizedSeverity = severity?.toLowerCase() || 'low';
  const style = SEVERITY_STYLES[normalizedSeverity] || SEVERITY_STYLES.low;
  
  return (
    <span className={`px-2 py-1 text-xs font-bold border rounded ${style}`}>
      {normalizedSeverity.toUpperCase()}
    </span>
  );
};

export default SeverityBadge;
