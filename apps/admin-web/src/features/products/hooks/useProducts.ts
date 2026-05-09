import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services/product.service';
import type { ProductFilters } from '../types/product.types';

export const useProducts = (filters?: ProductFilters) =>
  useQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.getProducts(filters),
  });

export const useProduct = (id: string) =>
  useQuery({
    queryKey: ['products', id],
    queryFn: () => productService.getProduct(id),
    enabled: !!id,
  });

export const useCategories = () =>
  useQuery({
    queryKey: ['categories'],
    queryFn: productService.getCategories,
  });

export const useBrands = () =>
  useQuery({
    queryKey: ['brands'],
    queryFn: productService.getBrands,
  });

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productService.createProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
};

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof productService.updateProduct>[1] }) =>
      productService.updateProduct(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productService.deleteProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
};

export const useCreateVariant = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: Parameters<typeof productService.createVariant>[1] }) =>
      productService.createVariant(productId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
};

export const useDeleteVariant = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, variantId }: { productId: string; variantId: string }) =>
      productService.deleteVariant(productId, variantId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
};