
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, type = 'text', className, icon, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        <label htmlFor={id} className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">
          {label}
        </label>
        <div className="relative group">
          {icon && <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 transition-colors group-focus-within:text-indigo-500">{icon}</div>}
          <input
            id={id}
            type={type}
            ref={ref}
            className={`w-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-2 border-slate-100/50 dark:border-white/5 rounded-2xl text-slate-800 dark:text-slate-100 font-bold placeholder-slate-400 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 shadow-sm py-4 ${icon ? 'pl-12' : 'px-6'} ${className}`}
            {...props}
          />
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
