import type { ProductFilters } from '../types/product.types';

interface ProductFiltersProps {
  filters: ProductFilters;
  onChange: (filters: ProductFilters) => void;
}

export function ProductFilters({ filters, onChange }: ProductFiltersProps) {
  return (
    <div className="grid gap-3 rounded-2xl border bg-white p-4 md:grid-cols-4">
      <input
        className="rounded-lg border px-3 py-2"
        placeholder="Buscar..."
        value={filters.search ?? ''}
        onChange={(e) =>
          onChange({
            ...filters,
            search: e.target.value,
            page: 1,
          })
        }
      />

      <input
        className="rounded-lg border px-3 py-2"
        placeholder="Category ID"
        value={filters.categoryId ?? ''}
        onChange={(e) =>
          onChange({
            ...filters,
            categoryId: e.target.value,
            page: 1,
          })
        }
      />

      <input
        className="rounded-lg border px-3 py-2"
        placeholder="Brand ID"
        value={filters.brandId ?? ''}
        onChange={(e) =>
          onChange({
            ...filters,
            brandId: e.target.value,
            page: 1,
          })
        }
      />

      <select
        className="rounded-lg border px-3 py-2"
        value={
          filters.isActive === undefined ? '' : filters.isActive ? 'true' : 'false'
        }
        onChange={(e) =>
          onChange({
            ...filters,
            isActive:
              e.target.value === ''
                ? undefined
                : e.target.value === 'true',
            page: 1,
          })
        }
      >
        <option value="">Todos</option>
        <option value="true">Activos</option>
        <option value="false">Inactivos</option>
      </select>
    </div>
  );
}