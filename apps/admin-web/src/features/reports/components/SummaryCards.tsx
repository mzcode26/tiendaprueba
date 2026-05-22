import { AlertTriangle, ArrowUpRight, DollarSign, ShoppingCart } from 'lucide-react';
import type { DashboardSummary } from '../types/reports.types';
import { formatCurrency } from '../../../lib/utils';

interface Props {
  summary?: DashboardSummary;
  isLoading: boolean;
}

const colorMap: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  purple: 'bg-purple-50 text-purple-600',
  orange: 'bg-orange-50 text-orange-600',
};

const cards = (summary: DashboardSummary) => [
  {
    label: 'Ventas de hoy',
    value: summary.today.sales.toString(),
    icon: ShoppingCart,
    color: 'blue',
  },
  {
    label: 'Ingresos de hoy',
    value: formatCurrency(summary.today.revenue),
    icon: DollarSign,
    color: 'green',
  },
  {
    label: 'Ingresos del mes',
    value: formatCurrency(summary.currentMonth.revenue),
    helper: `Crecimiento ${summary.currentMonth.revenueGrowth >= 0 ? '+' : ''}${summary.currentMonth.revenueGrowth.toFixed(2)}% vs mes anterior`,
    icon: ArrowUpRight,
    color: 'purple',
  },
  {
    label: 'Alertas de stock',
    value: summary.lowStockAlerts.toString(),
    icon: AlertTriangle,
    color: 'orange',
  },
];

export function SummaryCards({ summary, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards(summary).map(({ label, value, helper, icon: Icon, color }) => (
        <div key={label} className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">{label}</span>
            <div className={`p-2 rounded-lg ${colorMap[color]}`}>
              <Icon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {helper ? <p className="mt-1 text-xs text-gray-400">{helper}</p> : null}
        </div>
      ))}
    </div>
  );
}
