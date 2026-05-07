import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';

export const useDashboardStats = () =>
  useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardService.getStats,
    refetchInterval: 60_000, // refresca cada 1 minuto
  });

export const useRecentSales = (limit = 5) =>
  useQuery({
    queryKey: ['dashboard', 'recent-sales', limit],
    queryFn: () => dashboardService.getRecentSales(limit),
    refetchInterval: 60_000,
  });

export const useStockAlerts = (limit = 5) =>
  useQuery({
    queryKey: ['dashboard', 'stock-alerts', limit],
    queryFn: () => dashboardService.getStockAlerts(limit),
    refetchInterval: 60_000,
  });