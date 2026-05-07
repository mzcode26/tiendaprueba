import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services/product.service';
import type { ProductFilters } from '../types/product.types';
import type { ProductFormData, CategoryFormData, BrandFormData } from '../schemas/product.schema';

// ── Query Keys ────────────────────────────────────────────
export const productKeys = {
  all:        ['products'] as const,
  list:       (filters: ProductFilters) => ['products', 'list', filters] as const,
  detail:     (id: string) => ['products', 'detail', id] as const,
  categories: ['categories'] as const,
  brands:     ['brands'] as const,
};

// ── Products ──────────────────────────────────────────────
export const useProducts = (filters: ProductFilters = {}) =>
  useQuery({
    queryKey: productKeys.list(filters),
    queryFn:  () => productService.getProducts(filters),
  });

export const useProduct = (id: string) =>
  useQuery({
    queryKey: productKeys.detail(id),
    queryFn:  () => productService.getProductById(id),
    enabled:  !!id,
  });

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductFormData) => productService.createProduct(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
};

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductFormData> }) =>
      productService.updateProduct(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
};

// ── Categories ────────────────────────────────────────────
export const useCategories = () =>
  useQuery({
    queryKey: productKeys.categories,
    queryFn:  productService.getCategories,
  });

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CategoryFormData) => productService.createCategory(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.categories }),
  });
};

export const useUpdateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CategoryFormData> }) =>
      productService.updateCategory(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.categories }),
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productService.deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.categories }),
  });
};

// ── Brands ────────────────────────────────────────────────
export const useBrands = () =>
  useQuery({
    queryKey: productKeys.brands,
    queryFn:  productService.getBrands,
  });

export const useCreateBrand = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BrandFormData) => productService.createBrand(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.brands }),
  });
};

export const useUpdateBrand = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BrandFormData> }) =>
      productService.updateBrand(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.brands }),
  });
};

export const useDeleteBrand = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productService.deleteBrand(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.brands }),
  });
};