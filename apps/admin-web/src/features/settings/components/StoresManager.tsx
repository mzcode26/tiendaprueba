import { useMemo, useState } from 'react';

import {
  useCreateStore,
  useDeleteStore,
  useStores,
  useUpdateStore,
} from '../hooks/useSettings';

import type { Store } from '../types/settings.types';

import type {
  StoreFormValues,
} from '../schemas/store.schema';

import { StoreForm } from './StoreForm';

export function StoresManager() {
  const [selectedStore, setSelectedStore] =
    useState<Store | null>(null);

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [showInactive, setShowInactive] =
    useState(false);

  const {
    data: stores = [],
    isLoading,
    isFetching,
  } = useStores(showInactive);

  const createStore = useCreateStore();

  const updateStore = useUpdateStore();

  const deleteStore = useDeleteStore();

  const isEditing = useMemo(
    () => Boolean(selectedStore),
    [selectedStore],
  );

  function handleCreate() {
    setSelectedStore(null);
    setIsFormOpen(true);
  }

  function handleEdit(store: Store) {
    setSelectedStore(store);
    setIsFormOpen(true);
  }

  async function handleDelete(
    store: Store,
  ) {
    const confirmed = window.confirm(
      `¿Eliminar la sucursal "${store.name}"?`,
    );

    if (!confirmed) return;

    await deleteStore.mutateAsync(store.id);
  }

  async function handleSubmit(
    values: StoreFormValues,
  ) {
    if (selectedStore) {
      await updateStore.mutateAsync({
        id: selectedStore.id,
        payload: values,
      });
    } else {
      await createStore.mutateAsync(values);
    }

    setIsFormOpen(false);
    setSelectedStore(null);
  }

  function handleCloseForm() {
    setIsFormOpen(false);
    setSelectedStore(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Sucursales
          </h2>

          <p className="text-sm text-gray-500">
            Administración de tiendas y puntos de venta
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) =>
                setShowInactive(
                  e.target.checked,
                )
              }
              className="h-4 w-4 rounded border-gray-300"
            />

            Mostrar inactivas
          </label>

          <button
            onClick={handleCreate}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Nueva sucursal
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-3 text-sm text-gray-500">
          {isLoading || isFetching
            ? 'Cargando sucursales...'
            : `${stores.length} sucursales encontradas`}
        </div>

        {stores.length === 0 &&
        !isLoading ? (
          <div className="px-4 py-10 text-center text-sm text-gray-500">
            No hay sucursales registradas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <tbody className="divide-y divide-gray-200 bg-white">
                {stores.map((store) => (
                  <tr
                    key={store.id}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {store.name}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-600">
                      {store.address ||
                        '-'}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-600">
                      {store.phone ||
                        '-'}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-600">
                      {store.email ||
                        '-'}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          store.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {store.isActive
                          ? 'Activa'
                          : 'Inactiva'}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            handleEdit(
                              store,
                            )
                          }
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Editar
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(
                              store,
                            )
                          }
                          className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <StoreForm
              initialData={
                selectedStore ??
                undefined
              }
              isLoading={
                createStore.isPending ||
                updateStore.isPending
              }
              onSubmit={
                handleSubmit
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}