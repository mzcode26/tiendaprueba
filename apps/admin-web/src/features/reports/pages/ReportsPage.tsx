import { useState } from 'react';
import { useSalesSummary, useSalesByDay, useTopProducts, useTopCustomers } from '../hooks/useReports';
import { SummaryCards } from '../components/SummaryCards';
import { SalesChart } from '../components/SalesChart';
import { TopProductsTable } from '../components/TopProductsTable';
import { TopCustomersTable } from '../components/TopCustomersTable';
import type { ReportFilters } from '../types/reports.types';

const PERIODS = [
  { label: 'Hoy', value: 'today' },
  { label: 'Semana', value: 'week' },
  { label: 'Mes', value: 'month' },
  { label: 'Trimestre', value: 'quarter' },
  { label: 'Año', value: 'year' },
] as const;

export default function ReportsPage() {
  const [filters, setFilters] = useState<ReportFilters>({ period: 'month' });

  const { data: summary, isLoading: loadingSummary } = useSalesSummary(filters);
  const { data: byDay, isLoading: loadingByDay } = useSalesByDay(filters);
  const { data: topProducts, isLoading: loadingProducts } = useTopProducts(filters);
  const { data: topCustomers, isLoading: loadingCustomers } = useTopCustomers(filters);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reportes</h1>

        {/* Period Selector */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {PERIODS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFilters(f => ({ ...f, period: value }))}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                filters.period === value
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards summary={summary?.data} isLoading={loadingSummary} />

      {/* Sales Chart */}
      <SalesChart data={byDay?.data} isLoading={loadingByDay} />

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProductsTable data={topProducts?.data} isLoading={loadingProducts} />
        <TopCustomersTable data={topCustomers?.data} isLoading={loadingCustomers} />
      </div>
    </div>
  );
}