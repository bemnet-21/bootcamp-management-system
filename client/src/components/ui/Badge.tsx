import React, { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/src/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'active' | 'upcoming' | 'completed' | 'at-risk' | 'graduated' | 'suspended' | 'default';
  children?: React.ReactNode;
  className?: string;
}

const Badge = ({ className, variant = 'default', children, ...props }: any) => {
  const variants = {
    active: 'bg-[#ECFDF5] text-[#065F46]',
    upcoming: 'bg-[#EFF6FF] text-[#1E40AF]',
    completed: 'bg-[#EFF6FF] text-[#1E40AF]',
    'at-risk': 'bg-[#FEF2F2] text-[#991B1B]',
    graduated: 'bg-[#EFF6FF] text-[#1E40AF]',
    suspended: 'bg-[#FFFBEB] text-[#92400E]',
    default: 'bg-[#F1F5F9] text-[#64748B]',
  };

  const styleClass = variants[variant as keyof typeof variants] || variants.default;

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider',
        styleClass,
        className
      )}
    >
      {children}
    </div>
  );
};

export { Badge };
