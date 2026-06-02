import type { Store } from '../features/settings/types/settings.types';


interface Props {
  value: string;
  onChange: (storeId: string) => void;
  stores: Store[];
  loading?: boolean;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function StoreSelector({
  value,
  onChange,
  stores,
  loading = false,
  label = 'Sucursal',
  placeholder = 'Seleccionar sucursal',
  disabled = false,
  className = '',
}: Props) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading || disabled}
        className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700"
      >
        <option value="">
          {loading ? 'Cargando sucursales...' : placeholder}
        </option>

        {stores.map((store) => (
          <option key={store.id} value={store.id}>
            {store.name}
          </option>
        ))}
      </select>
    </div>
  );
}