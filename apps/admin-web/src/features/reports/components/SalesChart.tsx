import type { SalesByDay } from '../types/reports.types';
import { formatCurrency } from '../../../lib/utils';

interface Props {
  data?: SalesByDay[];
  isLoading: boolean;
}

export function SalesChart({ data, isLoading }: Props) {
  if (isLoading) return <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />;
  if (!data?.length) return (
    <div className="h-64 flex items-center justify-center text-gray-400 border rounded-xl">
      Sin datos para el período
    </div>
  );

  const maxRevenue = Math.max(...data.map(d => d.revenue));

  return (
    <div className="bg-white border rounded-xl p-4">
      <h3 className="font-semibold text-gray-700 mb-4">Ventas por día</h3>
      <div className="flex items-end gap-1 h-48 overflow-x-auto pb-2">
        {data.map((day) => {
          const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
          return (
            <div key={day.date} className="flex flex-col items-center gap-1 min-w-[32px] group">
              <div className="relative w-full">
                <div
                  className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-all cursor-pointer"
                  style={{ height: `${Math.max(height, 2)}%`, minHeight: '4px' }}
                  title={`${day.date}: ${formatCurrency(day.revenue)}`}
                />
              </div>
              <span className="text-xs text-gray-400 rotate-45 origin-left whitespace-nowrap">
                {day.date.slice(5)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}