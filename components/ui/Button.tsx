
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
  const baseClasses = "px-8 py-3.5 font-bold text-xs uppercase tracking-[0.15em] rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-opacity-20 transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none select-none";
  
  const variantClasses = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white focus:ring-indigo-500 shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5',
    secondary: 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-100 focus:ring-slate-400 shadow-sm',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-400 shadow-rose-500/20',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
