import { Package, ArrowUpDown, Settings, Plus } from 'lucide-react';
import type { InventoryItem } from '../features/inventory/types/inventory.types';

interface Props {
  items: InventoryItem[];
  isLoading?: boolean;

  /**
   * inventory = módulo inventario
   * pos = punto de venta
   */
  mode?: 'inventory' | 'pos';

  /**
   * INVENTORY ACTIONS
   */
  onAdjust?: (item: InventoryItem) => void;
  onTransfer?: (item: InventoryItem) => void;
  onMovements?: (item: InventoryItem) => void;
  onSettings?: (item: InventoryItem) => void;

  /**
   * POS ACTION
   */
  onAddToSale?: (item: InventoryItem) => void;

  /**
   * Helpers
   * Soporta Map si tu InventoryTable original ya lo usaba así
   */
  productNameByVariantId?: Map<string, string>;
}

export function InventoryProductsTable({
  items,
  isLoading = false,
  mode = 'inventory',
  onAdjust,
  onTransfer,
  onMovements,
  onSettings,
  onAddToSale,
  productNameByVariantId,
}: Props) {
  const getProductName = (item: InventoryItem) => {
    const fromMap = productNameByVariantId?.get(item.variantId);
    return (
      fromMap ??
      item.variant?.product?.name ??
      item.variant?.productName ??
      item.variant?.variantName ??
      'Producto'
    );
  };

  const getVariantLabel = (item: InventoryItem) => {
    return item.variant?.name ?? item.variant?.variantName ?? item.variant?.sku ?? '—';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-6 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="bg-white rounded-xl border p-12 text-center">
        <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
        <p className="text-gray-500 font-medium">No hay productos para mostrar</p>
        <p className="text-sm text-gray-400 mt-1">
          Ajusta los filtros o selecciona otra sucursal
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Producto</th>
              <th className="px-4 py-3 text-left font-medium">SKU</th>
              <th className="px-4 py-3 text-left font-medium">Variante</th>
              <th className="px-4 py-3 text-center font-medium">Stock</th>
              <th className="px-4 py-3 text-center font-medium">Mínimo</th>
              <th className="px-4 py-3 text-center font-medium">Estado</th>
              <th className="px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {items.map((item) => {
              const productName = getProductName(item);
              const variantLabel = getVariantLabel(item);

              const quantity = Number(item.quantity ?? 0);
              const minStock = Number(item.minStock ?? 0);

              const isOutOfStock = quantity <= 0;
              const isLowStock = quantity > 0 && quantity <= minStock;

              return (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{productName}</p>
                      {item.store?.name && (
                        <p className="text-xs text-gray-500 mt-0.5">{item.store.name}</p>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span className="font-mono text-xs">
                      {item.variant?.sku ?? '—'}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-600 space-y-0.5">
                      <div>{variantLabel}</div>

                      {variantLabel === '—' && <div>—</div>}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center justify-center min-w-[60px] rounded-full px-2.5 py-1 text-xs font-medium ${
                        isOutOfStock
                          ? 'bg-gray-100 text-gray-700'
                          : isLowStock
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {quantity}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center text-gray-600">{minStock}</td>

                  <td className="px-4 py-3 text-center">
                    {isOutOfStock ? (
                      <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                        Sin stock
                      </span>
                    ) : isLowStock ? (
                      <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                        Bajo
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                        OK
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {mode === 'inventory' ? (
                        <>
                          <button
                            onClick={() => onAdjust?.(item)}
                            className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs hover:bg-gray-50"
                          >
                            <Package className="h-3.5 w-3.5" />
                            Ajustar
                          </button>

                          <button
                            onClick={() => onTransfer?.(item)}
                            className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs hover:bg-gray-50"
                          >
                            <ArrowUpDown className="h-3.5 w-3.5" />
                            Transferir
                          </button>

                          <button
                            onClick={() => onMovements?.(item)}
                            className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs hover:bg-gray-50"
                          >
                            Movimientos
                          </button>

                          <button
                            onClick={() => onSettings?.(item)}
                            className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs hover:bg-gray-50"
                          >
                            <Settings className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => onAddToSale?.(item)}
                          disabled={quantity <= 0}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Agregar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}