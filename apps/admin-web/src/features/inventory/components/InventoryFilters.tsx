
import type {
  InventoryFiltersFormValues,
} from '../schemas/inventory.schema';


interface InventoryFiltersProps {
  values: InventoryFiltersFormValues;
  onChange: (values: InventoryFiltersFormValues) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export function InventoryFilters({
  values,
  onChange,
  onReset,
  isLoading = false,
}: InventoryFiltersProps) {
  function handleFieldChange<K extends keyof InventoryFiltersFormValues>(
    field: K,
    value: InventoryFiltersFormValues[K],
  ) {
    onChange({
      ...values,
      [field]: value,
    });
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4 shadow-sm">
      <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <label className="text-xs sm:text-sm font-medium text-gray-700">
            Buscar
          </label>

          <input
            type="text"
            value={values.search ?? ''}
            onChange={(e) =>
              handleFieldChange('search', e.target.value || undefined)
            }
            disabled={isLoading}
            placeholder="Producto, SKU o código"
            className="w-full rounded-lg border border-gray-300 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm outline-none transition focus:border-blue-500"
          />
        </div>

        <div className="flex items-end gap-2 sm:gap-3 md:gap-4 col-span-1 sm:col-span-2 lg:col-span-2">
          <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 whitespace-nowrap">
            <input
              type="checkbox"
              checked={values.lowStock ?? false}
              onChange={(e) =>
                handleFieldChange('lowStock', e.target.checked)
              }
              disabled={isLoading}
              className="h-4 w-4 rounded border-gray-300"
            />
            Bajo stock
          </label>

          <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 whitespace-nowrap">
            <input
              type="checkbox"
              checked={values.outOfStock ?? false}
              onChange={(e) =>
                handleFieldChange('outOfStock', e.target.checked)
              }
              disabled={isLoading}
              className="h-4 w-4 rounded border-gray-300"
            />
            Sin stock
          </label>
        </div>

        <div className="flex items-end justify-start lg:justify-end col-span-1 sm:col-span-2 lg:col-span-1 gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onReset}
            disabled={isLoading}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>
  );
}