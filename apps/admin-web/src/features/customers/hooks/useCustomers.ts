import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customersService } from '../services/customers.service';
import type { CustomerFilters } from '../types/customer.types';

export const useCustomers = (filters?: CustomerFilters) =>
  useQuery({
    queryKey: ['customers', filters],
    queryFn: () => customersService.getCustomers(filters),
  });

export const useCustomer = (id: string, enabled = true) =>
  useQuery({
    queryKey: ['customers', id],
    queryFn: () => customersService.getCustomerById(id),
    enabled: enabled && !!id,
  });

export const useCustomerStats = (id: string, enabled = true) =>
  useQuery({
    queryKey: ['customers', id, 'stats'],
    queryFn: () => customersService.getCustomerStats(id),
    enabled: enabled && !!id,
  });

export const useCreateCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: customersService.createCustomer,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
};

export const useUpdateCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof customersService.updateCustomer>[1] }) =>
      customersService.updateCustomer(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
};

export const useDeleteCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: customersService.deleteCustomer,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
};