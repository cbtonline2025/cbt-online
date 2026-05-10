
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, type = 'text', className, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {label}
        </label>
        <div className="relative">
          {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">{icon}</div>}
          <input
            id={id}
            type={type}
            ref={ref}
            className={`w-full bg-white/40 dark:bg-slate-800/50 border border-slate-300/80 dark:border-slate-700/80 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 shadow-sm backdrop-blur-sm py-3 ${icon ? 'pl-10' : 'px-4'} ${className}`}
            {...props}
          />
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
