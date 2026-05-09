import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useCategories, useBrands } from '../hooks/useProducts';
import type { ProductFilters } from '../types/product.types';

interface Props {
  filters: ProductFilters;
  onChange: (filters: ProductFilters) => void;
}

export function ProductFilters({ filters, onChange }: Props) {
  const [search, setSearch] = useState(filters.search ?? '');
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();

  useEffect(() => {
    const timer = setTimeout(() => onChange({ ...filters, search, page: 1 }), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleClear = () => {
    setSearch('');
    onChange({ page: 1, limit: filters.limit });
  };

  return (
    <div className="bg-white border rounded-xl p-4 flex flex-wrap gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar productos..."
          className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <select
        value={filters.categoryId ?? ''}
        onChange={e => onChange({ ...filters, categoryId: e.target.value || undefined, page: 1 })}
        className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Todas las categorías</option>
        {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <select
        value={filters.brandId ?? ''}
        onChange={e => onChange({ ...filters, brandId: e.target.value || undefined, page: 1 })}
        className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Todas las marcas</option>
        {brands?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
      </select>
      <select
        value={filters.isActive === undefined ? '' : String(filters.isActive)}
        onChange={e => onChange({ ...filters, isActive: e.target.value === '' ? undefined : e.target.value === 'true', page: 1 })}
        className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Todos los estados</option>
        <option value="true">Activo</option>
        <option value="false">Inactivo</option>
      </select>
      <button onClick={handleClear} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <X className="h-4 w-4" /> Limpiar
      </button>
    </div>
  );
}