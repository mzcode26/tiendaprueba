import { useState } from 'react';
import { Plus, Tag, Bookmark } from 'lucide-react';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../hooks/useProducts';
import { ProductsTable } from '../components/ProductsTable';
import { ProductFilters } from '../components/ProductFilters';
import { VariantForm } from '../components/VariantForm';
import { CategoryModal } from '../components/CategoryModal';
import { BrandModal } from '../components/BrandModal';
import type { Product, ProductFilters as IProductFilters } from '../types/product.types';
import type { ProductFormData, VariantFormData } from '../schemas/product.schema';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema } from '../schemas/product.schema';
import { toast } from 'sonner';
import { useCategories, useBrands } from '../hooks/useProducts';
import { Plus as PlusIcon } from 'lucide-react';

// ── Inline Product Form ───────────────────────────────────
function ProductForm({
  product,
  onSubmit,
  onCancel,
  isLoading,
}: {
  product?: Product;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}) {
  const { data: categoriesData } = useCategories();
  const { data: brandsData } = useBrands();
  const [showVariantForm, setShowVariantForm] = useState(false);

  const { register, handleSubmit, control, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          description: product.description,
          sku: product.sku,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          categoryId: product.categoryId,
          brandId: product.brandId,
          isActive: product.isActive,
          variants: product.variants.map(v => ({
            sku: v.sku,
            size: v.size,
            color: v.color,
            price: v.price,
            compareAtPrice: v.compareAtPrice,
            isActive: v.isActive,
          })),
        }
      : { isActive: true, variants: [] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'variants' });

  const categories = categoriesData?.data?.data ?? [];
  const brands = brandsData?.data?.data ?? [];

  const handleAddVariant = (data: VariantFormData) => {
    append(data);
    setShowVariantForm(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
          <input
            {...register('name')}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
          <input
            {...register('sku')}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
          <input
            {...register('price')}
            type="number"
            step="0.01"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Precio comparativo</label>
          <input
            {...register('compareAtPrice')}
            type="number"
            step="0.01"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <select
            {...register('categoryId')}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sin categoría</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
          <select
            {...register('brandId')}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sin marca</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            {...register('description')}
            rows={2}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div className="col-span-2 flex items-center gap-2">
          <input {...register('isActive')} type="checkbox" id="isActive" className="rounded border-gray-300" />
          <label htmlFor="isActive" className="text-sm text-gray-700 cursor-pointer">Producto activo</label>
        </div>
      </div>

      {/* Variants */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm font-medium text-gray-700">Variantes ({fields.length})</p>
          {!showVariantForm && (
            <button
              type="button"
              onClick={() => setShowVariantForm(true)}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
            >
              <PlusIcon className="w-3 h-3" /> Agregar variante
            </button>
          )}
        </div>

        {fields.length > 0 && (
          <div className="space-y-2 mb-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg text-sm">
                <span className="font-mono text-xs text-gray-600">{field.sku}</span>
                <div className="flex items-center gap-3 text-gray-500 text-xs">
                  {field.size && <span>T: {field.size}</span>}
                  {field.color && <span>C: {field.color}</span>}
                  <span>${field.price}</span>
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-400 hover:text-red-600 text-xs"
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
        )}

        {showVariantForm && (
          <VariantForm
            onSubmit={handleAddVariant}
            onCancel={() => setShowVariantForm(false)}
          />
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
          Cancelar
        </button>
        <button type="submit" disabled={isLoading}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {isLoading ? 'Guardando...' : product ? 'Actualizar' : 'Crear producto'}
        </button>
      </div>
    </form>
  );
}

// ── Page ──────────────────────────────────────────────────
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
            <button
              onClick={() => setFilters(f => ({ ...f, page: Math.max(1, (f.page ?? 1) - 1) }))}
              disabled={page === 1}
              className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-500">Página {page} de {totalPages}</span>
            <button
              onClick={() => setFilters(f => ({ ...f, page: Math.min(totalPages, (f.page ?? 1) + 1) }))}
              disabled={page === totalPages}
              className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
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
              onCancel={closeForm}
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