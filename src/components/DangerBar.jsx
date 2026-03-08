import { useState, useEffect } from 'react';

const DangerBar = ({ level }) => {
  const [width, setWidth] = useState(0);
  
  useEffect(() => { 
    setTimeout(() => setWidth(level * 10), 100); 
  }, [level]);
  
  const color = level >= 9 ? "#ef4444" : level >= 7 ? "#fb923c" : level >= 5 ? "#facc15" : "#4ade80";

  return (
    <div className="w-full bg-white/10 rounded-full h-1.5 md:h-2 overflow-hidden">
      <div
        className="h-full transition-all duration-700 rounded-full"
        style={{ width: `${width}%`, backgroundColor: color }}
      />
    </div>
  );
};

export default DangerBar;
