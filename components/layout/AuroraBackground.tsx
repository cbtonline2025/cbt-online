
import React from 'react';

const AuroraBackground: React.FC = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden bg-[#F8FAFC] dark:bg-[#020617] transition-colors duration-700">
      {/* Soft Ethereal Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-200/40 dark:bg-indigo-500/20 rounded-full aurora-blur"></div>
      <div className="absolute top-[20%] right-[-15%] w-[50%] h-[50%] bg-sky-200/40 dark:bg-sky-500/20 rounded-full aurora-blur" style={{ animationDelay: '-5s', animationDuration: '30s' }}></div>
      <div className="absolute bottom-[-10%] left-[10%] w-[50%] h-[50%] bg-violet-200/40 dark:bg-violet-600/20 rounded-full aurora-blur" style={{ animationDelay: '-12s', animationDuration: '35s' }}></div>
      <div className="absolute bottom-[10%] right-[5%] w-[40%] h-[40%] bg-emerald-100/40 dark:bg-emerald-500/10 rounded-full aurora-blur" style={{ animationDelay: '-8s', animationDuration: '28s' }}></div>
      
      {/* Gentle Grain overlay for texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
    </div>
  );
};

export default AuroraBackground;
