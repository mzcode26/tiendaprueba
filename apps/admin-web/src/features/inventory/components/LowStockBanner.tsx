import type { LowStockAlert } from '../types/inventory.types';

interface LowStockBannerProps {
  items: LowStockAlert[];
  isLoading?: boolean;
  onViewAll?: () => void;
}

export function LowStockBanner({
  items,
  isLoading = false,
  onViewAll,
}: LowStockBannerProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
        Cargando alertas de stock...
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
        No hay alertas de stock bajo en este momento.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-yellow-900">
            Hay {items.length} productos con stock bajo
          </h3>
          <p className="mt-1 text-sm text-yellow-800">
            Revisá las sucursales con bajo nivel de inventario para evitar quiebres de stock.
          </p>
        </div>

        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="rounded-lg border border-yellow-300 bg-white px-4 py-2 text-sm font-medium text-yellow-900 hover:bg-yellow-100"
          >
            Ver inventario
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.slice(0, 6).map((item) => (
          <div
            key={item.inventoryId}
            className="rounded-lg border border-yellow-200 bg-white p-3"
          >
            <div className="text-sm font-medium text-gray-900">
              {item.productName}
            </div>
            <div className="mt-1 text-sm text-gray-600">
              SKU: {item.sku}
            </div>
            <div className="mt-1 text-sm text-gray-600">
              {item.storeName}
            </div>
            <div className="mt-2 text-sm font-semibold text-yellow-700">
              Stock: {item.quantity} / Mínimo: {item.minStock}
            </div>
            <div className="mt-1 text-sm text-yellow-800">
              Déficit: {item.deficit}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}