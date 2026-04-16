import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/src/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  rightIcon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, icon, rightIcon, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label htmlFor={id} className="text-[10px] font-bold uppercase tracking-wider text-vanguard-gray-800 opacity-60">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-vanguard-gray-800 opacity-40">
              {icon}
            </div>
          )}
          <input
            id={id}
            ref={ref}
            className={cn(
              'flex h-11 w-full rounded-lg border-none bg-vanguard-blue-light/50 px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-vanguard-gray-800/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vanguard-blue focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50',
              icon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-vanguard-gray-800 opacity-40 hover:opacity-100 transition-opacity">
              {rightIcon}
            </div>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
