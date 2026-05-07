import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { storeSchema, type StoreFormData } from '../schemas/settings.schema';
import { useStores, useCreateStore, useUpdateStore, useDeleteStore } from '../hooks/useSettings';
import type { StoreSettings } from '../types/settings.types';
import { toast } from 'sonner';

export function StoresManager() {
  const [showForm, setShowForm] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreSettings | null>(null);

  const { data, isLoading } = useStores();
  const createStore = useCreateStore();
  const updateStore = useUpdateStore();
  const deleteStore = useDeleteStore();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
    defaultValues: { isActive: true },
  });

  const handleEdit = (store: StoreSettings) => {
    setEditingStore(store);
    reset(store);
    setShowForm(true);
  };

  const handleDelete = (store: StoreSettings) => {
    if (!confirm(`¿Eliminar tienda "${store.name}"?`)) return;
    deleteStore.mutate(store.id, {
      onSuccess: () => toast.success('Tienda eliminada'),
      onError: () => toast.error('Error al eliminar'),
    });
  };

  const onSubmit = (formData: StoreFormData) => {
    if (editingStore) {
      updateStore.mutate({ id: editingStore.id, data: formData }, {
        onSuccess: () => { toast.success('Tienda actualizada'); setShowForm(false); setEditingStore(null); reset(); },
        onError: () => toast.error('Error al actualizar'),
      });
    } else {
      createStore.mutate(formData, {
        onSuccess: () => { toast.success('Tienda creada'); setShowForm(false); reset(); },
        onError: () => toast.error('Error al crear'),
      });
    }
  };

  if (isLoading) return <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-700">Tiendas</h3>
        <button onClick={() => { setEditingStore(null); reset({ isActive: true }); setShowForm(true); }}
          className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Nueva tienda
        </button>
      </div>

      {/* Store List */}
      <div className="space-y-2">
        {!data?.data?.length ? (
          <p className="text-gray-400 text-sm text-center py-6">No hay tiendas registradas</p>
        ) : (
          data.data.map(store => (
            <div key={store.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div>
                <p className="font-medium text-sm">{store.name}</p>
                <p className="text-xs text-gray-400">{store.address ?? 'Sin dirección'}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  store.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {store.isActive ? 'Activa' : 'Inactiva'}
                </span>
                <button onClick={() => handleEdit(store)}
                  className="text-xs text-gray-500 hover:text-blue-600">Editar</button>
                <button onClick={() => handleDelete(store)}
                  className="text-xs text-red-500 hover:text-red-700">Eliminar</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="font-bold text-lg mb-4">{editingStore ? 'Editar tienda' : 'Nueva tienda'}</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input {...register('name')}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input {...register('address')}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input {...register('phone')}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex items-center gap-2">
                <input {...register('isActive')} type="checkbox" id="storeActive"
                  className="rounded border-gray-300" />
                <label htmlFor="storeActive" className="text-sm text-gray-700">Tienda activa</label>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditingStore(null); reset(); }}
                  className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={createStore.isPending || updateStore.isPending}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {createStore.isPending || updateStore.isPending ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}