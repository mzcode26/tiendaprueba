import { ShoppingCart, DollarSign, Users, AlertTriangle } from 'lucide-react';
import type { DashboardStats } from '../types/dashboard.types';
import { formatCurrency } from '../../../lib/utils';

interface Props {
  stats?: DashboardStats;
  isLoading: boolean;
}

const getCards = (s: DashboardStats) => [
  {
    label: 'Ventas hoy',
    value: s.todaySales.toString(),
    sub: formatCurrency(s.todayRevenue),
    icon: ShoppingCart,
    color: 'blue',
  },
  {
    label: 'Ingresos del mes',
    value: formatCurrency(s.monthRevenue),
    sub: `Semana: ${formatCurrency(s.weekRevenue)}`,
    icon: DollarSign,
    color: 'green',
  },
  {
    label: 'Clientes',
    value: s.totalCustomers.toString(),
    sub: `+${s.newCustomersThisMonth} este mes`,
    icon: Users,
    color: 'purple',
  },
  {
    label: 'Alertas de stock',
    value: s.lowStockCount.toString(),
    sub: `${s.outOfStockCount} sin stock`,
    icon: AlertTriangle,
    color: s.lowStockCount > 0 ? 'red' : 'gray',
  },
];

const colorMap: Record<string, { bg: string; icon: string }> = {
  blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600' },
  green:  { bg: 'bg-green-50',  icon: 'text-green-600' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600' },
  red:    { bg: 'bg-red-50',    icon: 'text-red-600' },
  gray:   { bg: 'bg-gray-50',   icon: 'text-gray-400' },
};

export function StatsGrid({ stats, isLoading }: Props) {
  if (isLoading) return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
      ))}
    </div>
  );

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {getCards(stats).map(({ label, value, sub, icon: Icon, color }) => {
        const { bg, icon } = colorMap[color];
        return (
          <div key={label} className="bg-white rounded-xl border shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{label}</span>
              <div className={`p-2 rounded-lg ${bg}`}>
                <Icon className={`w-4 h-4 ${icon}`} />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}