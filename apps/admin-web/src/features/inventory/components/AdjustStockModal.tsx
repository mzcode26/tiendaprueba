import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adjustStockSchema, type AdjustStockFormData } from '../schemas/inventory.schema';
import { useAdjustStock } from '../hooks/useInventory';
import type { Inventory } from '../types/inventory.types';

interface Props {
  inventory: Inventory | null;
  isOpen: boolean;
  onClose: () => void;
}

const MOVEMENT_TYPES = [
  { value: 'PURCHASE', label: 'Compra' },
  { value: 'ADJUSTMENT', label: 'Ajuste' },
  { value: 'LOSS', label: 'Pérdida' },
  { value: 'RETURN', label: 'Devolución' },
];

export function AdjustStockModal({ inventory, isOpen, onClose }: Props) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<AdjustStockFormData>({
    resolver: zodResolver(adjustStockSchema),
    defaultValues: { type: 'ADJUSTMENT', quantity: 1, reason: '' },
  });
  const adjustStock = useAdjustStock();
  const quantity = watch('quantity');

  if (!isOpen || !inventory) return null;

  const onSubmit = async (data: AdjustStockFormData) => {
    await adjustStock.mutateAsync({ id: inventory.id, data });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-1">Ajustar Stock</h2>
        <p className="text-sm text-gray-500 mb-4">
          {inventory.productVariant?.product?.name} — Stock actual: <strong>{inventory.quantity}</strong>
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de movimiento</label>
            <select {...register('type')} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {MOVEMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
            <input type="number" {...register('quantity')} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
            <p className="text-xs text-gray-400 mt-1">Stock resultante: {inventory.quantity + Number(quantity || 0)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
            <input {...register('reason')} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason.message}</p>}
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={adjustStock.isPending} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {adjustStock.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}