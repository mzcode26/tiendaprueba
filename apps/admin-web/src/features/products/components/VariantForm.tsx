import { useEffect, useState } from 'react';
import { useAddVariant, useUpdateVariant } from '../hooks/useProducts';
import type {
  Product,
  ProductVariant,
  CreateProductVariantInput,
  UpdateProductVariantInput,
} from '../types/product.types';

interface VariantFormProps {
  open: boolean;
  product: Product;
  initialData?: ProductVariant | null;
  onClose: () => void;
  onSuccess: (product: Product) => void;
}

type VariantAttributeRow = {
  attributeId: string;
  attributeValueId: string;
};

export function VariantForm({
  open,
  product,
  initialData,
  onClose,
  onSuccess,
}: VariantFormProps) {
  const addVariant = useAddVariant();
  const updateVariant = useUpdateVariant();

  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [attributes, setAttributes] = useState<VariantAttributeRow[]>([]);
  const [error, setError] = useState('');

  const isEditing = !!initialData?.id;

  useEffect(() => {
    if (initialData) {
      setSku(initialData.sku ?? '');
      setBarcode(initialData.barcode ?? '');
      setPrice(
        initialData.price !== null && initialData.price !== undefined
          ? String(initialData.price)
          : '',
      );
      setCompareAtPrice(
        initialData.compareAtPrice !== null &&
        initialData.compareAtPrice !== undefined
          ? String(initialData.compareAtPrice)
          : '',
      );
      setCostPrice(
        initialData.costPrice !== null && initialData.costPrice !== undefined
          ? String(initialData.costPrice)
          : '',
      );
      setIsActive(initialData.isActive ?? true);

      const rawAttributes = initialData.attributes ?? [];
      const normalized = Array.isArray(rawAttributes)
        ? rawAttributes.map((item: any) => ({
            attributeId: item.attributeId ?? '',
            attributeValueId: item.attributeValueId ?? '',
          }))
        : [];

      setAttributes(normalized);
    } else {
      setSku('');
      setBarcode('');
      setPrice('');
      setCompareAtPrice('');
      setCostPrice('');
      setIsActive(true);
      setAttributes([]);
    }

    setError('');
  }, [initialData, open]);

  if (!open) return null;

  const addAttributeRow = () => {
    setAttributes((prev) => [
      ...prev,
      { attributeId: '', attributeValueId: '' },
    ]);
  };

  const updateAttributeRow = (
    index: number,
    next: VariantAttributeRow,
  ) => {
    setAttributes((prev) =>
      prev.map((item, i) => (i === index ? next : item)),
    );
  };

  const removeAttributeRow = (index: number) => {
    setAttributes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanSku = sku.trim();
    const cleanPrice = Number(price);

    if (!cleanSku) {
      setError('El SKU es obligatorio');
      return;
    }

    if (Number.isNaN(cleanPrice)) {
      setError('El precio es obligatorio');
      return;
    }

    const cleanedAttributes = attributes.filter(
      (item) => item.attributeId.trim() && item.attributeValueId.trim(),
    );

    try {
      if (isEditing && initialData) {
        const dto: UpdateProductVariantInput = {
          sku: cleanSku,
          barcode: barcode.trim() || undefined,
          price: cleanPrice,
          compareAtPrice: compareAtPrice.trim()
            ? Number(compareAtPrice)
            : undefined,
          costPrice: costPrice.trim() ? Number(costPrice) : undefined,
          isActive,
          attributes: cleanedAttributes.length ? cleanedAttributes : undefined,
        };

        const updated = await updateVariant.mutateAsync({
          productId: product.id,
          variantId: initialData.id,
          dto,
        });

        onSuccess(updated);
      } else {
        const dto: CreateProductVariantInput = {
          sku: cleanSku,
          barcode: barcode.trim() || undefined,
          price: cleanPrice,
          compareAtPrice: compareAtPrice.trim()
            ? Number(compareAtPrice)
            : undefined,
          costPrice: costPrice.trim() ? Number(costPrice) : undefined,
          isActive,
          attributes: cleanedAttributes.length ? cleanedAttributes : undefined,
        };

        const updated = await addVariant.mutateAsync({
          productId: product.id,
          dto,
        });

        onSuccess(updated);
      }

      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al guardar la variante',
      );
    }
  };

  const loading = addVariant.isPending || updateVariant.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {isEditing ? 'Editar variante' : 'Nueva variante'}
          </h2>

          <button onClick={onClose} className="text-sm text-gray-500">
            Cerrar
          </button>
        </div>

        <p className="mb-4 text-sm text-gray-600">
          Producto: <span className="font-medium">{product.name}</span>
        </p>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium">SKU</label>
              <input
                className="rounded-lg border px-3 py-2"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Ej: REM-NEG-M"
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Barcode</label>
              <input
                className="rounded-lg border px-3 py-2"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Código de barras"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Precio</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="rounded-lg border px-3 py-2"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Precio comparativo</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="rounded-lg border px-3 py-2"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Costo</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="rounded-lg border px-3 py-2"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Activa
          </label>

          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Atributos</label>
              <button
                type="button"
                onClick={addAttributeRow}
                className="rounded-lg border px-3 py-1 text-sm"
              >
                Agregar atributo
              </button>
            </div>

            {attributes.map((row, index) => (
              <div
                key={`${index}-${row.attributeId}-${row.attributeValueId}`}
                className="grid gap-2 md:grid-cols-[1fr_1fr_auto]"
              >
                <input
                  className="rounded-lg border px-3 py-2"
                  value={row.attributeId}
                  onChange={(e) =>
                    updateAttributeRow(index, {
                      ...row,
                      attributeId: e.target.value,
                    })
                  }
                  placeholder="attributeId"
                />

                <input
                  className="rounded-lg border px-3 py-2"
                  value={row.attributeValueId}
                  onChange={(e) =>
                    updateAttributeRow(index, {
                      ...row,
                      attributeValueId: e.target.value,
                    })
                  }
                  placeholder="attributeValueId"
                />

                <button
                  type="button"
                  onClick={() => removeAttributeRow(index)}
                  className="rounded-lg border px-3 py-2 text-sm"
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>

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
              {loading ? 'Guardando...' : 'Guardar variante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}