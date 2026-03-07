const Toggle = ({ isSystemMode, onToggle }) => (
  <div className="flex items-center gap-3 font-mono">
    <span className={`text-xs uppercase tracking-widest transition-colors ${!isSystemMode ? 'text-cyan-400' : 'text-white/30'}`}>
      LORE MODE — CLASSIFIED
    </span>
    <button
      onClick={onToggle}
      className={`relative w-14 h-7 rounded-full transition-all duration-500 border ${
        isSystemMode
          ? 'bg-emerald-500/20 border-emerald-500/50'
          : 'bg-cyan-500/20 border-cyan-500/50'
      }`}
    >
      <span
        className={`absolute top-1 w-5 h-5 rounded-full transition-all duration-500 ${
          isSystemMode
            ? 'left-8 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
            : 'left-1 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]'
        }`}
      />
    </button>
    <span className={`text-xs uppercase tracking-widest transition-colors ${isSystemMode ? 'text-emerald-400' : 'text-white/30'}`}>
      SYS MODE — ROOT ACCESS GRANTED
    </span>
  </div>
)

export default Toggle
