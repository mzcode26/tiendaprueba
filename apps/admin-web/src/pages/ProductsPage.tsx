import { useMemo, useState } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';

import { useProducts, useDeleteProduct } from '../features/products/hooks/useProducts';
import { ProductsTable } from '../features/products/components/ProductsTable';
import { ProductFilters } from '../features/products/components/ProductFilters';
import { CategoryModal } from '../features/products/components/CategoryModal';
import { BrandModal } from '../features/products/components/BrandModal';

import type {
  Product,
  ProductVariant,
  ProductFilters as ProductFiltersType,
  SelectOption,
} from '../features/products/types/product.types';

const ProductsPage = () => {
  const [filters, setFilters] = useState<ProductFiltersType>({
    page: 1,
    limit: 20,
  });

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const { data: productsResponse, isLoading } = useProducts(filters);
  const deleteProduct = useDeleteProduct();

  const categories: Array<{ id: string; name: string }> = [];
  const brands: Array<{ id: string; name: string }> = [];

  const categoryOptions: SelectOption[] = categories.map((category) => ({
    id: category.id,
    name: category.name,
  }));

  const brandOptions: SelectOption[] = brands.map((brand) => ({
    id: brand.id,
    name: brand.name,
  }));

  const productRows: Product[] = useMemo(() => {
    if (Array.isArray(productsResponse)) return productsResponse;

    if (
      productsResponse &&
      typeof productsResponse === 'object' &&
      'data' in productsResponse &&
      Array.isArray((productsResponse as { data?: unknown }).data)
    ) {
      return (productsResponse as { data: Product[] }).data;
    }

    if (
      productsResponse &&
      typeof productsResponse === 'object' &&
      'items' in productsResponse &&
      Array.isArray((productsResponse as { items?: unknown }).items)
    ) {
      return (productsResponse as { items: Product[] }).items;
    }

    return [];
  }, [productsResponse]);

  const handleEditProduct = (_product: Product) => {
    // TODO: abrir modal o formulario de edición
  };

  const handleDeleteProduct = (id: string) => {
    const product = productRows.find((item) => item.id === id);
    if (product) {
      setDeletingProduct(product);
    }
  };

  const handleAddVariant = (_product: Product) => {
    // TODO: abrir modal para agregar variante
  };

  const handleEditVariant = (_product: Product, _variant: ProductVariant) => {
    // TODO: abrir modal para editar variante
  };

  const handleViewDetail = (_product: Product) => {
    // TODO: abrir modal de detalle
  };

  const confirmDelete = async () => {
    if (!deletingProduct) return;

    try {
      await deleteProduct.mutateAsync(deletingProduct.id);
      setDeletingProduct(null);
    } catch (error) {
      // el error lo maneja la mutation
    }
  };

  const handleCreateProduct = () => {
    // TODO: abrir modal o formulario de creación
  };

  if (isLoading) {
    return <div className="p-4 text-sm text-gray-500">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gestiona tu catálogo de productos, categorías y marcas
          </p>
        </div>

        <div className="mt-4 flex space-x-3 sm:mt-0">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Categoría
          </button>

          <button
            onClick={() => setShowBrandModal(true)}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Marca
          </button>

          <button
            onClick={handleCreateProduct}
            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </button>
        </div>
      </div>

      <ProductFilters
        filters={filters}
        onChange={setFilters}
        categoryOptions={categoryOptions}
        brandOptions={brandOptions}
      />

      <ProductsTable
        products={productRows}
        onEditProduct={handleEditProduct}
        onDeleteProduct={handleDeleteProduct}
        onAddVariant={handleAddVariant}
        onEditVariant={handleEditVariant}
        onViewDetail={handleViewDetail}
      />

      {showCategoryModal && (
        <CategoryModal
          open={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          onSuccess={() => {
            setShowCategoryModal(false);
          }}
        />
      )}

      {showBrandModal && (
        <BrandModal
          open={showBrandModal}
          onClose={() => setShowBrandModal(false)}
          onSuccess={() => {
            setShowBrandModal(false);
          }}
        />
      )}

      {deletingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>

                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      Eliminar Producto
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        ¿Estás seguro de que quieres eliminar "{deletingProduct.name}"?
                        Esta acción no se puede deshacer.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deleteProduct.isPending}
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {deleteProduct.isPending ? 'Eliminando...' : 'Eliminar'}
                </button>

                <button
                  type="button"
                  onClick={() => setDeletingProduct(null)}
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;