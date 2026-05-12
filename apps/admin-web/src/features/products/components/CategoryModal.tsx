import { useEffect, useState } from 'react';

export interface CategoryLike {
  id: string;
  name: string;
  description?: string | null;
  slug?: string;
}

interface CategoryModalProps {
  open: boolean;
  initialData?: CategoryLike | null;
  onClose: () => void;
  onSuccess: (category: CategoryLike) => void;
}

function generateSlug(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function CategoryModal({
  open,
  initialData,
  onClose,
  onSuccess,
}: CategoryModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name ?? '');
      setDescription(initialData.description ?? '');
    } else {
      setName('');
      setDescription('');
    }
    setError('');
  }, [initialData, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('El nombre es obligatorio');
      return;
    }

    const payload = {
      name: trimmedName,
      description: description.trim() || undefined,
      slug: generateSlug(trimmedName),
    };

    try {
      setLoading(true);

      // Acá luego conectás tu service real de categorías.
      // Por ahora el modal queda listo para integrarse sin cambiar el patrón.
      onSuccess({
        id: initialData?.id ?? '',
        name: payload.name,
        description: payload.description,
        slug: payload.slug,
      });

      onClose();
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
          <h2 className="text-xl font-semibold">
            {initialData?.id ? 'Editar categoría' : 'Nueva categoría'}
          </h2>
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