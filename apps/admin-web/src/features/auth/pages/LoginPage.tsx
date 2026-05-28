import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLogin } from '../hooks/useAuth';

type LoginFormValues = {
  email: string;
  password: string;
  tenantId: string;
};

export function LoginPage() {
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
      tenantId: localStorage.getItem('tienda-tenant-id') ?? '',
    },
  });

  useEffect(() => {
    const savedTenantId = localStorage.getItem('tienda-tenant-id');

    if (savedTenantId) {
      setValue('tenantId', savedTenantId);
    }
  }, [setValue]);

  const onSubmit = async (values: LoginFormValues) => {
    const tenantId = values.tenantId.trim();

    localStorage.setItem('tienda-tenant-id', tenantId);

    await loginMutation.mutateAsync({
      credentials: {
        email: values.email.trim(),
        password: values.password,
      },
      tenantId,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-gray-200">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Iniciar sesión</h1>
          <p className="mt-2 text-sm text-gray-500">
            Accedé a tu tienda con tu empresa o sucursal
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Tenant / Empresa / Sucursal
            </label>
            <input
              {...register('tenantId', {
                required: 'El tenant es requerido',
              })}
              type="text"
              placeholder="mi-empresa"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            {errors.tenantId && (
              <p className="mt-1 text-xs text-red-600">
                {errors.tenantId.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              {...register('email', {
                required: 'El email es requerido',
              })}
              type="email"
              placeholder="admin@correo.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              {...register('password', {
                required: 'La contraseña es requerida',
              })}
              type="password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loginMutation.isPending ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}