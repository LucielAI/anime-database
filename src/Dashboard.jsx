import { useState } from 'react';
import Toggle from './components/Toggle';
import SeverityBadge from './components/SeverityBadge';
import Timeline from './components/Timeline';
import * as Icons from 'lucide-react';

const Dashboard = ({ DATA }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isSystemMode, setIsSystemMode] = useState(false);
  
  const tabs = ['POWER ENGINE', 'ENTITY DATABASE', 'FACTIONS', 'CORE LAWS'];

  const getIcon = (iconName) => {
    const IconComponent = Icons[iconName];
    return IconComponent ? <IconComponent className="w-5 h-5" /> : <Icons.HelpCircle className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white font-mono selection:bg-cyan-500/30 overflow-x-hidden">
      
      {/* Header */}
      <header className="pt-12 pb-6 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center text-center gap-4">
          <div className="inline-block px-3 py-1 border border-white/20 rounded-full text-[10px] tracking-[0.3em] font-bold text-gray-400 bg-white/5 backdrop-blur-md">
            INTELLIGENCE SCHEMA <span className="text-cyan-400 mx-2">|</span> ID: {DATA.malId}
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            {DATA.anime}
          </h1>
          <p className="text-sm md:text-base text-gray-400 tracking-widest uppercase">
            {DATA.tagline}
          </p>
        </div>
      </header>

      {/* Dual Mode Toggle */}
      <div className="max-w-6xl mx-auto px-6 relative z-20">
        <Toggle isSystemMode={isSystemMode} setIsSystemMode={setIsSystemMode} />
      </div>

      {/* Navigation Tabs */}
      <nav className="max-w-6xl mx-auto px-6 mb-8 mt-4 border-b border-white/10 flex overflow-x-auto custom-scrollbar relative">
        {tabs.map((tab, idx) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(idx)}
            className={`px-6 py-4 text-sm font-bold tracking-widest whitespace-nowrap transition-colors duration-300 ${activeTab === idx ? (isSystemMode ? 'text-green-400' : 'text-purple-400') : 'text-gray-500 hover:text-gray-300'}`}
          >
            {tab}
          </button>
        ))}
        {/* Animated indicator */}
        <div 
          className={`absolute bottom-0 h-0.5 transition-all duration-300 ${isSystemMode ? 'bg-green-400 shadow-[0_0_10px_#4ade80]' : 'bg-purple-400 shadow-[0_0_10px_#a855f7]'}`} 
          style={{ width: `${100 / tabs.length}%`, transform: `translateX(${activeTab * 100}%)` }} 
        />
      </nav>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 pb-24">
        
        {/* TAB 0 : POWER ENGINE */}
        {activeTab === 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {DATA.powerSystem.map((power, idx) => (
                <div key={idx} className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:-translate-y-1 hover:ring-1 hover:ring-${power.color}/50 transition-all duration-300 group`}>
                  <div className={`p-6 border-l-4 border-${power.color} h-full flex flex-col`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 bg-${power.color}/10 rounded-lg text-${power.color}`}>
                        {getIcon(power.icon)}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold uppercase tracking-wider">{power.name}</h2>
                        <span className={`text-xs font-bold text-${power.color} tracking-widest uppercase`}>{power.subtitle}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-300 leading-relaxed mb-6 flex-grow">
                      {isSystemMode ? power.systemDesc : power.loreDesc}
                    </p>
                    
                    <div className="pt-4 border-t border-white/10 mt-auto">
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">SIGNATURE MOMENT</span>
                      <p className="text-xs text-gray-400 italic">"{power.signatureMoment}"</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Rankings/Tiers Section */}
            <div className="mt-16 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
              <h2 className="text-xl font-bold mb-8 text-center tracking-[0.2em] text-gray-400 uppercase">
                {DATA.rankings.systemName}
              </h2>
              
              <div className="flex flex-col gap-4">
                {/* Top Tier */}
                <div className={`p-6 bg-red-500/10 border border-red-500/30 rounded-lg`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                    <h3 className="text-2xl font-bold text-red-400 uppercase">{DATA.rankings.topTierName}</h3>
                    <div className="px-3 py-1 bg-red-500/20 text-red-300 text-[10px] font-bold tracking-widest rounded shadow-[0_0_10px_rgba(239,68,68,0.3)]">ABSOLUTE AUTHORITY</div>
                  </div>
                  <p className="text-sm text-red-200/80">
                    {isSystemMode ? DATA.rankings.topTierSystem : DATA.rankings.topTierLore}
                  </p>
                </div>
                
                {/* Other Tiers */}
                {DATA.rankings.tiers.map((tier, idx) => (
                  <div key={idx} className="p-4 border border-white/10 rounded-lg bg-black/20 flex flex-col md:flex-row gap-4 md:items-center">
                    <div className="md:w-1/4 font-bold text-gray-300 uppercase tracking-wider">{tier.name}</div>
                    <div className="md:w-3/4 text-sm text-gray-500">
                      {isSystemMode ? tier.systemDesc : tier.loreDesc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 1 : ENTITY DATABASE (Timeline Layout) */}
        {activeTab === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {DATA.visualizationHint === 'timeline' ? (
              <Timeline characters={DATA.characters} causalEvents={DATA.causalEvents} isSystemMode={isSystemMode} />
            ) : (
              <div className="text-center py-20 text-red-500">Fallback Database Layout Invoked (Timeline Expected)</div>
            )}
          </div>
        )}

        {/* TAB 2 : FACTIONS */}
        {activeTab === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 gap-6">
              {DATA.factions.map((faction, idx) => {
                const roleColors = {
                  antagonist: 'red-500',
                  protagonist: 'green-500',
                  neutral: 'gray-500',
                  chaotic: 'orange-500'
                };
                const color = roleColors[faction.role] || 'gray-500';
                
                return (
                  <div key={idx} className={`bg-white/5 backdrop-blur-sm border-l-4 border border-white/10 border-l-${color} rounded-xl overflow-hidden hover:-translate-y-1 hover:ring-1 hover:ring-${color}/50 transition-all duration-300`}>
                    <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start md:items-center">
                      <div className={`p-4 bg-${color}/10 rounded-full text-${color} hidden md:block shrink-0`}>
                        {getIcon(faction.icon)}
                      </div>
                      <div className="flex-grow">
                        <div className="flex flex-wrap items-center gap-4 mb-3">
                          <h2 className="text-3xl font-bold uppercase tracking-wider">{faction.name}</h2>
                          <div className={`px-2 py-1 bg-${color}/20 text-${color} text-[10px] font-bold tracking-widest rounded border border-${color}/30 uppercase`}>
                            {faction.role}
                          </div>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed mb-4">
                          {isSystemMode ? faction.systemDesc : faction.loreDesc}
                        </p>
                        <div className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase flex items-center gap-2">
                          <Icons.Users className="w-3 h-3" />
                          EST. COUNT: <span className="text-white">{faction.memberCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3 : CORE LAWS */}
        {activeTab === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 gap-6">
              {DATA.rules.map((rule, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 rounded-xl p-8 transition-colors duration-300">
                  <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6 pb-6 border-b border-white/10">
                    <div>
                      <h2 className="text-3xl font-bold uppercase tracking-tight text-white mb-2">{rule.name}</h2>
                      <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">{rule.subtitle}</span>
                    </div>
                    <SeverityBadge severity={rule.severity} />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <span className={`text-[10px] font-bold tracking-[0.2em] uppercase ${isSystemMode ? 'text-green-500' : 'text-purple-500'}`}>
                      {isSystemMode ? 'SYSTEM EXCEPTION' : 'LORE CONSEQUENCE'}
                    </span>
                    <p className="text-lg text-gray-300 leading-relaxed font-light">
                      {isSystemMode ? rule.systemEquivalent : rule.loreConsequence}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Anomalies Addon for Rules */}
            {DATA.anomalies && DATA.anomalies.length > 0 && (
              <div className="mt-16 pt-8 border-t border-dashed border-red-500/30">
                <div className="flex items-center gap-2 mb-8 justify-center">
                  <Icons.AlertTriangle className="text-red-500 w-5 h-5 animate-pulse" />
                  <span className="text-red-500 font-bold tracking-[0.2em] text-sm uppercase">Known System Anomalies</span>
                  <Icons.AlertTriangle className="text-red-500 w-5 h-5 animate-pulse" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {DATA.anomalies.map((anom, idx) => (
                    <div key={idx} className="p-6 border border-red-500/30 bg-red-500/5 rounded-lg">
                      <h3 className="text-xl font-bold text-white mb-1 uppercase">{anom.name}</h3>
                      <p className="text-xs text-red-400 mb-4 tracking-wider">VIOLATION: {anom.ruleViolated.toUpperCase()}</p>
                      <p className="text-sm text-gray-400">
                        {isSystemMode ? anom.systemDesc : anom.loreDesc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-white/5 relative z-10">
        <p className="text-[10px] text-gray-600 tracking-[0.2em] uppercase max-w-2xl mx-auto px-6">
          Unofficial fan-made interactive analysis. All characters, names, and lore belong to their respective creators and studios.
        </p>
        <a 
          href={`https://myanimelist.net/anime/${DATA.malId}`} 
          target="_blank" 
          rel="noreferrer"
          className="mt-4 text-[10px] text-cyan-500 hover:text-cyan-400 transition-colors tracking-widest uppercase inline-block font-bold hover:underline"
        >
          View Source Metadata (MAL)
        </a>
      </footer>

    </div>
  );
};

export default Dashboard;
