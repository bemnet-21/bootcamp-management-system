import { ReactNode } from 'react';
import { cn } from '@/src/lib/utils';

export interface Column<T> {
  header: string;
  key: keyof T | string;
  render?: (item: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  className?: string;
  onRowClick?: (item: T) => void;
}

const DataTable = <T extends { id: string | number }>({ columns, data, className, onRowClick }: DataTableProps<T>) => {
  return (
    <div className={cn("w-full overflow-x-auto rounded-xl border border-vanguard-gray-200 bg-white", className)}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-vanguard-gray-200 bg-[#FAFBFC]">
            {columns.map((column, idx) => (
              <th 
                key={idx}
                className={cn(
                  "px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-vanguard-muted",
                  column.align === 'center' ? "text-center" : column.align === 'right' ? "text-right" : "text-left"
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr 
              key={item.id}
              onClick={() => onRowClick?.(item)}
              className={cn(
                "group transition-colors border-b border-[#F1F5F9] last:border-none",
                onRowClick ? "cursor-pointer hover:bg-vanguard-gray-50/50" : "hover:bg-vanguard-gray-50/20"
              )}
            >
              {columns.map((column, idx) => (
                <td 
                  key={idx}
                  className={cn(
                    "px-6 py-3.5 text-sm align-middle",
                    column.align === 'center' ? "text-center" : column.align === 'right' ? "text-right" : "text-left"
                  )}
                >
                  {column.render ? column.render(item) : (item[column.key as keyof T] as ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export { DataTable };
