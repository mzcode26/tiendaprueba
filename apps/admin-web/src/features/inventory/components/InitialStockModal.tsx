import { useEffect, useMemo, useState } from 'react';
import { PackageSearch, Search, X } from 'lucide-react';

import type { AdjustStockFormValues } from '../schemas/inventory.schema';
import type { Product } from '../../products/types/product.types';

interface InitialStockModalProps {
  open: boolean;
  storeId: string;
  storeName?: string;
  products: Product[];
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (values: AdjustStockFormValues) => void | Promise<void>;
}

export function InitialStockModal({
  open,
  storeId,
  storeName,
  products,
  isLoading = false,
  onClose,
  onSubmit,
}: InitialStockModalProps) {
  const [search, setSearch] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [quantity, setQuantity] = useState<number>(0);

  useEffect(() => {
    if (open) {
      setSearch('');
      setSelectedVariantId('');
      setQuantity(0);
    }
  }, [open]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return products;

    return products.filter((product) => {
      const productName = product.name?.toLowerCase() ?? '';

      const variantMatch = (product.variants ?? []).some((variant) => {
        const sku = variant.sku?.toLowerCase() ?? '';
        const barcode = variant.barcode?.toLowerCase() ?? '';

        return sku.includes(q) || barcode.includes(q);
      });

      return productName.includes(q) || variantMatch;
    });
  }, [products, search]);

  const selectedVariant = useMemo(() => {
    for (const product of products) {
      const variant = product.variants?.find((item) => item.id === selectedVariantId);

      if (variant) {
        return {
          product,
          variant,
        };
      }
    }

    return null;
  }, [products, selectedVariantId]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!storeId) {
      alert('Selecciona una sucursal');
      return;
    }

    if (!selectedVariantId) {
      alert('Selecciona una variante');
      return;
    }

    if (quantity < 0) {
      alert('La cantidad no puede ser negativa');
      return;
    }

    await onSubmit({
      storeId,
      variantId: selectedVariantId,
      type: 'SET',
      quantity,
      reason: 'Carga de stock inicial',
      reference: 'STOCK_INICIAL',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Carga de stock inicial
            </h3>
            <p className="text-sm text-gray-500">
              Sucursal: {storeName ?? storeId}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-4">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-3 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar producto, SKU o código de barras..."
                className="w-full rounded-xl border border-gray-300 px-10 py-2 text-sm outline-none transition focus:border-blue-500"
              />
            </div>

            <div className="max-h-[420px] overflow-auto rounded-xl border border-gray-200">
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 p-8 text-center text-sm text-gray-500">
                  <PackageSearch size={28} />
                  <p>No hay productos que coincidan con la búsqueda.</p>
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div key={product.id} className="border-b border-gray-200 last:border-b-0 p-4">
                    <p className="mb-3 font-semibold text-gray-900">{product.name}</p>

                    <div className="grid gap-2">
                      {(product.variants ?? []).length === 0 ? (
                        <p className="text-sm text-gray-500">
                          Este producto no tiene variantes.
                        </p>
                      ) : (
                        product.variants?.map((variant) => {
                          const isSelected = selectedVariantId === variant.id;

                          return (
                            <button
                              key={variant.id}
                              type="button"
                              onClick={() => setSelectedVariantId(variant.id)}
                              className={[
                                'flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition',
                                isSelected
                                  ? 'border-blue-600 bg-blue-50'
                                  : 'border-gray-200 bg-white hover:bg-gray-50',
                              ].join(' ')}
                            >
                              <span className="font-medium text-gray-800">
                                {variant.sku || 'Sin SKU'}
                              </span>

                              <span className="text-gray-500">
                                {variant.barcode ? `Barras: ${variant.barcode}` : 'Sin código'}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div>
              <p className="text-sm text-gray-500">Variante seleccionada</p>
              <p className="mt-1 font-semibold text-gray-900">
                {selectedVariant
                  ? `${selectedVariant.product.name} — ${selectedVariant.variant.sku || 'Sin SKU'}`
                  : 'Ninguna'}
              </p>
              <p className="text-sm text-gray-500">
                {selectedVariant?.variant.barcode
                  ? `Código: ${selectedVariant.variant.barcode}`
                  : 'Selecciona una variante para continuar'}
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Stock inicial
              </label>
              <input
                type="number"
                min={0}
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500"
              />
            </div>

            <div className="rounded-xl bg-white p-3 text-sm text-gray-600">
              <p className="font-medium text-gray-800">Qué hará este flujo</p>
              <p className="mt-1">
                Guardará el stock ingresado como ajuste tipo <span className="font-semibold">SET</span> con la observación <span className="font-semibold">“Carga de stock inicial”</span>.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? 'Guardando...' : 'Guardar stock inicial'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}