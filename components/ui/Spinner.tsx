
import React from 'react';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'medium' }) => {
    const sizeClasses = {
        small: 'h-5 w-5 border-2',
        medium: 'h-8 w-8 border-b-2 border-t-2',
        large: 'h-12 w-12 border-b-4 border-t-4',
    };
  return (
    <div className={`animate-spin rounded-full border-slate-800 dark:border-white ${sizeClasses[size]}`}></div>
  );
};

export default Spinner;
