import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import type { SaleFilters } from '../types/sales.types';

interface Props {
  filters: SaleFilters;
  onChange: (filters: SaleFilters) => void;
}

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'COMPLETED', label: 'Completadas' },
  { value: 'CANCELLED', label: 'Canceladas' },
  { value: 'REFUNDED', label: 'Reembolsadas' },
  { value: 'PENDING', label: 'Pendientes' },
];

export function SaleFilters({ filters, onChange }: Props) {
  const [search, setSearch] = useState(filters.search ?? '');

  useEffect(() => {
    const timer = setTimeout(() => onChange({ ...filters, search, page: 1 }), 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="bg-white border rounded-xl p-4 flex flex-wrap gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por número o cliente..."
          className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <select
        value={filters.status ?? ''}
        onChange={e => onChange({ ...filters, status: e.target.value || undefined, page: 1 })}
        className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <input
        type="date"
        value={filters.dateFrom ?? ''}
        onChange={e => onChange({ ...filters, dateFrom: e.target.value || undefined, page: 1 })}
        className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <input
        type="date"
        value={filters.dateTo ?? ''}
        onChange={e => onChange({ ...filters, dateTo: e.target.value || undefined, page: 1 })}
        className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}