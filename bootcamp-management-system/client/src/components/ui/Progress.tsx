import React from 'react';
import { cn } from '@/src/lib/utils';

interface ProgressProps {
  value: number;
  className?: string;
}

const Progress = ({ value, className }: ProgressProps) => {
  return (
    <div className={cn("w-full bg-vanguard-gray-100 rounded-full overflow-hidden", className)}>
      <div 
        className="h-full bg-vanguard-blue transition-all duration-500 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
};

export { Progress };
