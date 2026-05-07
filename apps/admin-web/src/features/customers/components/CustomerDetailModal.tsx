import { useCustomerSales } from '../hooks/useCustomers';
import { formatCurrency, formatDate } from '../../../lib/utils';
import type { Customer } from '../types/customer.types';

interface Props {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
}

export function CustomerDetailModal({ customer, isOpen, onClose, onEdit }: Props) {
  const { data: salesData, isLoading } = useCustomerSales(customer?.id ?? '');

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-lg font-bold">
            {customer.firstName} {customer.lastName}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">Email:</span> <span className="ml-1">{customer.email ?? '—'}</span></div>
            <div><span className="text-gray-500">Teléfono:</span> <span className="ml-1">{customer.phone ?? '—'}</span></div>
            <div><span className="text-gray-500">Ciudad:</span> <span className="ml-1">{customer.city ?? '—'}</span></div>
            <div><span className="text-gray-500">Dirección:</span> <span className="ml-1">{customer.address ?? '—'}</span></div>
            <div><span className="text-gray-500">Total gastado:</span> <span className="ml-1 font-medium">{formatCurrency(customer.totalSpent)}</span></div>
            <div><span className="text-gray-500">Compras:</span> <span className="ml-1">{customer.salesCount}</span></div>
          </div>

          {/* Sales History */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Historial de compras</h3>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : !salesData?.data?.length ? (
              <p className="text-gray-400 text-sm">Sin compras registradas</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-3 py-2 text-left">N° Venta</th>
                    <th className="px-3 py-2 text-left">Total</th>
                    <th className="px-3 py-2 text-left">Estado</th>
                    <th className="px-3 py-2 text-left">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {salesData.data.map(sale => (
                    <tr key={sale.id}>
                      <td className="px-3 py-2 font-mono">{sale.saleNumber}</td>
                      <td className="px-3 py-2 font-medium">{formatCurrency(sale.total)}</td>
                      <td className="px-3 py-2">{sale.status}</td>
                      <td className="px-3 py-2 text-gray-500">{formatDate(sale.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t">
          <button onClick={onClose}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
            Cerrar
          </button>
          <button onClick={() => { onEdit(customer); onClose(); }}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Editar
          </button>
        </div>
      </div>
    </div>
  );
}