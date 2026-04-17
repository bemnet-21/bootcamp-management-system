import React, { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/src/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  noPadding?: boolean;
}

const Card = ({ children, className, noPadding = false, ...props }: any) => {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-vanguard-gray-200 card-shadow overflow-hidden',
        className
      )}
      {...props}
    >
      <div className={cn(noPadding ? '' : 'p-6')}>
        {children}
      </div>
    </div>
  );
};

export { Card };
