import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../hooks/useProducts';
import { ProductsTable } from '../components/ProductsTable';
import { ProductForm } from '../components/ProductForm';
import type { Product } from '../types/product.types';
import type { ProductFormData } from '../schemas/product.schema';
import { toast } from 'sonner';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useProducts({ search, page, limit: 20 });
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

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const products = data?.data?.data ?? [];
  const totalPages = data?.data?.totalPages ?? 1;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
          <Plus className="w-4 h-4" /> Nuevo producto
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-xl p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar por nombre o SKU..."
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
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
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 p-4 border-t">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">
              Anterior
            </button>
            <span className="text-sm text-gray-500">Página {page} de {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
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
    </div>
  );
}