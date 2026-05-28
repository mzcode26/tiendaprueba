import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  tenantSettingsSchema,
  type TenantSettingsFormData,
} from '../schemas/settings.schema';
import {
  useTenantSettings,
  useUpdateTenantSettings,
} from '../hooks/useSettings';
import { toast } from 'sonner';

const CURRENCIES = ['ARS', 'USD', 'EUR', 'CLP', 'COP', 'MXN', 'BRL'];

const TIMEZONES = [
  'America/Argentina/Buenos_Aires',
  'America/Santiago',
  'America/Bogota',
  'America/Mexico_City',
  'America/Sao_Paulo',
  'Europe/Madrid',
];

const DEFAULT_VALUES: TenantSettingsFormData = {
  general: {
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    currency: 'ARS',
    timezone: 'America/Argentina/Buenos_Aires',
    logoUrl: '',
  },
  sales: {},
  inventory: {},
};

export function TenantSettingsForm() {
  const { data, isLoading } = useTenantSettings();
  const updateSettings = useUpdateTenantSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<TenantSettingsFormData>({
    resolver: zodResolver(tenantSettingsSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (data) {
      reset({
        general: {
          name: data.general?.name ?? '',
          email: data.general?.email ?? '',
          phone: data.general?.phone ?? '',
          address: data.general?.address ?? '',
          city: data.general?.city ?? '',
          country: data.general?.country ?? '',
          currency: data.general?.currency ?? 'ARS',
          timezone: data.general?.timezone ?? 'America/Argentina/Buenos_Aires',
          logoUrl: data.general?.logoUrl ?? '',
        },
        sales: data.sales ?? {},
        inventory: data.inventory ?? {},
      });
    }
  }, [data, reset]);

  const onSubmit = (formData: TenantSettingsFormData) => {
    updateSettings.mutate(formData, {
      onSuccess: () => toast.success('Configuración guardada'),
      onError: () => toast.error('Error al guardar'),
    });
  };

  if (isLoading) {
    return <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del negocio *
          </label>
          <input
            {...register('general.name')}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.general?.name && (
            <p className="text-red-500 text-xs mt-1">
              {errors.general.name.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            {...register('general.email')}
            type="email"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.general?.email && (
            <p className="text-red-500 text-xs mt-1">
              {errors.general.email.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <input
            {...register('general.phone')}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.general?.phone && (
            <p className="text-red-500 text-xs mt-1">
              {errors.general.phone.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ciudad
          </label>
          <input
            {...register('general.city')}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.general?.city && (
            <p className="text-red-500 text-xs mt-1">
              {errors.general.city.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            País
          </label>
          <input
            {...register('general.country')}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.general?.country && (
            <p className="text-red-500 text-xs mt-1">
              {errors.general.country.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dirección
          </label>
          <input
            {...register('general.address')}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.general?.address && (
            <p className="text-red-500 text-xs mt-1">
              {errors.general.address.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Moneda *
          </label>
          <select
            {...register('general.currency')}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
          {errors.general?.currency && (
            <p className="text-red-500 text-xs mt-1">
              {errors.general.currency.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Zona horaria *
          </label>
          <select
            {...register('general.timezone')}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {TIMEZONES.map((timezone) => (
              <option key={timezone} value={timezone}>
                {timezone}
              </option>
            ))}
          </select>
          {errors.general?.timezone && (
            <p className="text-red-500 text-xs mt-1">
              {errors.general.timezone.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={!isDirty || updateSettings.isPending}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {updateSettings.isPending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
}