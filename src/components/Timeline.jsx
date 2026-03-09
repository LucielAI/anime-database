import { useState, useEffect, useCallback, memo } from 'react';
import ImageWithFallback from './ImageWithFallback';
import DangerBar from './DangerBar';
import { resolveColor } from '../utils/resolveColor';
import { RELATIONSHIP_COLORS } from '../config/relationshipColors';
import { computeRadialPositions } from '../utils/radialLayout';
import { useAutoHighlight } from '../hooks/useAutoHighlight';

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

function BootstrapParadoxBanner({ events, theme, isSystemMode }) {
  const hasOrigin = events.some(e => e.name === "Ymir's Fall");
  const hasChapel = events.some(e => e.name === "The Reiss Chapel Massacre");
  if (!hasOrigin || !hasChapel) return null;

  const color = isSystemMode ? theme.secondary : theme.accent;
  return (
    <div className="relative z-10 mx-auto max-w-md my-4">
      <div
        className="border border-dashed rounded-lg p-4 text-center relative overflow-hidden"
        style={{ borderColor: `${color}60`, backgroundColor: `${color}08` }}
      >
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `repeating-linear-gradient(45deg, ${color} 0px, ${color} 1px, transparent 1px, transparent 8px)`
        }} />
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg width="16" height="16" viewBox="0 0 16 16" className="animate-spin" style={{ animationDuration: '8s' }}>
              <path d="M8 1 A7 7 0 1 1 7.99 1" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="4 3" />
              <polygon points="10,1 8,0 8,2" fill={color} />
            </svg>
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color }}>
              BOOTSTRAP PARADOX DETECTED
            </span>
            <svg width="16" height="16" viewBox="0 0 16 16" className="animate-spin" style={{ animationDuration: '8s', animationDirection: 'reverse' }}>
              <path d="M8 1 A7 7 0 1 1 7.99 1" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="4 3" />
              <polygon points="10,1 8,0 8,2" fill={color} />
            </svg>
          </div>
          <p className="text-[10px] text-gray-500 tracking-wider uppercase mb-2">
            Effect precedes cause — closed temporal loop
          </p>
          <div className="flex items-center justify-center gap-3 text-[10px]">
            <span className="px-2 py-1 rounded border" style={{ borderColor: `${color}40`, color }}>
              YMIR'S FALL
            </span>
            <svg width="24" height="12" viewBox="0 0 24 12">
              <path d="M2 6 C8 0, 16 0, 22 6" fill="none" stroke={color} strokeWidth="1" strokeDasharray="3 2" />
              <path d="M2 6 C8 12, 16 12, 22 6" fill="none" stroke={color} strokeWidth="1" strokeDasharray="3 2" />
              <polygon points="22,6 19,4 19,8" fill={color} />
              <polygon points="2,6 5,4 5,8" fill={color} />
            </svg>
            <span className="px-2 py-1 rounded border" style={{ borderColor: `${color}40`, color }}>
              REISS CHAPEL
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RelationshipWeb({ characters, relationships, theme, isSystemMode, isRevealing, revealStep }) {
  const { highlighted: hovered, setHighlighted: setHovered, markInteracted } = useAutoHighlight({
    items: characters || [],
    relationships: relationships || [],
    isRevealing,
    revealStep,
  });

  if (!relationships || relationships.length === 0) return null;
  const cx = 200, cy = 120, radius = 85;
  const width = 400, height = 260;

  const nodes = computeRadialPositions(characters, cx, cy, radius);

  const nodeMap = {};
  nodes.forEach(n => { nodeMap[n.name] = n; });

  return (
    <div className="z-10 mb-4">
      <div
        className="text-center text-[10px] font-bold tracking-[0.2em] mb-3 uppercase transition-colors duration-500"
        style={{ color: isSystemMode ? theme.secondary : theme.primary }}
      >
        CAUSAL ENTITY CONNECTIONS
      </div>
      <div className="flex justify-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-md h-auto">
          {relationships.map((rel, i) => {
            const s = nodeMap[rel.source];
            const t = nodeMap[rel.target];
            if (!s || !t) return null;
            const color = RELATIONSHIP_COLORS[rel.type] || '#555';
            const weight = Math.max(1, Math.min(4, (rel.weight || 1) * 0.4));
            const isHighlighted = hovered === rel.source || hovered === rel.target;
            const mx = (s.x + t.x) / 2;
            const my = (s.y + t.y) / 2;
            return (
              <g key={i}>
                <line
                  x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                  stroke={color}
                  strokeWidth={weight}
                  opacity={hovered ? (isHighlighted ? 0.8 : 0.1) : 0.4}
                  strokeDasharray={rel.type === 'enemy' ? '4 3' : 'none'}
                  className="transition-opacity duration-300"
                />
                {isHighlighted && (
                  <text x={mx} y={my - 4} textAnchor="middle" className="text-[7px] font-mono" fill={color}>
                    {rel.type}
                  </text>
                )}
              </g>
            );
          })}
          {nodes.map(node => (
            <g
              key={node.name}
              onMouseEnter={() => {
                markInteracted();
                setHovered(node.name);
              }}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
            >
              <circle
                cx={node.x} cy={node.y} r={14}
                fill={hovered === node.name ? resolveColor(node.accentColor, '#22d3ee') : '#1a1a2e'}
                stroke={resolveColor(node.accentColor, '#22d3ee')}
                strokeWidth={hovered === node.name ? 2.5 : 1.5}
                className="transition-all duration-200"
              />
              <text
                x={node.x} y={node.y + 3}
                textAnchor="middle"
                className="text-[8px] font-mono pointer-events-none"
                fill={hovered === node.name ? '#050508' : resolveColor(node.accentColor, '#22d3ee')}
              >
                {node.name.charAt(0)}
              </text>
              <text
                x={node.x} y={node.y + 26}
                textAnchor="middle"
                className="text-[7px] font-mono pointer-events-none"
                fill="#6b7280"
              >
                {node.name.split(' ')[0]}
              </text>
            </g>
          ))}
        </svg>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-3">
        {[...new Set(relationships.map(r => r.type))].map(type => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: RELATIONSHIP_COLORS[type] || '#555' }} />
            <span className="text-[9px] text-gray-500 uppercase tracking-wider">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const Timeline = memo(({ characters, causalEvents, relationships = [], isSystemMode, theme, isRevealing, revealStep }) => {
  const [isSweeping, setIsSweeping] = useState(false);

  const triggerSweep = useCallback((delay = 300, duration = 1900) => {
    const timer1 = setTimeout(() => setIsSweeping(true), delay);
    const timer2 = setTimeout(() => setIsSweeping(false), delay + duration);
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, []);

  useEffect(() => {
    if (!isRevealing) {
      return triggerSweep(300, 1900);
    }
  }, [isRevealing, triggerSweep]);

  useEffect(() => {
    if (isRevealing && revealStep === 4) {
      return triggerSweep(0, 2000);
    }
  }, [isRevealing, revealStep, triggerSweep]);

  return (
    <div className="w-full relative py-8 px-4 flex flex-col gap-12">
      {/* Central Timeline Line */}
      <div
        className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px transition-colors duration-500 z-0 overflow-hidden"
        style={{
          background: `linear-gradient(to bottom, transparent, ${isSystemMode ? theme.secondary : theme.primary}80, transparent)`,
          boxShadow: `0 0 15px ${isSystemMode ? theme.modeGlow : theme.glow}`
        }}
      >
        <div 
          className="w-full h-1/3 transition-transform duration-1000 ease-in-out"
          style={{ 
            background: `linear-gradient(to bottom, transparent, #fff, transparent)`,
            boxShadow: `0 0 25px 4px ${isSystemMode ? theme.secondary : theme.primary}`,
            transform: isSweeping ? 'translateY(300%)' : 'translateY(-100%)' 
          }}
        />
      </div>

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
            className={`ml-16 md:ml-0 w-full md:w-[45%] bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 transition-all duration-300 hover:bg-white/10 hover:-translate-y-1 hover:border-white/20 ${idx % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}
            style={{ 
              boxShadow: `0 4px 20px -5px ${isSystemMode ? theme.secondary : theme.primary}10`
            }}
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

      {/* Bootstrap Paradox Banner — only renders for AoT (if both events exist) */}
      <BootstrapParadoxBanner events={causalEvents} theme={theme} isSystemMode={isSystemMode} />

      {/* Relationship Web — SVG mini-graph showing entity connections */}
      <RelationshipWeb
        characters={characters}
        relationships={relationships}
        theme={theme}
        isSystemMode={isSystemMode}
        isRevealing={isRevealing}
        revealStep={revealStep}
      />

      {/* Characters Section */}
      <div
        className="mt-8 text-center font-bold tracking-[0.2em] mb-8 z-10 transition-colors duration-500"
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
});

export default Timeline;
