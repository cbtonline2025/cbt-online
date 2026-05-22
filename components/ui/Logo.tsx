import React from 'react';
import { GraduationCap, Award, Sparkles } from 'lucide-react';

interface LogoProps {
  className?: string;
  showAuthor?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = '', showAuthor = true }) => {
  return (
    <div className={`flex items-center gap-3.5 select-none ${className}`}>
      {/* Premium Stylized Icon Container */}
      <div className="relative shrink-0">
        {/* Glow backdrop effect */}
        <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-600 via-sky-500 to-emerald-500 rounded-xl blur-[6px] opacity-25 group-hover:opacity-50 transition duration-500"></div>
        
        {/* Centered Icon Badge */}
        <div className="relative bg-gradient-to-br from-indigo-500 to-indigo-700 dark:from-indigo-600 dark:to-indigo-800 p-2.5 rounded-xl shadow-md border border-white/20 flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-white" strokeWidth={2.5} />
          
          {/* Subtle overlay crown badge */}
          <span className="absolute -top-1 -right-1 bg-emerald-400 dark:bg-emerald-500 rounded-full p-0.5 border-2 border-white dark:border-slate-950">
            <Sparkles className="w-1.5 h-1.5 text-white" />
          </span>
        </div>
      </div>

      {/* Title & Branding Stack */}
      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-2">
          {/* Main Title Word */}
          <span className="text-base font-black tracking-tight text-slate-800 dark:text-white">
            CBT <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-sky-500 dark:from-indigo-400 dark:to-sky-400">Kurikulum</span>
          </span>
          
          {/* Mini elegant indicator for Merdeka */}
          <span className="text-[9px] font-black tracking-[0.15em] bg-indigo-500/15 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded uppercase">
            Merdeka
          </span>
        </div>

        {/* Developer Credit subline - perfectly aligned, thin & ultra-professional */}
        {showAuthor && (
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-wide mt-0.5 whitespace-nowrap">
            Oleh: <span className="text-slate-500 dark:text-slate-450 font-black">Catur Pamungkas, S.Pd.</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default Logo;
