import { useDashboardStats, useRecentSales, useStockAlerts } from '../features/dashboard/hooks/useDashboard';
import { StatsGrid } from '../features/dashboard/components/StatsGrid';
import { RecentSalesTable } from '../features/dashboard/components/RecentSalesTable';
import { StockAlertsPanel } from '../features/dashboard/components/StockAlertsPanel';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: statsData, isLoading: loadingStats } = useDashboardStats();
  const { data: salesData, isLoading: loadingSales } = useRecentSales(5);
  const { data: alertsData, isLoading: loadingAlerts } = useStockAlerts(5);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => navigate('/pos')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          <ShoppingBag className="w-4 h-4" />
          Ir al POS
        </button>
      </div>

      {/* Stats */}
      <StatsGrid stats={statsData?.data} isLoading={loadingStats} />

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentSalesTable sales={salesData?.data} isLoading={loadingSales} />
        </div>
        <div>
          <StockAlertsPanel alerts={alertsData?.data} isLoading={loadingAlerts} />
        </div>
      </div>
    </div>
  );
}