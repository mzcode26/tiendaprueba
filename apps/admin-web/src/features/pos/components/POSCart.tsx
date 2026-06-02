import { ShoppingCart, User } from 'lucide-react';

import { formatCurrency } from '../../../lib/utils';

import { usePOSCartStore } from '../stores/pos-cart.store';
import { POSCartItemRow } from './POSCartItemRow';

interface Props {
  onCheckout: () => void;
  onClear?: () => void;
  onSelectCustomer?: () => void;
  onRemoveCustomer?: () => void;
}

export function POSCart({
  onCheckout,
  onClear,
  onSelectCustomer,
  onRemoveCustomer,
}: Props) {
  const {
    items,
    customer,
    subtotal,
    discountTotal,
    total,
    itemCount,
    removeItem,
    updateQuantity,
    updatePrice,
    updateDiscount,
    clearCart,
  } = usePOSCartStore();

  const handleClear = () => {
    clearCart();
    onClear?.();
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* HEADER */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-semibold text-gray-800">
            <ShoppingCart className="h-5 w-5" />
            Carrito ({itemCount} items)
          </div>

          {items.length > 0 && (
            <button
              onClick={handleClear}
              className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
            >
              Vaciar
            </button>
          )}
        </div>
      </div>

      {/* CUSTOMER */}
      <div className="border-b p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">Cliente</p>

          {customer && (
            <button
              onClick={onRemoveCustomer}
              className="text-xs text-red-500 hover:underline"
              type="button"
            >
              Quitar
            </button>
          )}
        </div>

        {customer ? (
          <div className="rounded-xl border bg-gray-50 p-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">
                  {customer.firstName} {customer.lastName}
                </p>

                {customer.email && (
                  <p className="truncate text-xs text-gray-500">
                    {customer.email}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={onSelectCustomer}
            type="button"
            className="w-full rounded-xl border border-dashed px-4 py-3 text-sm text-gray-600 hover:bg-gray-50"
          >
            Seleccionar cliente opcional
          </button>
        )}
      </div>

      {/* ITEMS */}
      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed bg-gray-50 p-6 text-sm text-gray-400">
            El carrito está vacío
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <POSCartItemRow
                key={item.variantId}
                item={item}
                onIncrease={(variantId) =>
                  updateQuantity(
                    variantId,
                    item.quantity + 1,
                  )
                }
                onDecrease={(variantId) =>
                  updateQuantity(
                    variantId,
                    item.quantity - 1,
                  )
                }
                onRemove={removeItem}
                onPriceChange={updatePrice}
                onDiscountChange={updateDiscount}
              />
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="border-t p-4 space-y-3 bg-white">
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          <div className="flex items-center justify-between text-gray-600">
            <span>Descuento</span>
            <span>- {formatCurrency(discountTotal)}</span>
          </div>

          <div className="flex items-center justify-between text-lg font-bold text-gray-900">
            <span>Total</span>
            <span className="text-blue-600">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        <button
          onClick={onCheckout}
          disabled={items.length === 0}
          className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          Cobrar
        </button>
      </div>
    </div>
  );
}