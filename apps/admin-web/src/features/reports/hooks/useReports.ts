import { useQuery } from '@tanstack/react-query';
import { reportsService } from '../services/reports.service';
import type { ReportFilters } from '../types/reports.types';

export const useSalesSummary = (filters?: ReportFilters) =>
  useQuery({
    queryKey: ['reports', 'summary', filters],
    queryFn: () => reportsService.getSalesSummary(filters),
  });

export const useSalesByDay = (filters?: ReportFilters) =>
  useQuery({
    queryKey: ['reports', 'by-day', filters],
    queryFn: () => reportsService.getSalesByDay(filters),
  });

export const useTopProducts = (filters?: ReportFilters) =>
  useQuery({
    queryKey: ['reports', 'top-products', filters],
    queryFn: () => reportsService.getTopProducts(filters),
  });

export const useTopCustomers = (filters?: ReportFilters) =>
  useQuery({
    queryKey: ['reports', 'top-customers', filters],
    queryFn: () => reportsService.getTopCustomers(filters),
  });