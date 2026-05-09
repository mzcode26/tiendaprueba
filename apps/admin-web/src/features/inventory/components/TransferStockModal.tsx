import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transferStockSchema, type TransferStockFormData } from '../schemas/inventory.schema';
import { useTransferStock } from '../hooks/useInventory';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function TransferStockModal({ isOpen, onClose }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<TransferStockFormData>({
    resolver: zodResolver(transferStockSchema),
  });
  const transfer = useTransferStock();

  if (!isOpen) return null;

  const onSubmit = async (data: TransferStockFormData) => {
    await transfer.mutateAsync(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">Transferir Stock</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tienda origen</label>
            <input {...register('fromStoreId')} placeholder="ID de tienda origen" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            {errors.fromStoreId && <p className="text-red-500 text-xs mt-1">{errors.fromStoreId.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tienda destino</label>
            <input {...register('toStoreId')} placeholder="ID de tienda destino" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            {errors.toStoreId && <p className="text-red-500 text-xs mt-1">{errors.toStoreId.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Variante de producto (ID)</label>
            <input {...register('productVariantId')} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            {errors.productVariantId && <p className="text-red-500 text-xs mt-1">{errors.productVariantId.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
            <input type="number" {...register('quantity')} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo (opcional)</label>
            <input {...register('reason')} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={transfer.isPending} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {transfer.isPending ? 'Transfiriendo...' : 'Transferir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}