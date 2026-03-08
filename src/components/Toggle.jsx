import { Shield, Lock } from 'lucide-react';

const Toggle = ({ isSystemMode, setIsSystemMode }) => {
  return (
    <div className="flex w-full justify-center my-8">
      <div 
        className="bg-white/5 p-1.5 rounded-full border border-white/10 flex items-center gap-2 cursor-pointer transition-colors duration-500 relative" 
        onClick={() => setIsSystemMode(!isSystemMode)}
      >
        <div 
          className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full transition-all duration-500 ease-in-out ${
            isSystemMode 
              ? 'bg-green-500/20 border border-green-500/50 translate-x-[100%]' 
              : 'bg-purple-500/20 border border-purple-500/50 translate-x-0'
          }`}
        />
        
        <div className={`px-5 py-2 z-10 flex items-center gap-2 transition-colors duration-500 ${!isSystemMode ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'text-gray-500 hover:text-gray-300'}`}>
          <Lock className="w-4 h-4" />
          <span className="text-xs font-bold tracking-wider">LORE MODE — CLASSIFIED</span>
        </div>
        
        <div className={`px-5 py-2 z-10 flex items-center gap-2 transition-colors duration-500 ${isSystemMode ? 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'text-gray-500 hover:text-gray-300'}`}>
          <Shield className="w-4 h-4" />
          <span className="text-xs font-bold tracking-wider">SYS MODE — ROOT ACCESS GRANTED</span>
        </div>
      </div>
    </div>
  );
};

export default Toggle;
