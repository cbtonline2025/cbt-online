
import React from 'react';
import { GraduationCap } from 'lucide-react';

interface LogoProps {
  className?: string;
  showAuthor?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = '', showAuthor = true }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <GraduationCap className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
            CBT <span className="text-indigo-600 dark:text-indigo-400">Kurikulum</span>
          </span>
          <span className="text-lg font-bold tracking-widest text-slate-500 dark:text-slate-400 leading-tight">
            MERDEKA
          </span>
        </div>
      </div>
      {showAuthor && (
        <div className="mt-1 flex flex-col items-center">
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent mb-1" />
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 italic">
            dibuat oleh : Catur Pamungkas, S.Pd.
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
