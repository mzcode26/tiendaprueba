import { useEffect, useState } from 'react';
import { useCreateProduct, useUpdateProduct } from '../hooks/useProducts';
import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
} from '../types/product.types';

interface ProductFormProps {
  open: boolean;
  initialData?: Product | null;
  onClose: () => void;
  onSuccess: (product: Product) => void;
}

export function ProductForm({
  open,
  initialData,
  onClose,
  onSuccess,
}: ProductFormProps) {
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name ?? '');
      setDescription(initialData.description ?? '');
      setCategoryId(initialData.categoryId ?? '');
      setBrandId(initialData.brandId ?? '');
      setTagsText((initialData.tags ?? []).join(', '));
      setIsActive(initialData.isActive ?? true);
    } else {
      setName('');
      setDescription('');
      setCategoryId('');
      setBrandId('');
      setTagsText('');
      setIsActive(true);
    }

    setError('');
  }, [initialData, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const tags = tagsText
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    try {
      if (initialData?.id) {
        const dto: UpdateProductInput = {
          name: name.trim(),
          description: description.trim() || undefined,
          categoryId: categoryId.trim() || undefined,
          brandId: brandId.trim() || undefined,
          tags,
          isActive,
        };

        const updated = await updateProduct.mutateAsync({
          id: initialData.id,
          dto,
        });

        onSuccess(updated);
      } else {
        const dto: CreateProductInput = {
          name: name.trim(),
          description: description.trim() || undefined,
          categoryId: categoryId.trim() || undefined,
          brandId: brandId.trim() || undefined,
          tags,
          isActive,
        };

        const created = await createProduct.mutateAsync(dto);
        onSuccess(created);
      }

      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al guardar el producto',
      );
    }
  };

  const loading = createProduct.isPending || updateProduct.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {initialData?.id ? 'Editar producto' : 'Nuevo producto'}
          </h2>

          <button onClick={onClose} className="text-sm text-gray-500">
            Cerrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Nombre</label>
            <input
              className="rounded-lg border px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Remera básica"
              required
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Descripción</label>
            <textarea
              className="rounded-lg border px-3 py-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del producto"
              rows={4}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Category ID</label>
              <input
                className="rounded-lg border px-3 py-2"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                placeholder="ID de categoría"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Brand ID</label>
              <input
                className="rounded-lg border px-3 py-2"
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                placeholder="ID de marca"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Tags</label>
            <input
              className="rounded-lg border px-3 py-2"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="remera, algodón, verano"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Activo
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-60"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}