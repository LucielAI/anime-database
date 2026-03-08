import { useState } from 'react';
import ImageWithFallback from './ImageWithFallback';
import DangerBar from './DangerBar';
import { resolveColor } from '../utils/resolveColor';

const HoverLink = ({ href, children, className, hoverGlow }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noreferrer"
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ boxShadow: isHovered ? `0 0 24px ${hoverGlow}` : 'none' }}
    >
      {children}
    </a>
  );
};

const Timeline = ({ characters, causalEvents, isSystemMode, theme }) => {
  return (
    <div className="w-full relative py-8 px-4 flex flex-col gap-12">
      {/* Central Timeline Line */}
      <div 
        className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px transition-colors duration-500 z-0" 
        style={{
          background: `linear-gradient(to bottom, transparent, ${isSystemMode ? theme.secondary : theme.primary}80, transparent)`,
          boxShadow: `0 0 15px ${isSystemMode ? theme.modeGlow : theme.glow}`
        }}
      />
      
      <div 
        className="text-center font-bold tracking-[0.2em] mb-8 z-10 transition-colors duration-500"
        style={{ color: isSystemMode ? theme.secondary : theme.primary }}
      >
        {isSystemMode ? 'CAUSAL EVENT MATRIX : TIMELINE' : 'HISTORICAL EVENT CHRONOLOGY'}
      </div>

      {causalEvents.map((event, idx) => (
        <div key={idx} className={`relative flex flex-col md:flex-row items-center gap-8 z-10 ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
          
          {/* Node Dot */}
          <div 
            className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full border-4 border-[#050508] transform -translate-x-1/2 transition-all duration-500" 
            style={{ 
              backgroundColor: isSystemMode ? theme.secondary : theme.primary,
              boxShadow: `0 0 10px ${isSystemMode ? theme.secondary : theme.primary}`
            }}
          />
          
          {/* Content Card */}
          <div 
            className={`ml-16 md:ml-0 w-full md:w-[45%] bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 transition-all duration-300 ${idx % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <div 
              className="text-xs font-bold mb-2 transition-colors duration-500"
              style={{ color: isSystemMode ? theme.secondary : theme.primary }}
            >
              {event.timelinePosition.toUpperCase()}
            </div>
            <h3 className="text-xl font-bold text-white mb-2 tracking-wider">{event.name.toUpperCase()}</h3>
            
            <div className="mb-4">
              <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">TRIGGER</span>
              <p className="text-sm text-gray-300 border-l-2 pl-3 py-1 transition-colors duration-500" style={{ borderColor: `${isSystemMode ? theme.secondary : theme.primary}80` }}>
                {event.trigger}
              </p>
            </div>
            
            <div className="mb-4">
              <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">CONSEQUENCE</span>
              <p className="text-sm text-gray-300 border-l-2 pl-3 py-1" style={{ borderColor: `${theme.accent}80` }}>
                {event.consequence}
              </p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/10">
              <span 
                className="text-xs uppercase tracking-wider block mb-2 transition-colors duration-500"
                style={{ color: isSystemMode ? theme.secondary : theme.primary }}
              >
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
      <div 
        className="mt-16 text-center font-bold tracking-[0.2em] mb-8 z-10 transition-colors duration-500"
        style={{ color: isSystemMode ? theme.secondary : theme.primary }}
      >
        {isSystemMode ? 'PRIMARY CAUSAL ENTITIES' : 'KEY NARRATIVE FIGURES'}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 z-10 ml-0">
        {characters.map((char, idx) => (
          <HoverLink 
            key={idx} 
            href={char.malId ? `https://myanimelist.net/character/${char.malId}` : '#'} 
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:-translate-y-1 transition-all duration-300 flex flex-col items-center p-0 cursor-pointer group/card hover:bg-white/10 active:bg-white/15 [@media(hover:none)]:transform-none"
            hoverGlow={isSystemMode ? theme.modeGlow : theme.glow}
          >
            <div className="w-full aspect-3/4 md:aspect-4/3 relative block group">
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
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-linear-to-t from-[#050508] to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
                <div className="w-full">
                  <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-cyan-400 transition-colors truncate">{char.name}</h3>
                  <div className="flex justify-between items-center w-full">
                    <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-widest truncate max-w-[60%]">{char.title}</p>
                    <div
                      className="px-1.5 py-0.5 md:px-2 md:py-1 text-[8px] md:text-[10px] font-bold border rounded bg-black/50 backdrop-blur-md shrink-0 ml-2"
                      style={{ borderColor: `${resolveColor(char.accentColor)}80`, color: resolveColor(char.accentColor) }}
                    >
                      {char.rank}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 md:p-5 w-full grow flex flex-col">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-xs text-white/40">THREAT LEVEL</span>
                  <span className="font-mono text-xs font-bold" style={{ color: theme.accent }}>{char.dangerLevel}/10</span>
                </div>
                <DangerBar level={char.dangerLevel} />
              </div>
              <p className="text-sm text-gray-300 leading-relaxed max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                {isSystemMode ? char.systemBio : char.loreBio}
              </p>
              <div className="mt-auto pt-4 border-t border-white/10">
                <span className="text-[10px] uppercase tracking-widest block mb-1" style={{ color: resolveColor(char.accentColor) }}>Signature Matchup / Ability</span>
                <p className="text-xs text-gray-400 line-clamp-2 md:line-clamp-none">{char.primaryAbility}</p>
              </div>
            </div>
          </HoverLink>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
