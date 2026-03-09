import { Shield, Lock } from 'lucide-react';

const Toggle = ({ isSystemMode, setIsSystemMode, theme }) => {
  return (
    <div className="flex w-full justify-center my-6 px-4">
      <div
        role="switch"
        aria-checked={isSystemMode}
        aria-label={`Switch to ${isSystemMode ? 'Lore' : 'System'} mode`}
        tabIndex={0}
        className="bg-black/40 p-1 rounded-full border border-white/10 flex items-center gap-1 cursor-pointer transition-all duration-500 relative w-full md:w-auto overflow-hidden backdrop-blur-xl hover:border-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
        onClick={() => setIsSystemMode(!isSystemMode)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsSystemMode(!isSystemMode) } }}
      >
        <div
          className={`absolute top-1 bottom-1 w-[calc(50%-2px)] rounded-full transition-all duration-500 ease-in-out pointer-events-none ${
            isSystemMode
              ? 'translate-x-[calc(100%+2px)]'
              : 'translate-x-0'
          }`}
          style={{
            backgroundColor: isSystemMode ? `${theme.secondary}18` : `${theme.primary}18`,
            borderColor: isSystemMode ? `${theme.secondary}60` : `${theme.primary}60`,
            borderWidth: '1px',
            boxShadow: isSystemMode
              ? `0 0 12px ${theme.secondary}30, inset 0 0 8px ${theme.secondary}10`
              : `0 0 12px ${theme.primary}30, inset 0 0 8px ${theme.primary}10`
          }}
        />

        <div
          className="px-4 py-2.5 w-1/2 md:w-auto z-10 flex items-center justify-center gap-2 transition-all duration-500 select-none pointer-events-none"
          style={{
            color: !isSystemMode ? theme.primary : '#4b5563',
            textShadow: !isSystemMode ? `0 0 10px ${theme.primary}60` : 'none'
          }}
        >
          <Lock className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[10px] font-bold tracking-[0.2em]">LORE</span>
          <span className="text-[10px] font-bold tracking-[0.15em] hidden sm:inline">MODE</span>
        </div>

        <div
          className="px-4 py-2.5 w-1/2 md:w-auto z-10 flex items-center justify-center gap-2 transition-all duration-500 select-none pointer-events-none"
          style={{
            color: isSystemMode ? theme.secondary : '#4b5563',
            textShadow: isSystemMode ? `0 0 10px ${theme.secondary}60` : 'none'
          }}
        >
          <Shield className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[10px] font-bold tracking-[0.2em]">SYS</span>
          <span className="text-[10px] font-bold tracking-[0.15em] hidden sm:inline">MODE</span>
        </div>
      </div>
    </div>
  );
};

export default Toggle;
