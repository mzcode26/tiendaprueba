import { useEffect, useMemo, useState } from 'react';
import { X, Package } from 'lucide-react';

import { formatCurrency } from '../../../lib/utils';

import type { InventoryItem } from '../../inventory/types/inventory.types';
import type { AddToCartPayload } from '../types/pos.types';

interface Props {
  isOpen: boolean;
  item: InventoryItem | null;
  onClose: () => void;
  onConfirm: (payload: AddToCartPayload) => void;
}

export function POSItemModal({
  isOpen,
  item,
  onClose,
  onConfirm,
}: Props) {
  const availableStock = Number(item?.quantity ?? 0);

  const baseProductName =
    item?.variant?.product?.name ??
    item?.variant?.productName ??
    item?.variant?.variantName ??
    'Producto';

  const sku = item?.variant?.sku ?? '';

  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    if (!item) return;

    setQuantity(1);
    setDiscountAmount(0);

    const fallbackPrice =
      Number(
        (item.variant as { price?: number; salePrice?: number } | undefined)?.price ??
        (item.variant as { salePrice?: number } | undefined)?.salePrice ??
        0,
      );

    setUnitPrice(fallbackPrice);
  }, [item]);

  const subtotal = useMemo(() => {
    return quantity * unitPrice;
  }, [quantity, unitPrice]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const handleConfirm = () => {
    if (!item) return;
    if (quantity <= 0) return;
    if (availableStock > 0 && quantity > availableStock) return;

    onConfirm({
      variantId: item.variantId,
      productName: baseProductName,
      sku,
      quantity,
      unitPrice,
      discountAmount: discountAmount,
      inventoryItem: item,
    });

    onClose();
  };

  if (!isOpen || !item) return null;

  const isOutOfStock = availableStock <= 0;
  const isQuantityInvalid = quantity <= 0 || (availableStock > 0 && quantity > availableStock);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Agregar a venta</h2>
            <p className="text-sm text-gray-500">Configura cantidad y precio</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="space-y-5 px-6 py-5">
          {/* PRODUCT INFO */}
          <div className="rounded-xl border bg-gray-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Package className="h-5 w-5 text-blue-600" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {baseProductName}
                </p>

                <div className="mt-1 space-y-1 text-xs text-gray-500">
                  {sku && <div>SKU: {sku}</div>}
                  <div>Sucursal: {item.store?.name ?? '—'}</div>
                  <div>Stock disponible: {availableStock}</div>
                </div>
              </div>
            </div>
          </div>

          {/* FIELDS */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Cantidad
              </label>
              <input
                type="number"
                min={1}
                max={availableStock > 0 ? availableStock : undefined}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {isOutOfStock && (
                <p className="mt-1 text-xs text-red-500">
                  Sin stock disponible
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Precio unitario
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Descuento
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(Number(e.target.value))}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* CALCULATION */}
          <div className="rounded-xl border bg-white p-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between text-gray-600">
                <span>Descuento</span>
                <span>- {formatCurrency(discountAmount)}</span>
              </div>

              <div className="flex items-center justify-between text-base font-bold text-gray-900">
                <span>Total</span>
                <span className="text-blue-600">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {isQuantityInvalid && (
            <p className="text-sm text-red-500">
              La cantidad seleccionada no es válida para el stock disponible.
            </p>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirm}
            disabled={isQuantityInvalid}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}