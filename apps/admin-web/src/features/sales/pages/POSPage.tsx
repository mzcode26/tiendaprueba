import { useState, useEffect, useRef } from 'react';
import { useCartStore } from '../stores/cart.store';
import { usePOSSearch, useCreateSale } from '../hooks/useSales';
import { formatCurrency } from '../../../lib/utils';
import type { POSProduct } from '../types/sales.types';
import { toast } from 'sonner';

export default function POSPage() {
  const [query, setQuery] = useState('');
  const [storeId] = useState('default-store-id'); // replace with real store selector
  const searchRef = useRef<HTMLInputElement>(null);
  const { data: results } = usePOSSearch(query, storeId);
  const cart = useCartStore();
  const createSale = useCreateSale();

  // F2 focuses search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F2') searchRef.current?.focus();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleCheckout = () => {
    if (!cart.items.length) return;
    createSale.mutate({
      storeId,
      customerId: cart.customerId,
      items: cart.items.map(i => ({
        variantId: i.variantId,
        quantity: i.quantity,
        unitPrice: i.price,
        discount: i.discount,
      })),
      payments: [{ method: 'CASH', amount: cart.total }],
    }, {
      onSuccess: () => {
        toast.success('Venta registrada exitosamente');
        cart.clearCart();
        setQuery('');
      },
      onError: () => toast.error('Error al registrar la venta'),
    });
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Left: Product Search */}
      <div className="flex-1 p-4 border-r overflow-y-auto">
        <input
          ref={searchRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="🔍 Buscar producto... (F2)"
          className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {(results?.data as POSProduct[] ?? []).map(product => (
            <button key={product.variantId}
              onClick={() => cart.addItem(product)}
              className="border rounded-lg p-3 text-left hover:border-blue-500 hover:bg-blue-50 transition">
              <div className="font-medium text-sm truncate">{product.productName}</div>
              <div className="text-xs text-gray-500">{product.sku}</div>
              {product.size && <div className="text-xs text-gray-400">Talle: {product.size}</div>}
              <div className="mt-1 font-bold text-blue-600">{formatCurrency(product.price)}</div>
              <div className="text-xs text-gray-400">Stock: {product.stock}</div>
            </button>
          ))}
          {query.length > 1 && !results?.data?.length && (
            <div className="col-span-3 text-center text-gray-400 py-8">Sin resultados</div>
          )}
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-96 flex flex-col bg-gray-50">
        <div className="p-4 border-b font-semibold text-gray-700">
          🛒 Carrito ({cart.itemCount} items)
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {cart.items.length === 0 && (
            <div className="text-center text-gray-400 py-12">Carrito vacío</div>
          )}
          {cart.items.map(item => (
            <div key={item.variantId} className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-sm">{item.productName}</div>
                  <div className="text-xs text-gray-500">{item.sku} {item.size && `· ${item.size}`}</div>
                </div>
                <button onClick={() => cart.removeItem(item.variantId)}
                  className="text-red-400 hover:text-red-600 text-xs">✕</button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button onClick={() => cart.updateQuantity(item.variantId, item.quantity - 1)}
                  className="w-6 h-6 rounded border text-sm">-</button>
                <span className="text-sm font-medium">{item.quantity}</span>
                <button onClick={() => cart.updateQuantity(item.variantId, item.quantity + 1)}
                  className="w-6 h-6 rounded border text-sm">+</button>
                <span className="ml-auto font-medium text-sm">{formatCurrency(item.subtotal)}</span>
              </div>
            </div>
          ))}
        </div>
        {/* Cart Summary */}
        <div className="p-4 border-t bg-white space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span><span>{formatCurrency(cart.subtotal)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span><span className="text-blue-600">{formatCurrency(cart.total)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={!cart.items.length || createSale.isPending}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
            {createSale.isPending ? 'Procesando...' : `Cobrar ${formatCurrency(cart.total)}`}
          </button>
        </div>
      </div>
    </div>
  );
}