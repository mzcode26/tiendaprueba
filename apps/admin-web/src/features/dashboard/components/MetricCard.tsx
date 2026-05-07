import { LucideIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const MetricCard = ({ title, value, icon: Icon, trend, className }: MetricCardProps) => {
  return (
    <div className={cn('bg-white p-6 rounded-lg shadow-sm border', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={cn('text-sm mt-1', trend.isPositive ? 'text-green-600' : 'text-red-600')}>
              {trend.isPositive ? '+' : ''}{trend.value}% vs mes anterior
            </p>
          )}
        </div>
        <div className="p-3 bg-blue-50 rounded-full">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
      </div>
    </div>
  );
};