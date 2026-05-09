import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesService } from '../services/sales.service';
import type { SaleFilters } from '../types/sales.types';

export const useSales = (filters?: SaleFilters) =>
  useQuery({
    queryKey: ['sales', filters],
    queryFn: () => salesService.getSales(filters),
  });

export const useSale = (id: string) =>
  useQuery({
    queryKey: ['sales', id],
    queryFn: () => salesService.getSaleById(id),
    enabled: !!id,
  });

export const usePOSSearch = (query: string, storeId: string) =>
  useQuery({
    queryKey: ['pos', 'search', query, storeId],
    queryFn: () => salesService.searchPOSProducts(query, storeId),
    enabled: query.length > 1 && !!storeId,
  });

export const useCreateSale = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: salesService.createSale,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sales'] }),
  });
};

export const useCancelSale = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      salesService.cancelSale(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sales'] }),
  });
};

export const useAddPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ saleId, data }: { saleId: string; data: unknown }) =>
      salesService.addPayment(saleId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sales'] }),
  });
};