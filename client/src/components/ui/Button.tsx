import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/src/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-vanguard-blue text-white hover:bg-vanguard-blue-dark shadow-sm active:scale-[0.98]',
      secondary: 'bg-vanguard-blue-light text-vanguard-blue hover:bg-blue-100 active:scale-[0.98]',
      ghost: 'bg-transparent hover:bg-vanguard-gray-100 text-vanguard-gray-800 active:scale-[0.98]',
      outline: 'bg-white border border-vanguard-gray-200 hover:bg-vanguard-gray-50 text-vanguard-gray-800 active:scale-[0.98]',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-[12px] font-semibold',
      md: 'px-4 py-2 text-[13px] font-semibold',
      lg: 'px-6 py-2.5 text-[15px] font-bold',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-vanguard-blue focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
