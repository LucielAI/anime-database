export default function Toggle({ isSystemMode, onToggle }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        onClick={onToggle}
        className="flex items-center bg-gray-900 border border-gray-700 rounded-full cursor-pointer select-none"
      >
        <span
          className={`px-3 py-1 text-[10px] font-bold tracking-wider rounded-full transition-all duration-300 ${
            !isSystemMode
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
              : 'text-gray-600'
          }`}
        >
          LORE
        </span>
        <span
          className={`px-3 py-1 text-[10px] font-bold tracking-wider rounded-full transition-all duration-300 ${
            isSystemMode
              ? 'bg-green-600 text-white shadow-lg shadow-green-500/30'
              : 'text-gray-600'
          }`}
        >
          SYS
        </span>
      </div>
      <span className="text-[9px] tracking-wider text-gray-600">
        {isSystemMode ? 'SYS MODE — ROOT ACCESS GRANTED' : 'LORE MODE — CLASSIFIED'}
      </span>
    </div>
  )
}
