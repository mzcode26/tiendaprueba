import { Search } from 'lucide-react';
import { useCategories, useBrands } from '../hooks/useProducts';
import type { ProductFilters } from '../types/product.types';

interface Props {
  filters: ProductFilters;
  onChange: (filters: ProductFilters) => void;
}

export function ProductFilters({ filters, onChange }: Props) {
  const { data: categoriesData } = useCategories();
  const { data: brandsData } = useBrands();

  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={filters.search ?? ''}
          onChange={e => onChange({ ...filters, search: e.target.value, page: 1 })}
          placeholder="Buscar por nombre o SKU..."
          className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <select
        value={filters.categoryId ?? ''}
        onChange={e => onChange({ ...filters, categoryId: e.target.value || undefined, page: 1 })}
        className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Todas las categorías</option>
        {categoriesData?.data?.data?.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <select
        value={filters.brandId ?? ''}
        onChange={e => onChange({ ...filters, brandId: e.target.value || undefined, page: 1 })}
        className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Todas las marcas</option>
        {brandsData?.data?.data?.map(b => (
          <option key={b.id} value={b.id}>{b.name}</option>
        ))}
      </select>

      <select
        value={filters.isActive === undefined ? '' : String(filters.isActive)}
        onChange={e => onChange({
          ...filters,
          isActive: e.target.value === '' ? undefined : e.target.value === 'true',
          page: 1,
        })}
        className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Todos los estados</option>
        <option value="true">Activos</option>
        <option value="false">Inactivos</option>
      </select>
    </div>
  );
}