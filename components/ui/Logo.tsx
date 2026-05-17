
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
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-sky-400 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-white p-2.5 rounded-xl border border-slate-100 shadow-md">
            <GraduationCap className="w-8 h-8 text-indigo-600" strokeWidth={2.5} />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-tight text-slate-800 leading-none">
            CBT <span className="text-indigo-600">Kurikulum</span>
          </span>
          <span className="text-lg font-black tracking-[0.2em] text-slate-400 leading-tight">
            MERDEKA
          </span>
        </div>
      </div>
      {showAuthor && (
        <div className="mt-1.5 flex flex-col items-center">
          <div className="h-[2px] w-40 bg-gradient-to-r from-transparent via-slate-100 to-transparent mb-1" />
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">
            Developed by : Catur Pamungkas, S.Pd.
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
