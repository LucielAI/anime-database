import ImageWithFallback from './ImageWithFallback';
import DangerBar from './DangerBar';

const Timeline = ({ characters, causalEvents, isSystemMode }) => {
  return (
    <div className="w-full relative py-8 px-4 flex flex-col gap-12">
      {/* Central Timeline Line */}
      <div className={`absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent transition-colors duration-500 to-transparent z-0 ${isSystemMode ? 'via-green-500/50 shadow-[0_0_15px_rgba(74,222,128,0.5)]' : 'via-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.5)]'}`} />
      
      <div className={`text-center font-bold tracking-[0.2em] mb-8 z-10 transition-colors duration-500 ${isSystemMode ? 'text-green-400' : 'text-purple-400'}`}>
        {isSystemMode ? 'CAUSAL EVENT MATRIX : TIMELINE' : 'HISTORICAL EVENT CHRONOLOGY'}
      </div>

      {causalEvents.map((event, idx) => (
        <div key={idx} className={`relative flex flex-col md:flex-row items-center gap-8 z-10 ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
          
          {/* Node Dot */}
          <div className={`absolute left-8 md:left-1/2 w-4 h-4 rounded-full border-4 border-[#050508] transform -translate-x-1/2 transition-all duration-500 ${isSystemMode ? 'bg-green-400 shadow-[0_0_10px_#4ade80]' : 'bg-purple-400 shadow-[0_0_10px_#a855f7]'}`} />
          
          {/* Content Card */}
          <div className={`ml-16 md:ml-0 w-full md:w-[45%] bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:-translate-y-1 transition-all duration-300 ${isSystemMode ? 'hover:ring-1 hover:ring-green-400/50' : 'hover:ring-1 hover:ring-purple-400/50'} ${idx % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>
            <div className={`text-xs font-bold mb-2 transition-colors duration-500 ${isSystemMode ? 'text-green-500' : 'text-purple-500'}`}>{event.timelinePosition.toUpperCase()}</div>
            <h3 className="text-xl font-bold text-white mb-2 tracking-wider">{event.name.toUpperCase()}</h3>
            
            <div className="mb-4">
              <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">TRIGGER</span>
              <p className={`text-sm text-gray-300 border-l-2 pl-3 py-1 transition-colors duration-500 ${isSystemMode ? 'border-green-500/50' : 'border-purple-500/50'}`}>{event.trigger}</p>
            </div>
            
            <div className="mb-4">
              <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">CONSEQUENCE</span>
              <p className="text-sm text-gray-300 border-l-2 border-red-500/50 pl-3 py-1">{event.consequence}</p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/10">
              <span className={`text-xs uppercase tracking-wider block mb-2 transition-colors duration-500 ${isSystemMode ? 'text-green-500' : 'text-purple-500'}`}>
                {isSystemMode ? 'SYSTEM ARCHITECTURE LOG' : 'LORE ARCHIVE'}
              </span>
              <p className="text-sm text-gray-400">
                {isSystemMode ? (event.systemDesc || 'No system parameter recorded.') : (event.loreDesc || event.consequence)}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Characters Section (Anomalies / Entities in the Timeline) */}
      <div className={`mt-16 text-center font-bold tracking-[0.2em] mb-8 z-10 transition-colors duration-500 ${isSystemMode ? 'text-green-400' : 'text-purple-400'}`}>
        {isSystemMode ? 'PRIMARY CAUSAL ENTITIES' : 'KEY NARRATIVE FIGURES'}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 z-10 ml-8 md:ml-0">
        {characters.map((char, idx) => (
          <a 
            key={idx} 
            href={char.malId ? `https://myanimelist.net/character/${char.malId}` : '#'} 
            target="_blank" 
            rel="noreferrer"
            className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:-translate-y-1 transition-all duration-300 flex flex-col items-center p-0 cursor-pointer group/card ${isSystemMode ? 'hover:ring-1 hover:ring-green-400/50' : 'hover:ring-1 hover:ring-purple-400/50'}`}
          >
            <div className="w-full aspect-[4/3] relative block group">
              <ImageWithFallback 
                src={char.imageUrl} 
                alt={char.name} 
                fallbackIcon={null} 
                gradientFrom={char.gradientFrom} 
                gradientTo={char.gradientTo} 
                accentColor={char.accentColor} 
                fetchFailed={char._fetchFailed} 
              />
              <div className="absolute inset-0 bg-[#050508]/0 group-hover:bg-[#050508]/20 transition-colors duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs font-bold tracking-widest uppercase bg-black/80 px-4 py-2 rounded border border-white/20 text-white backdrop-blur-md">
                  VIEW ARCHIVE FILE
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#050508] to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{char.name}</h3>
                  <p className="text-xs text-gray-400 uppercase tracking-widest">{char.title}</p>
                </div>
                <div className={`px-2 py-1 text-[10px] font-bold border border-${char.accentColor}/50 text-${char.accentColor} rounded bg-black/50 backdrop-blur-md`}>
                  {char.rank}
                </div>
              </div>
            </div>
            <div className="p-5 w-full grow flex flex-col">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest">DANGER LEVEL</span>
                  <span className={`text-xs font-bold text-${char.accentColor}`}>{char.dangerLevel}/10</span>
                </div>
                <DangerBar level={char.dangerLevel} />
              </div>
              <p className="text-sm text-gray-300 leading-relaxed max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                {isSystemMode ? char.systemBio : char.loreBio}
              </p>
              <div className="mt-auto pt-4 border-t border-white/10">
                <span className={`text-[10px] text-${char.accentColor} uppercase tracking-widest block mb-1`}>Signature Matchup / Ability</span>
                <p className="text-xs text-gray-400">{char.primaryAbility}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
