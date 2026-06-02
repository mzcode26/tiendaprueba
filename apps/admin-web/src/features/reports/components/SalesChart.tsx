import type { SalesOverTime } from '../types/reports.types';
import { formatCurrency } from '../../../lib/utils';

interface Props {
  data?: SalesOverTime[];
  isLoading: boolean;
}

const formatPeriod = (period: string) => {
  const date = new Date(period);
  if (Number.isNaN(date.getTime())) return period;
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
  });
};

export function SalesChart({ data, isLoading }: Props) {
  if (isLoading) return <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />;

  if (!data?.length) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 border rounded-xl">
        Sin datos para el período
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.totalRevenue));

  return (
    <div className="bg-white border rounded-xl p-4">
      <h3 className="font-semibold text-gray-700 mb-4">Ventas por período</h3>
      <div className="flex items-end gap-2 h-48 overflow-x-auto pb-2">
        {data.map((item) => {
          const height = maxRevenue > 0 ? (item.totalRevenue / maxRevenue) * 100 : 0;

          return (
            <div key={item.period} className="flex flex-col items-center gap-1 min-w-[44px] group">
              <div className="relative w-full flex items-end h-40">
                <div
                  className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-all cursor-pointer"
                  style={{ height: `${Math.max(height, 2)}%`, minHeight: '4px' }}
                  title={`${formatPeriod(item.period)}: ${formatCurrency(item.totalRevenue)}`}
                />
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {formatPeriod(item.period)}
              </span>
              <span className="text-[10px] text-gray-300">{item.totalSales} ventas</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
