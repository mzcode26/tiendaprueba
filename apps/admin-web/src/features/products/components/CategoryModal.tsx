import { useState } from 'react';
import { useAuthStore } from '../../../stores/auth.store';
import type { SelectOption } from '../types/product.types';

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (category: SelectOption) => void;
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

async function createCategory(name: string, description?: string) {
  const token = useAuthStore.getState().token;

  const res = await fetch(`${API_URL}/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      name,
      description,
    }),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(json?.message || 'Error al guardar la categoría');
  }

  const data = json?.data ?? json;
  return {
    id: data.id,
    name: data.name,
  } as SelectOption;
}

export function CategoryModal({
  open,
  onClose,
  onSuccess,
}: CategoryModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanName = name.trim();
    if (!cleanName) {
      setError('El nombre es obligatorio');
      return;
    }

    try {
      setLoading(true);
      const created = await createCategory(
        cleanName,
        description.trim() || undefined,
      );
      onSuccess(created);
      onClose();
      setName('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la categoría');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Nueva categoría</h2>
          <button onClick={onClose} className="text-sm text-gray-500">
            Cerrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Nombre</label>
            <input
              className="rounded-lg border px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Remeras"
              required
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Descripción</label>
            <textarea
              className="rounded-lg border px-3 py-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción opcional"
              rows={4}
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-60"
            >
              {loading ? 'Guardando...' : 'Guardar categoría'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}