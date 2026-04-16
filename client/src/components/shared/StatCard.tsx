import { ReactNode } from 'react';
import { Card } from '../ui/Card';
import { cn } from '@/src/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: string;
    isUp: boolean;
  };
  icon: ReactNode;
  subtitle?: string;
  className?: string;
  progress?: {
    current: number;
    total: number;
    color?: string;
  };
}

const StatCard = ({ label, value, trend, icon, subtitle, className, progress }: StatCardProps) => {
  return (
    <Card className={cn("relative transition-all duration-200 border-[#E2E8F0] hover:shadow-sm", className)}>
      <div className="flex flex-col gap-1">
        <p className="text-[12px] font-semibold uppercase tracking-wider text-vanguard-muted">
          {label}
        </p>
        <div className="flex items-baseline justify-between mt-1">
          <h3 className="text-[28px] font-bold text-vanguard-gray-800 tracking-tight leading-none">
            {value}
          </h3>
          <div className="text-vanguard-muted/40">
            {icon}
          </div>
        </div>
        
        {trend && (
          <p className={cn(
            "text-[12px] font-medium mt-1 flex items-center gap-1",
            trend.isUp ? "text-success" : "text-danger"
          )}>
            <span>{trend.isUp ? '↑' : '↓'} {trend.value}</span>
            <span className="text-vanguard-muted opacity-60 font-normal">than last month</span>
          </p>
        )}
        
        {subtitle && !trend && (
          <p className="text-[12px] text-vanguard-muted opacity-80 mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {progress && (
        <div className="mt-4">
          <div className="h-1.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
            <div 
              className={cn("h-full rounded-full transition-all duration-1000", progress.color || "bg-vanguard-blue")}
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1.5">
            <span className="text-[11px] font-medium text-vanguard-muted">
              {progress.current} of {progress.total}
            </span>
            <span className="text-[11px] font-bold text-[#2563EB]">
              {Math.round((progress.current / progress.total) * 100)}%
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};

export { StatCard };
