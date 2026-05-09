import { Settings, History } from 'lucide-react';
import type { Inventory, PaginatedInventory } from '../types/inventory.types';

interface Props {
  inventory: PaginatedInventory;
  isLoading: boolean;
  onAdjust: (item: Inventory) => void;
  onViewMovements: (item: Inventory) => void;
}

const StockBadge = ({ quantity, threshold }: { quantity: number; threshold: number }) => {
  if (quantity === 0) return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">🔴 Sin stock</span>;
  if (quantity <= threshold) return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">🟡 Stock bajo</span>;
  return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">🟢 Normal</span>;
};

export function InventoryTable({ inventory, isLoading, onAdjust, onViewMovements }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-4 bg-white border rounded-xl">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {['Producto', 'SKU', 'Tienda', 'Cantidad', 'Estado', 'Acciones'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {inventory.data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">
                {item.productVariant?.product?.name ?? '—'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">{item.productVariant?.sku ?? '—'}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{item.store?.name ?? '—'}</td>
              <td className="px-4 py-3 text-sm font-semibold">{item.quantity}</td>
              <td className="px-4 py-3">
                <StockBadge quantity={item.quantity} threshold={item.lowStockThreshold} />
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button onClick={() => onAdjust(item)} className="text-indigo-600 hover:text-indigo-800" title="Ajustar stock">
                    <Settings className="h-4 w-4" />
                  </button>
                  <button onClick={() => onViewMovements(item)} className="text-gray-600 hover:text-gray-800" title="Ver movimientos">
                    <History className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}