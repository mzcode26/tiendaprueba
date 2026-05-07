import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tenantSettingsSchema, type TenantSettingsFormData } from '../schemas/settings.schema';
import { useTenantSettings, useUpdateTenantSettings } from '../hooks/useSettings';
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

export function TenantSettingsForm() {
  const { data, isLoading } = useTenantSettings();
  const updateSettings = useUpdateTenantSettings();

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<TenantSettingsFormData>({
    resolver: zodResolver(tenantSettingsSchema),
    defaultValues: { currency: 'ARS', timezone: 'America/Argentina/Buenos_Aires' },
  });

  useEffect(() => {
    if (data?.data) reset(data.data);
  }, [data, reset]);

  const onSubmit = (formData: TenantSettingsFormData) => {
    updateSettings.mutate(formData, {
      onSuccess: () => toast.success('Configuración guardada'),
      onError: () => toast.error('Error al guardar'),
    });
  };

  if (isLoading) return <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del negocio *</label>
          <input {...register('name')}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input {...register('email')} type="email"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.email && <p className="text-red-500 text-gray-700 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <input {...register('phone')}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
          <input {...register('city')}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
          <input {...register('country')}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
          <input {...register('address')}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Moneda *</label>
          <select {...register('currency')}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Zona horaria *</label>
          <select {...register('timezone')}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={!isDirty || updateSettings.isPending}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {updateSettings.isPending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
}