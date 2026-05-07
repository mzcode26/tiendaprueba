import { useState } from 'react';
import { Plus, Tag, Bookmark } from 'lucide-react';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../hooks/useProducts';
import { ProductsTable } from '../components/ProductsTable';
import { ProductForm } from '../components/ProductForm';
import { ProductFilters } from '../components/ProductFilters';
import { CategoryModal } from '../components/CategoryModal';
import { BrandModal } from '../components/BrandModal';
import type { Product, ProductFilters as IProductFilters } from '../types/product.types';
import type { ProductFormData } from '../schemas/product.schema';
import { toast } from 'sonner';

export default function ProductsPage() {
  const [filters, setFilters] = useState<IProductFilters>({ page: 1, limit: 20 });
  const [showForm, setShowForm] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data, isLoading } = useProducts(filters);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const handleSubmit = (formData: ProductFormData) => {
    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, data: formData }, {
        onSuccess: () => { toast.success('Producto actualizado'); closeForm(); },
        onError: () => toast.error('Error al actualizar'),
      });
    } else {
      createProduct.mutate(formData, {
        onSuccess: () => { toast.success('Producto creado'); closeForm(); },
        onError: () => toast.error('Error al crear'),
      });
    }
  };

  const handleDelete = (product: Product) => {
    if (!confirm(`¿Eliminar "${product.name}"?`)) return;
    deleteProduct.mutate(product.id, {
      onSuccess: () => toast.success('Producto eliminado'),
      onError: () => toast.error('Error al eliminar'),
    });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const products = data?.data?.data ?? [];
  const totalPages = data?.data?.totalPages ?? 1;
  const page = filters.page ?? 1;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowCategoryModal(true)}
            className="flex items-center gap-1.5 border px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Tag className="w-4 h-4" /> Categorías
          </button>
          <button onClick={() => setShowBrandModal(true)}
            className="flex items-center gap-1.5 border px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Bookmark className="w-4 h-4" /> Marcas
          </button>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
            <Plus className="w-4 h-4" /> Nuevo producto
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-xl p-4">
        <ProductFilters filters={filters} onChange={setFilters} />
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <ProductsTable
            products={products}
            onEdit={p => { setEditingProduct(p); setShowForm(true); }}
            onDelete={handleDelete}
          />
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 p-4 border-t">
            <button onClick={() => setFilters(f => ({ ...f, page: Math.max(1, (f.page ?? 1) - 1) }))}
              disabled={page === 1}
              className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">
              Anterior
            </button>
            <span className="text-sm text-gray-500">Página {page} de {totalPages}</span>
            <button onClick={() => setFilters(f => ({ ...f, page: Math.min(totalPages, (f.page ?? 1) + 1) }))}
              disabled={page === totalPages}
              className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">
                {editingProduct ? 'Editar producto' : 'Nuevo producto'}
              </h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>
            <ProductForm
              product={editingProduct ?? undefined}
              onSubmit={handleSubmit}
              isLoading={createProduct.isPending || updateProduct.isPending}
            />
          </div>
        </div>
      )}

      {showCategoryModal && <CategoryModal onClose={() => setShowCategoryModal(false)} />}
      {showBrandModal && <BrandModal onClose={() => setShowBrandModal(false)} />}
    </div>
  );
}