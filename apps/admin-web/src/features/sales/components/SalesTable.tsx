import type { SaleListItem } from '../types/sales.types';
import { formatCurrency, formatDate } from '../../../lib/utils';

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Pendiente', className: 'bg-blue-100 text-blue-700' },
  COMPLETED: { label: 'Completada', className: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Cancelada', className: 'bg-red-100 text-red-700' },
  REFUNDED: { label: 'Reembolsada', className: 'bg-yellow-100 text-yellow-700' },
};

const methodLabels: Record<string, string> = {
  CASH: 'Efectivo',
  CARD: 'Tarjeta',
  TRANSFER: 'Transferencia',
  OTHER: 'Otro',
  CARD_DEBIT: 'Débito',
  CARD_CREDIT: 'Crédito',
  QR: 'QR',
};

interface Props {
  sales: SaleListItem[];
  isLoading: boolean;
  onView: (sale: SaleListItem) => void;
  onCancel: (sale: SaleListItem) => void;
  pagination: { page: number; totalPages: number; onPageChange: (p: number) => void };
}

export function SalesTable({ sales, isLoading, onView, onCancel, pagination }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (!sales.length) {
    return <div className="text-center py-12 text-gray-500">No hay ventas registradas</div>;
  }

  const totalPages = Math.max(1, pagination.totalPages);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              {['N° Venta', 'Cliente', 'Items', 'Total', 'Pago', 'Estado', 'Fecha', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sales.map((sale) => {
              const status = statusConfig[sale.status] ?? {
                label: sale.status,
                className: 'bg-gray-100 text-gray-700',
              };
              const method = sale.payments?.[0]?.method;

              return (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-medium">{sale.saleNumber}</td>
                  <td className="px-4 py-3">
                    {sale.customer ? (
                      `${sale.customer.firstName} ${sale.customer.lastName}`
                    ) : (
                      <span className="text-gray-400">Sin cliente</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{sale._count?.items ?? 0}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(sale.total)}</td>
                  <td className="px-4 py-3">{method ? methodLabels[method] ?? method : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(sale.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => onView(sale)} className="text-blue-600 hover:underline text-xs">
                        Ver
                      </button>
                      {(sale.status === 'PENDING' || sale.status === 'COMPLETED') && (
                        <button onClick={() => onCancel(sale)} className="text-red-600 hover:underline text-xs">
                          Cancelar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-end gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => pagination.onPageChange(i + 1)}
              className={`px-3 py-1 rounded text-sm ${
                pagination.page === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}