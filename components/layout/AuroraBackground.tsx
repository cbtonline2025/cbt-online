
import React from 'react';

const AuroraBackground: React.FC = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-700">
      {/* Dynamic Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-fuchsia-400/40 dark:bg-purple-600/20 rounded-full aurora-blur"></div>
      <div className="absolute top-[10%] right-[-20%] w-[60%] h-[60%] bg-sky-400/40 dark:bg-indigo-600/20 rounded-full aurora-blur" style={{ animationDelay: '-5s', animationDuration: '25s' }}></div>
      <div className="absolute bottom-[-15%] left-[5%] w-[55%] h-[55%] bg-indigo-500/40 dark:bg-blue-700/20 rounded-full aurora-blur" style={{ animationDelay: '-10s', animationDuration: '22s' }}></div>
      <div className="absolute bottom-[20%] right-[10%] w-[45%] h-[45%] bg-teal-400/40 dark:bg-emerald-600/20 rounded-full aurora-blur" style={{ animationDelay: '-15s', animationDuration: '18s' }}></div>
      
      {/* Additional Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-white/10 dark:bg-transparent pointer-events-none"></div>
    </div>
  );
};

export default AuroraBackground;
