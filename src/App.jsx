import { useState } from 'react';
import Dashboard from './Dashboard';
import { aot } from './data';

const UNIVERSES = {
  aot
};

function App() {
  const [activeUniverse, setActiveUniverse] = useState(null);

  if (activeUniverse) {
    return (
      <div className="relative">
        <button 
          onClick={() => setActiveUniverse(null)}
          className="fixed top-6 left-6 z-50 px-4 py-2 bg-black/50 hover:bg-black/80 border border-white/20 rounded font-mono text-[10px] text-gray-300 hover:text-white tracking-[0.2em] transition-all backdrop-blur-md uppercase"
        >
          ← ARCHIVE SELECTOR
        </button>
        <Dashboard DATA={UNIVERSES[activeUniverse]} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white font-mono p-6 md:p-12 selection:bg-cyan-500/30">
      <div className="max-w-6xl mx-auto">
        <header className="mb-16 border-b border-white/10 pb-8 mt-12 md:mt-0">
          <div className="inline-block px-3 py-1 border border-white/20 rounded-full text-[10px] tracking-[0.3em] font-bold text-gray-400 bg-white/5 backdrop-blur-md mb-6">
            SYSTEM ROOT ACCESS
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            Anime Architecture Archive
          </h1>
          <p className="text-gray-400 tracking-widest text-sm md:text-base uppercase">
            Fictional Universe Intelligence System v1.0
          </p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(UNIVERSES).map(([key, data]) => (
            <div 
              key={key} 
              onClick={() => setActiveUniverse(key)}
              className="group cursor-pointer bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:ring-1 hover:ring-cyan-500/50 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="aspect-video relative overflow-hidden">
                {data.animeImageUrl ? (
                  <img src={data.animeImageUrl} alt={data.anime} className="w-full h-full object-cover object-top opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                ) : (
                  <div className="w-full h-full bg-slate-900 border-b border-white/10 flex items-center justify-center text-xs tracking-widest text-gray-600">NO IMAGE ASSET</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050508] to-transparent pointer-events-none" />
                <div className="absolute top-4 right-4 px-2 py-1 bg-black/60 backdrop-blur border border-white/20 text-[10px] font-bold tracking-[0.2em] text-cyan-400 rounded">
                  {data.visualizationHint.toUpperCase()}
                </div>
              </div>
              <div className="p-6">
                <div className="text-[10px] text-gray-500 font-bold tracking-[0.2em] mb-2 uppercase flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  INDEX: {data.malId}
                </div>
                <h2 className="text-2xl font-bold uppercase mb-2 group-hover:text-cyan-400 transition-colors drop-shadow-[0_0_8px_rgba(6,182,212,0)] group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">{data.anime}</h2>
                <p className="text-[10px] text-gray-400 tracking-widest leading-relaxed line-clamp-2 uppercase">
                  {data.tagline}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
