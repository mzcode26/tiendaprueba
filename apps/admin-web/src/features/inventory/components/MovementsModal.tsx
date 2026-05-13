import { useMemo } from 'react';
import type {
  InventoryItem,
  InventoryMovement,
} from '../types/inventory.types';

interface MovementsModalProps {
  open: boolean;
  item: InventoryItem | null;
  movements: InventoryMovement[];
  isLoading?: boolean;
  onClose: () => void;
}

function getMovementLabel(type: string) {
  switch (type) {
    case 'PURCHASE':
      return 'Compra';
    case 'SALE':
      return 'Venta';
    case 'RETURN':
      return 'Devolución';
    case 'ADJUSTMENT':
      return 'Ajuste';
    case 'ADJUSTMENT_IN':
      return 'Ajuste +';
    case 'ADJUSTMENT_OUT':
      return 'Ajuste -';
    case 'TRANSFER_IN':
      return 'Transferencia +';
    case 'TRANSFER_OUT':
      return 'Transferencia -';
    case 'INITIAL':
      return 'Inicial';
    default:
      return type;
  }
}

function getMovementBadgeClass(type: string) {
  if (type === 'SALE' || type === 'TRANSFER_OUT' || type === 'ADJUSTMENT_OUT') {
    return 'bg-red-100 text-red-700';
  }

  if (type === 'PURCHASE' || type === 'RETURN' || type === 'TRANSFER_IN' || type === 'ADJUSTMENT_IN' || type === 'INITIAL') {
    return 'bg-green-100 text-green-700';
  }

  return 'bg-gray-100 text-gray-700';
}

export function MovementsModal({
  open,
  item,
  movements,
  isLoading = false,
  onClose,
}: MovementsModalProps) {
  const title = useMemo(() => {
    if (!item) return 'Movimientos';

    return `${item.variant?.productName ?? item.variant?.product?.name ?? 'Producto'} — ${
      item.variant?.variantName ?? item.variant?.name ?? item.variant?.sku ?? 'Sin variante'
    }`;
  }, [item]);

  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-5xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Movimientos</h3>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-sm text-gray-500">
              {item.store?.name ?? 'Sucursal'} — Stock actual: {item.quantity}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cerrar
          </button>
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-gray-200 p-6 text-center text-sm text-gray-500">
            Cargando movimientos...
          </div>
        ) : movements.length === 0 ? (
          <div className="rounded-xl border border-gray-200 p-6 text-center text-sm text-gray-500">
            No hay movimientos para mostrar.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Cantidad
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Previo
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Actual
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Usuario
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Referencia
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Observación
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 bg-white">
                  {movements.map((movement) => (
                    <tr key={movement.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(movement.createdAt).toLocaleString('es-AR')}
                      </td>

                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getMovementBadgeClass(
                            movement.type,
                          )}`}
                        >
                          {getMovementLabel(movement.type)}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        {movement.quantity}
                      </td>

                      <td className="px-4 py-3 text-right text-sm text-gray-600">
                        {movement.previousQuantity ?? '-'}
                      </td>

                      <td className="px-4 py-3 text-right text-sm text-gray-600">
                        {movement.newQuantity ?? '-'}
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-600">
                        {movement.user?.name ?? movement.user?.email ?? '-'}
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-600">
                        {movement.referenceId ?? '-'}
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-600">
                        {movement.reason ?? '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}