import { TrendingUp, ShoppingCart, DollarSign, BarChart2 } from 'lucide-react';
import type { SalesSummary } from '../types/reports.types';
import { formatCurrency } from '../../../lib/utils';

interface Props {
  summary?: SalesSummary;
  isLoading: boolean;
}

const cards = (s: SalesSummary) => [
  { label: 'Total Ventas', value: s.totalSales.toString(), icon: ShoppingCart, color: 'blue' },
  { label: 'Ingresos', value: formatCurrency(s.totalRevenue), icon: DollarSign, color: 'green' },
  { label: 'Ganancia Bruta', value: formatCurrency(s.grossProfit), icon: TrendingUp, color: 'purple' },
  { label: 'Ticket Promedio', value: formatCurrency(s.averageTicket), icon: BarChart2, color: 'orange' },
];

const colorMap: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  purple: 'bg-purple-50 text-purple-600',
  orange: 'bg-orange-50 text-orange-600',
};

export function SummaryCards({ summary, isLoading }: Props) {
  if (isLoading) return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
      ))}
    </div>
  );

  if (!summary) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards(summary).map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">{label}</span>
            <div className={`p-2 rounded-lg ${colorMap[color]}`}>
              <Icon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
      ))}
    </div>
  );
}