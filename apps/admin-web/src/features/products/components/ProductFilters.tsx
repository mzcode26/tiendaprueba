import type { ProductFilters as ProductFiltersType, SelectOption } from '../types/product.types';

interface ProductFiltersProps {
  filters: ProductFiltersType;
  onChange: (filters: ProductFiltersType) => void;
  categoryOptions: SelectOption[];
  brandOptions: SelectOption[];
}

export function ProductFilters({
  filters,
  onChange,
  categoryOptions,
  brandOptions,
}: ProductFiltersProps) {
  const handleClear = () => {
    onChange({
      search: '',
      categoryId: '',
      brandId: '',
      isActive: undefined,
      page: 1,
      limit: 20,
    });
  };

  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="grid gap-3 md:grid-cols-4">
        <div className="grid gap-1">
          <label className="text-xs font-medium text-gray-500">Buscar</label>
          <input
            className="rounded-lg border px-3 py-2"
            placeholder="Nombre, SKU, slug..."
            value={filters.search ?? ''}
            onChange={(e) =>
              onChange({
                ...filters,
                search: e.target.value,
                page: 1,
              })
            }
          />
        </div>

        <div className="grid gap-1">
          <label className="text-xs font-medium text-gray-500">Categoría</label>
          <select
            className="rounded-lg border px-3 py-2"
            value={filters.categoryId ?? ''}
            onChange={(e) =>
              onChange({
                ...filters,
                categoryId: e.target.value,
                page: 1,
              })
            }
          >
            <option value="">Todas</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-1">
          <label className="text-xs font-medium text-gray-500">Marca</label>
          <select
            className="rounded-lg border px-3 py-2"
            value={filters.brandId ?? ''}
            onChange={(e) =>
              onChange({
                ...filters,
                brandId: e.target.value,
                page: 1,
              })
            }
          >
            <option value="">Todas</option>
            {brandOptions.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-1">
          <label className="text-xs font-medium text-gray-500">Estado</label>
          <select
            className="rounded-lg border px-3 py-2"
            value={
              filters.isActive === undefined
                ? ''
                : filters.isActive
                  ? 'true'
                  : 'false'
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
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={handleClear}
          className="rounded-lg border px-4 py-2 text-sm"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}