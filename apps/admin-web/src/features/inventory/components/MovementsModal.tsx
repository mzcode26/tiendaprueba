import { useInventoryMovements } from '../hooks/useInventory';
import type { Inventory } from '../types/inventory.types';

interface Props {
  inventory: Inventory | null;
  isOpen: boolean;
  onClose: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  PURCHASE: '🛒 Compra', SALE: '💰 Venta', ADJUSTMENT: '⚙️ Ajuste',
  TRANSFER_IN: '📥 Entrada', TRANSFER_OUT: '📤 Salida', LOSS: '❌ Pérdida', RETURN: '↩️ Devolución',
};

export function MovementsModal({ inventory, isOpen, onClose }: Props) {
  const { data: movements, isLoading } = useInventoryMovements(inventory?.id ?? null);

  if (!isOpen || !inventory) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Historial de Movimientos</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <p className="text-sm text-gray-500 mb-4">{inventory.productVariant?.product?.name}</p>
        <div className="overflow-y-auto flex-1 space-y-3">
          {isLoading && <p className="text-sm text-gray-400">Cargando...</p>}
          {movements?.map(m => (
            <div key={m.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium">{TYPE_LABELS[m.type] ?? m.type}</p>
                <p className="text-xs text-gray-500">{m.reason}</p>
                <p className="text-xs text-gray-400">{m.user ? `${m.user.firstName} ${m.user.lastName}` : ''} · {new Date(m.createdAt).toLocaleString('es-AR')}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${m.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {m.quantity > 0 ? '+' : ''}{m.quantity}
                </p>
                <p className="text-xs text-gray-400">{m.previousQuantity} → {m.newQuantity}</p>
              </div>
            </div>
          ))}
          {!isLoading && !movements?.length && (
            <p className="text-sm text-gray-400 text-center py-4">Sin movimientos registrados</p>
          )}
        </div>
      </div>
    </div>
  );
}