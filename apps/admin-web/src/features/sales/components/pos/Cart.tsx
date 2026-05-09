import { ShoppingCart, Trash2 } from 'lucide-react';
import { useCartStore } from '../../stores/cart.store';
import { CartItemRow } from './CartItemRow';

interface Props {
  onCheckout: () => void;
}

export function Cart({ onCheckout }: Props) {
  const { items, updateQuantity, removeItem, clearCart, getTotal } = useCartStore();
  const total = getTotal();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-400">
        <ShoppingCart className="h-10 w-10 mb-2 opacity-30" />
        <p className="text-sm">El carrito está vacío</p>
        <p className="text-xs mt-1">Buscá un producto para agregar</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">{items.length} producto(s)</span>
        <button onClick={clearCart} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700">
          <Trash2 className="h-3 w-3" /> Vaciar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {items.map(item => (
          <CartItemRow
            key={item.variantId}
            item={item}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
          />
        ))}
      </div>

      <div className="border-t pt-4 mt-4 space-y-3">
        <div className="flex justify-between text-base font-semibold">
          <span>Total</span>
          <span className="text-indigo-600">${total.toFixed(2)}</span>
        </div>
        <button
          onClick={onCheckout}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          Cobrar ${total.toFixed(2)}
        </button>
      </div>
    </div>
  );
}