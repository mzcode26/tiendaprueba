import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import type { InventoryFiltersFormData } from '../schemas/inventory.schema';

interface Props {
  onFiltersChange: (filters: InventoryFiltersFormData) => void;
}

export function InventoryFilters({ onFiltersChange }: Props) {
  const [search, setSearch] = useState('');
  const [lowStock, setLowStock] = useState(false);
  const [outOfStock, setOutOfStock] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({ search, lowStock, outOfStock, page: 1, limit: 20 });
    }, 300);
    return () => clearTimeout(timer);
  }, [search, lowStock, outOfStock]);

  return (
    <div className="bg-white border rounded-xl p-4 flex flex-wrap gap-4 items-center">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por producto o SKU..."
          className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input type="checkbox" checked={lowStock} onChange={e => setLowStock(e.target.checked)} className="rounded" />
        Stock bajo
      </label>
      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input type="checkbox" checked={outOfStock} onChange={e => setOutOfStock(e.target.checked)} className="rounded" />
        Sin stock
      </label>
    </div>
  );
}