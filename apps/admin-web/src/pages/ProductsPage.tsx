import { useState } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { useProducts, useDeleteProduct } from '../features/products/hooks/useProducts';
import { ProductsTable } from '../features/products/components/ProductsTable';
import { ProductFilters } from '../features/products/components/ProductFilters';
import { CategoryModal } from '../features/products/components/CategoryModal';
import { BrandModal } from '../features/products/components/BrandModal';
import type { Product, ProductFilters as ProductFiltersType } from '../features/products/types/product.types';

const ProductsPage = () => {
  const [filters, setFilters] = useState<ProductFiltersType>({
    page: 1,
    limit: 10,
  });

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const { data: products, isLoading } = useProducts(filters);
  const deleteProduct = useDeleteProduct();

  const handleEdit = (_product: Product) => {
    // TODO: Open edit modal/form
  };

  const handleDelete = (product: Product) => {
    setDeletingProduct(product);
  };

  const confirmDelete = async () => {
    if (deletingProduct) {
      try {
        await deleteProduct.mutateAsync(deletingProduct.id);
        setDeletingProduct(null);
      } catch (error) {
        // Error is handled by the mutation
      }
    }
  };

  const handleCreateProduct = () => {
    // TODO: Open create modal/form
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gestiona tu catálogo de productos, categorías y marcas
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Categoría
          </button>
          <button
            onClick={() => setShowBrandModal(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Marca
          </button>
          <button
            onClick={handleCreateProduct}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Producto
          </button>
        </div>
      </div>

      {/* Filters */}
      <ProductFilters filters={filters} onChange={setFilters} />

      {/* Products Table */}
      <ProductsTable
        products={products?.data?.data ?? []}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modals */}
        {showCategoryModal && (
          <CategoryModal onClose={() => setShowCategoryModal(false)} />
        )}

      {showBrandModal && (
          <BrandModal onClose={() => setShowBrandModal(false)} />
        )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
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
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deleteProduct.isPending}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteProduct.isPending ? 'Eliminando...' : 'Eliminar'}
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingProduct(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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