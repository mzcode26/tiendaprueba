
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
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
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
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
          />
        </div>

        <div className="flex items-end gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
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

          <label className="flex items-center gap-2 text-sm text-gray-700">
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

        <div className="flex items-end justify-start md:justify-end">
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