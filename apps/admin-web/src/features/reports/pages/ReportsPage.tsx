import { useMemo, useState } from 'react';
import { useSalesSummary, useSalesByDay, useTopProducts, useTopCustomers } from '../hooks/useReports';
import { SummaryCards } from '../components/SummaryCards';
import { SalesChart } from '../components/SalesChart';
import { TopProductsTable } from '../components/TopProductsTable';
import { TopCustomersTable } from '../components/TopCustomersTable';
import type { ReportFilters, ReportPeriod } from '../types/reports.types';

const PERIODS: Array<{ label: string; value: ReportPeriod }> = [
  { label: 'Hoy', value: 'today' },
  { label: 'Semana', value: 'week' },
  { label: 'Mes', value: 'month' },
  { label: 'Trimestre', value: 'quarter' },
  { label: 'Año', value: 'year' },
];

const buildRange = (period: ReportPeriod) => {
  const now = new Date();

  const startOfDay = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).toISOString();

  const endOfDay = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).toISOString();

  const subtractDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
  };

  switch (period) {
    case 'today':
      return { dateFrom: startOfDay(now), dateTo: endOfDay(now) };
    case 'week':
      return { dateFrom: startOfDay(subtractDays(now, 6)), dateTo: endOfDay(now) };
    case 'month':
      return { dateFrom: startOfDay(subtractDays(now, 29)), dateTo: endOfDay(now) };
    case 'quarter':
      return { dateFrom: startOfDay(subtractDays(now, 89)), dateTo: endOfDay(now) };
    case 'year':
      return { dateFrom: startOfDay(subtractDays(now, 364)), dateTo: endOfDay(now) };
    default:
      return {};
  }
};

export default function ReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>('month');

  const chartFilters = useMemo<ReportFilters>(() => {
    const range = buildRange(period);
    return {
      period,
      ...range,
    };
  }, [period]);

  const summaryFilters = useMemo<ReportFilters>(() => ({ period }), [period]);

  const { data: summary, isLoading: loadingSummary } = useSalesSummary(summaryFilters);
  const { data: byDay, isLoading: loadingByDay } = useSalesByDay(chartFilters);
  const { data: topProducts, isLoading: loadingProducts } = useTopProducts(chartFilters);
  const { data: topCustomers, isLoading: loadingCustomers } = useTopCustomers(chartFilters);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
        <div>
          <h1 className="text-2xl font-bold">Reportes</h1>
          <p className="text-sm text-gray-500">El período seleccionado afecta el gráfico y los rankings.</p>
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 overflow-x-auto">
          {PERIODS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                period === value
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <SummaryCards summary={summary?.data} isLoading={loadingSummary} />

      <SalesChart data={byDay?.data} isLoading={loadingByDay} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProductsTable data={topProducts?.data} isLoading={loadingProducts} />
        <TopCustomersTable data={topCustomers?.data} isLoading={loadingCustomers} />
      </div>
    </div>
  );
}
