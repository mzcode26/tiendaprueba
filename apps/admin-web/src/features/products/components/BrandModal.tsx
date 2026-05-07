import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { brandSchema, type BrandFormData } from '../schemas/product.schema';
import { useBrands, useCreateBrand } from '../hooks/useProducts';
import { toast } from 'sonner';

interface Props {
  onClose: () => void;
}

export function BrandModal({ onClose }: Props) {
  const { data: brandsData } = useBrands();
  const createBrand = useCreateBrand();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: { isActive: true },
  });

  const onSubmit = (data: BrandFormData) => {
    createBrand.mutate(data, {
      onSuccess: () => { toast.success('Marca creada'); reset(); },
      onError: () => toast.error('Error al crear marca'),
    });
  };

  const brands = brandsData?.data?.data ?? [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Gestionar marcas</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <div className="mb-4 max-h-40 overflow-y-auto space-y-1">
          {!brands.length ? (
            <p className="text-sm text-gray-400">Sin marcas</p>
          ) : (
            brands.map(b => (
              <div key={b.id} className="flex items-center justify-between px-3 py-1.5 bg-gray-50 rounded-lg">
                <span className="text-sm">{b.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  b.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {b.isActive ? 'Activa' : 'Inactiva'}
                </span>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 border-t pt-4">
          <p className="text-sm font-medium text-gray-700">Nueva marca</p>
          <div>
            <input
              {...register('name')}
              placeholder="Nombre de la marca"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose}
              className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">
              Cerrar
            </button>
            <button type="submit" disabled={createBrand.isPending}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {createBrand.isPending ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}