import { Shield, Lock } from 'lucide-react';

const Toggle = ({ isSystemMode, setIsSystemMode, theme }) => {
  return (
    <div className="flex w-full justify-center my-8 pl-4 pr-4">
      <div 
        className="bg-white/5 p-1.5 rounded-full border border-white/10 flex items-center gap-2 cursor-pointer transition-colors duration-500 relative w-full md:w-auto overflow-hidden" 
        onClick={() => setIsSystemMode(!isSystemMode)}
      >
        <div 
          className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full transition-all duration-500 ease-in-out pointer-events-none ${
            isSystemMode 
              ? 'translate-x-[100%]' 
              : 'translate-x-0'
          }`}
          style={{
            backgroundColor: isSystemMode ? theme.modeGlow : theme.glow,
            borderColor: isSystemMode ? theme.secondary : theme.primary,
            borderWidth: '1px'
          }}
        />
        
        <div 
          className="px-5 py-2 w-1/2 md:w-auto z-10 flex items-center justify-center gap-2 transition-colors duration-500 select-none pointer-events-none"
          style={{ 
            color: !isSystemMode ? theme.primary : '#6b7280', 
            textShadow: !isSystemMode ? `0 0 8px ${theme.primary}80` : 'none' 
          }}
        >
          <Lock className="w-4 h-4 shrink-0" />
          <span className="text-xs font-bold tracking-wider truncate">LORE</span>
          <span className="text-xs font-bold tracking-wider hidden md:inline">— CLASSIFIED</span>
        </div>
        
        <div 
          className="px-5 py-2 w-1/2 md:w-auto z-10 flex items-center justify-center gap-2 transition-colors duration-500 select-none pointer-events-none"
          style={{ 
            color: isSystemMode ? theme.secondary : '#6b7280', 
            textShadow: isSystemMode ? `0 0 8px ${theme.secondary}80` : 'none' 
          }}
        >
          <Shield className="w-4 h-4 shrink-0" />
          <span className="text-xs font-bold tracking-wider truncate">SYS</span>
          <span className="text-xs font-bold tracking-wider hidden md:inline">— ROOT ACCESS</span>
        </div>
      </div>
    </div>
  );
};

export default Toggle;
