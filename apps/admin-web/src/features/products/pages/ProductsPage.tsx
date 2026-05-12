import { useEffect, useMemo, useState } from 'react';
import { useDeleteProduct, useProducts } from '../hooks/useProducts';
import { ProductDetail } from '../components/ProductDetail';
import { ProductForm } from '../components/ProductForm';
import { VariantForm } from '../components/VariantForm';
import { ProductFilters } from '../components/ProductFilters';
import { ProductsTable } from '../components/ProductsTable';
import { useAuthStore } from '../../../stores/auth.store';
import type {
  Product,
  ProductFilters as ProductFiltersType,
  ProductVariant,
  SelectOption,
} from '../types/product.types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

async function loadOptions(endpoint: string): Promise<SelectOption[]> {
  const token = useAuthStore.getState().token;

  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(json?.message || `Error cargando ${endpoint}`);
  }

  const payload = json?.data ?? json;
  const items = Array.isArray(payload)
    ? payload
    : payload?.items ?? payload?.data ?? [];

  return items.map((item: any) => ({
    id: item.id,
    name: item.name,
  }));
}

export default function ProductsPage() {
  const [filters, setFilters] = useState<ProductFiltersType>({
    search: '',
    categoryId: '',
    brandId: '',
    isActive: undefined,
    page: 1,
    limit: 20,
  });

  const [productFormOpen, setProductFormOpen] = useState(false);
  const [variantFormOpen, setVariantFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);
  const [brandOptions, setBrandOptions] = useState<SelectOption[]>([]);

  const productsQuery = useProducts(filters);
  const deleteProduct = useDeleteProduct();

  const products = productsQuery.data?.items ?? [];
  const total = productsQuery.data?.total ?? 0;
  const page = productsQuery.data?.page ?? 1;
  const limit = productsQuery.data?.limit ?? 20;
  const pages = productsQuery.data?.totalPages ?? Math.max(1, Math.ceil(total / limit));

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        const [cats, brands] = await Promise.all([
          loadOptions('/categories'),
          loadOptions('/brands'),
        ]);

        if (!mounted) return;

        setCategoryOptions(cats);
        setBrandOptions(brands);
      } catch {
        if (!mounted) return;
        setCategoryOptions([]);
        setBrandOptions([]);
      }
    };

    void run();

    return () => {
      mounted = false;
    };
  }, []);

  const openNewProduct = () => {
    setEditingProduct(null);
    setProductFormOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductFormOpen(true);
  };

  const openAddVariant = (product: Product) => {
    setSelectedProduct(product);
    setEditingVariant(null);
    setVariantFormOpen(true);
  };

  const openEditVariant = (product: Product, variant: ProductVariant) => {
    setSelectedProduct(product);
    setEditingVariant(variant);
    setVariantFormOpen(true);
  };

  const openDetail = (product: Product) => {
    setSelectedProduct(product);
    setDetailOpen(true);
  };

  const handleProductSaved = (product: Product) => {
    setSelectedProduct(product);
    setProductFormOpen(false);
    setEditingProduct(null);
    setDetailOpen(false);

    if (!editingProduct) {
      setVariantFormOpen(true);
    }
  };

  const handleVariantSaved = () => {
    setVariantFormOpen(false);
    setEditingVariant(null);
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm('¿Eliminar este producto?');
    if (!ok) return;

    try {
      await deleteProduct.mutateAsync(id);

      if (selectedProduct?.id === id) {
        setDetailOpen(false);
        setSelectedProduct(null);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo eliminar');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Productos</h1>
          <p className="text-sm text-gray-500">Gestión de productos y variantes</p>
        </div>

        <button
          onClick={openNewProduct}
          className="rounded-lg bg-black px-4 py-2 text-white"
        >
          Nuevo producto
        </button>
      </div>

      <ProductFilters
        filters={filters}
        onChange={setFilters}
        categoryOptions={categoryOptions}
        brandOptions={brandOptions}
      />

      <div className="overflow-hidden rounded-2xl border bg-white">
        {productsQuery.isLoading ? (
          <div className="p-6 text-sm text-gray-500">Cargando productos...</div>
        ) : productsQuery.isError ? (
          <div className="p-6 text-sm text-red-600">Error cargando productos</div>
        ) : (
          <ProductsTable
            products={products}
            onEditProduct={openEditProduct}
            onDeleteProduct={handleDelete}
            onAddVariant={openAddVariant}
            onEditVariant={openEditVariant}
            onViewDetail={openDetail}
          />
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          Página {page} de {pages}
        </span>

        <div className="flex gap-2">
          <button
            className="rounded-lg border px-3 py-1 disabled:opacity-50"
            disabled={page <= 1}
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                page: (prev.page ?? 1) - 1,
              }))
            }
          >
            Anterior
          </button>

          <button
            className="rounded-lg border px-3 py-1 disabled:opacity-50"
            disabled={page >= pages}
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                page: (prev.page ?? 1) + 1,
              }))
            }
          >
            Siguiente
          </button>
        </div>
      </div>

      <ProductForm
        open={productFormOpen}
        initialData={editingProduct}
        onClose={() => setProductFormOpen(false)}
        onSuccess={handleProductSaved}
      />

      {selectedProduct ? (
        <VariantForm
          open={variantFormOpen}
          product={selectedProduct}
          initialData={editingVariant}
          onClose={() => setVariantFormOpen(false)}
          onSuccess={handleVariantSaved}
        />
      ) : null}

      <ProductDetail
        open={detailOpen}
        product={selectedProduct}
        onClose={() => setDetailOpen(false)}
        onEditProduct={(product) => {
          setDetailOpen(false);
          openEditProduct(product);
        }}
        onAddVariant={(product) => {
          setDetailOpen(false);
          openAddVariant(product);
        }}
        onEditVariant={(product, variant) => {
          setDetailOpen(false);
          openEditVariant(product, variant);
        }}
      />
    </div>
  );
}