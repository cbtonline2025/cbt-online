
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
  const baseClasses = "px-6 py-3 font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-400 shadow-indigo-500/20',
    secondary: 'bg-white/40 hover:bg-white/60 text-slate-800 backdrop-blur-md border border-white/20 focus:ring-slate-400 dark:bg-slate-700/50 dark:hover:bg-slate-700 dark:text-white dark:focus:ring-slate-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-400 shadow-red-500/20',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
