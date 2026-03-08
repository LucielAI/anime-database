import ImageWithFallback from './ImageWithFallback';
import DangerBar from './DangerBar';

const Timeline = ({ characters, causalEvents, isSystemMode }) => {
  return (
    <div className="w-full relative py-8 px-4 flex flex-col gap-12">
      {/* Central Timeline Line */}
      <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent shadow-[0_0_15px_rgba(6,182,212,0.5)] z-0" />
      
      <div className="text-center font-bold tracking-[0.2em] text-cyan-400 mb-8 z-10">
        CAUSAL EVENT MATRIX : TIMELINE
      </div>

      {causalEvents.map((event, idx) => (
        <div key={idx} className={`relative flex flex-col md:flex-row items-center gap-8 z-10 ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
          
          {/* Node Dot */}
          <div className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full bg-cyan-400 border-4 border-[#050508] transform -translate-x-1/2 shadow-[0_0_10px_cyan]" />
          
          {/* Content Card */}
          <div className={`ml-16 md:ml-0 w-full md:w-[45%] bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:-translate-y-1 hover:ring-1 hover:ring-cyan-400/50 transition-all duration-300 ${idx % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>
            <div className={`text-xs font-bold mb-2 text-cyan-500 drop-shadow-[0_0_5px_cyan]`}>{event.timelinePosition.toUpperCase()}</div>
            <h3 className="text-xl font-bold text-white mb-2 tracking-wider">{event.name.toUpperCase()}</h3>
            
            <div className="mb-4">
              <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">TRIGGER</span>
              <p className="text-sm text-gray-300 border-l-2 border-cyan-500/50 pl-3 py-1">{event.trigger}</p>
            </div>
            
            <div className="mb-4">
              <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">CONSEQUENCE</span>
              <p className="text-sm text-gray-300 border-l-2 border-red-500/50 pl-3 py-1">{event.consequence}</p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/10">
              <span className="text-xs text-cyan-500 uppercase tracking-wider block mb-2">{isSystemMode ? 'SYSTEM ARCHITECTURE LOG' : 'LORE ARCHIVE'}</span>
              <p className="text-sm text-gray-400">
                {isSystemMode ? event.systemDesc : (event.loreDesc || event.consequence)}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Characters Section (Anomalies / Entities in the Timeline) */}
      <div className="mt-16 text-center font-bold tracking-[0.2em] text-purple-400 mb-8 z-10">
        PRIMARY CAUSAL ENTITIES
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 z-10 ml-8 md:ml-0">
        {characters.map((char, idx) => (
          <div key={idx} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:-translate-y-1 hover:ring-1 hover:ring-purple-400/50 transition-all duration-300 flex flex-col items-center p-0">
            <div className="w-full aspect-[4/3] relative">
              <ImageWithFallback 
                src={char.imageUrl} 
                alt={char.name} 
                fallbackIcon={null} 
                gradientFrom={char.gradientFrom} 
                gradientTo={char.gradientTo} 
                accentColor={char.accentColor} 
                fetchFailed={char._fetchFailed} 
              />
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#050508] to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div>
                  <h3 className="text-xl font-bold text-white">{char.name}</h3>
                  <p className="text-xs text-gray-400 uppercase tracking-widest">{char.title}</p>
                </div>
                <div className={`px-2 py-1 text-[10px] font-bold border border-${char.accentColor}/50 text-${char.accentColor} rounded bg-black/50 backdrop-blur-md`}>
                  {char.rank}
                </div>
              </div>
            </div>
            <div className="p-5 w-full">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest">DANGER LEVEL</span>
                  <span className={`text-xs font-bold text-${char.accentColor}`}>{char.dangerLevel}/10</span>
                </div>
                <DangerBar level={char.dangerLevel} />
              </div>
              <p className="text-sm text-gray-300 h-20 overflow-y-auto pr-2 custom-scrollbar">
                {isSystemMode ? char.systemBio : char.loreBio}
              </p>
              <div className="mt-4 pt-4 border-t border-white/10">
                <span className={`text-[10px] text-${char.accentColor} uppercase tracking-widest block mb-1`}>Signature Matchup / Ability</span>
                <p className="text-xs text-gray-400">{char.primaryAbility}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
