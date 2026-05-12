import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productsService } from '../services/product.service';
import type {
  CreateProductImageInput,
  CreateProductInput,
  CreateProductVariantInput,
  ProductFilters,
  UpdateProductInput,
  UpdateProductVariantInput,
} from '../types/product.types';

const productsKey = (filters: ProductFilters) => ['products', filters] as const;
const productKey = (id: string) => ['product', id] as const;

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: productsKey(filters),
    queryFn: () => productsService.findAll(filters),
  });
}

export function useProduct(id?: string) {
  return useQuery({
    queryKey: id ? productKey(id) : ['product', 'empty'],
    queryFn: () => productsService.findById(id as string),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateProductInput) => productsService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProductInput }) =>
      productsService.update(id, dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: productKey(variables.id) });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useAddVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      dto,
    }: {
      productId: string;
      dto: CreateProductVariantInput;
    }) => productsService.addVariant(productId, dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: productKey(variables.productId) });
    },
  });
}

export function useUpdateVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      variantId,
      dto,
    }: {
      productId: string;
      variantId: string;
      dto: UpdateProductVariantInput;
    }) => productsService.updateVariant(productId, variantId, dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: productKey(variables.productId) });
    },
  });
}

export function useDeleteVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, variantId }: { productId: string; variantId: string }) =>
      productsService.removeVariant(productId, variantId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: productKey(variables.productId) });
    },
  });
}

export function useAddImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      dto,
    }: {
      productId: string;
      dto: CreateProductImageInput;
    }) => productsService.addImage(productId, dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: productKey(variables.productId) });
    },
  });
}

export function useDeleteImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, imageId }: { productId: string; imageId: string }) =>
      productsService.removeImage(productId, imageId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: productKey(variables.productId) });
    },
  });
}