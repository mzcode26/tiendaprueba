import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categorySchema, type CategoryFormData } from '../schemas/product.schema';
import { useCategories } from '../hooks/useProducts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services/product.service';
import { toast } from 'sonner';

interface Props {
  onClose: () => void;
}

export function CategoryModal({ onClose }: Props) {
  const qc = useQueryClient();
  const { data: categoriesData } = useCategories();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: { isActive: true },
  });

  const createCategory = useMutation({
    mutationFn: productService.createCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoría creada');
      reset();
    },
    onError: () => toast.error('Error al crear categoría'),
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Gestionar categorías</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        {/* Existing categories */}
        <div className="mb-4 max-h-40 overflow-y-auto space-y-1">
          {!categoriesData?.data?.length ? (
            <p className="text-sm text-gray-400">Sin categorías</p>
          ) : (
            categoriesData.data.map(c => (
              <div key={c.id} className="flex items-center justify-between px-3 py-1.5 bg-gray-50 rounded-lg">
                <span className="text-sm">{c.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {c.isActive ? 'Activa' : 'Inactiva'}
                </span>
              </div>
            ))
          )}
        </div>

        {/* New category form */}
        <form onSubmit={handleSubmit(d => createCategory.mutate(d))} className="space-y-3 border-t pt-4">
          <p className="text-sm font-medium text-gray-700">Nueva categoría</p>
          <div>
            <input {...register('name')} placeholder="Nombre de la categoría"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <select {...register('parentId')}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Sin categoría padre</option>
              {categoriesData?.data?.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose}
              className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">
              Cerrar
            </button>
            <button type="submit" disabled={createCategory.isPending}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {createCategory.isPending ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}