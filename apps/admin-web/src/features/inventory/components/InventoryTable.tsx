import type { InventoryItem } from '../types/inventory.types';

interface InventoryTableProps {
  items: InventoryItem[];
  isLoading?: boolean;
  onAdjust?: (item: InventoryItem) => void;
  onTransfer?: (item: InventoryItem) => void;
  onMovements?: (item: InventoryItem) => void;
  onSettings?: (item: InventoryItem) => void;
}

export function InventoryTable({
  items,
  isLoading = false,
  onAdjust,
  onTransfer,
  onMovements,
  onSettings,
}: InventoryTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
        Cargando inventario...
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
        No hay stock para mostrar.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Producto
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Variante
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Sucursal
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Stock
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Stock mínimo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Estado
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white">
            {items.map((item) => {
              const productName =
                item.variant?.productName ??
                'Producto sin nombre';

              const variantName =
                item.variant?.variantName ??
                item.variant?.sku ??
                item.variant?.barcode ??
                'Sin variante';

              const storeName =
                item.store?.name ??
                'Sucursal desconocida';

              const isOutOfStock = item.quantity <= 0;
              const isLowStock = item.quantity > 0 && item.quantity <= item.minStock;

              const statusLabel = isOutOfStock
                ? 'Sin stock'
                : isLowStock
                  ? 'Bajo stock'
                  : 'Stock normal';

              const statusClassName = isOutOfStock
                ? 'bg-red-100 text-red-700'
                : isLowStock
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-green-100 text-green-700';

              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {productName}
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-600">
                    {variantName}
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-600">
                    {storeName}
                  </td>

                  <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    {item.quantity}
                  </td>

                  <td className="px-4 py-3 text-right text-sm text-gray-600">
                    {item.minStock}
                  </td>

                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusClassName}`}
                    >
                      {statusLabel}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {onAdjust && (
                        <button
                          type="button"
                          onClick={() => onAdjust(item)}
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Ajustar
                        </button>
                      )}

                      {onTransfer && (
                        <button
                          type="button"
                          onClick={() => onTransfer(item)}
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Transferir
                        </button>
                      )}

                      {onMovements && (
                        <button
                          type="button"
                          onClick={() => onMovements(item)}
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Movimientos
                        </button>
                      )}

                      {onSettings && (
                        <button
                          type="button"
                          onClick={() => onSettings(item)}
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Mínimo
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