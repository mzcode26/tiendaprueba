import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, type ChangePasswordFormData } from '../schemas/settings.schema';
import { useChangePassword } from '../hooks/useSettings';
import { toast } from 'sonner';

export function ChangePasswordForm() {
  const changePassword = useChangePassword();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = (data: ChangePasswordFormData) => {
    changePassword.mutate(data, {
      onSuccess: () => { toast.success('Contraseña actualizada'); reset(); },
      onError: () => toast.error('Error al cambiar contraseña'),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña actual *</label>
        <input {...register('currentPassword')} type="password"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña *</label>
        <input {...register('newPassword')} type="password"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña *</label>
        <input {...register('confirmPassword')} type="password"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={changePassword.isPending}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {changePassword.isPending ? 'Cambiando...' : 'Cambiar contraseña'}
        </button>
      </div>
    </form>
  );
}