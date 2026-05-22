import {
  Minus,
  Plus,
  Trash2,
} from 'lucide-react';

import { formatCurrency } from '../../../lib/utils';

import type { POSCartItem } from '../types/pos.types';

interface Props {
  item: POSCartItem;

  onIncrease: (
    variantId: string,
  ) => void;

  onDecrease: (
    variantId: string,
  ) => void;

  onRemove: (
    variantId: string,
  ) => void;

  onPriceChange?: (
    variantId: string,
    price: number,
  ) => void;

  onDiscountChange?: (
    variantId: string,
    discountAmount: number,
  ) => void;
}

export function POSCartItemRow({
  item,

  onIncrease,
  onDecrease,
  onRemove,

  onPriceChange,
  onDiscountChange,
}: Props) {
  return (
    <div className="rounded-xl border bg-white p-3 space-y-3">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-900">
            {item.productName}
          </p>

          <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
            {item.sku && (
              <span>
                SKU: {item.sku}
              </span>
            )}

            <span>
              Cantidad: {item.quantity}
            </span>
          </div>
        </div>

        <button
          onClick={() =>
            onRemove(item.variantId)
          }
          className="rounded-lg p-1 text-red-500 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* PRICE / DISCOUNT */}
      <div className="grid grid-cols-2 gap-3">
        {/* PRICE */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Precio
          </label>

          <input
            type="number"
            min={0}
            step="0.01"
            value={item.unitPrice}
            onChange={(e) =>
              onPriceChange?.(
                item.variantId,
                Number(e.target.value),
              )
            }
            className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* DISCOUNT */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Descuento
          </label>

          <input
            type="number"
            min={0}
            step="0.01"
            value={item.discountAmount }
            onChange={(e) =>
              onDiscountChange?.(
                item.variantId,
                Number(e.target.value),
              )
            }
            className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-between">
        {/* QUANTITY */}
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              onDecrease(item.variantId)
            }
            className="flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-gray-50"
          >
            <Minus className="h-4 w-4" />
          </button>

          <span className="min-w-[28px] text-center text-sm font-medium">
            {item.quantity}
          </span>

          <button
            onClick={() =>
              onIncrease(item.variantId)
            }
            className="flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* TOTAL */}
        <div className="text-right">
          <p className="text-xs text-gray-500">
            Subtotal
          </p>

          <p className="text-sm font-semibold text-gray-900">
            {formatCurrency(item.total)}
          </p>
        </div>
      </div>
    </div>
  );
}