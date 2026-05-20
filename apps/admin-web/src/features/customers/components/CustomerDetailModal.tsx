import { useCustomer, useCustomerStats } from '../hooks/useCustomers';
import { formatCurrency, formatDate } from '../../../lib/utils';
import type { CustomerDetail, CustomerFormDefaults, CustomerListItem } from '../types/customer.types';

interface Props {
  customer: CustomerListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (customer: CustomerFormDefaults) => void;
}

const EmptyState = ({ text }: { text: string }) => <p className="text-gray-400 text-sm">{text}</p>;

export function CustomerDetailModal({ customer, isOpen, onClose, onEdit }: Props) {
  const customerId = customer?.id ?? '';
  const { data: customerData, isLoading: isCustomerLoading } = useCustomer(customerId, isOpen);
  const { data: stats, isLoading: isStatsLoading } = useCustomerStats(customerId, isOpen);

  if (!isOpen || !customer) return null;

  const detail = (customerData ?? customer) as CustomerDetail;
  const sales = detail.sales ?? [];
  const totalSpent = stats?.totalSpent ?? 0;
  const totalPurchases = stats?.totalPurchases ?? detail._count?.sales ?? sales.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-6">
          <div>
            <h2 className="text-lg font-bold">
              {detail.firstName} {detail.lastName}
            </h2>
            <p className="text-xs text-gray-500">Detalle del cliente</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            ✕
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Compras</p>
              <p className="mt-1 text-2xl font-semibold">{isStatsLoading ? '—' : totalPurchases}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Total gastado</p>
              <p className="mt-1 text-2xl font-semibold">{isStatsLoading ? '—' : formatCurrency(totalSpent)}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Promedio</p>
              <p className="mt-1 text-2xl font-semibold">
                {isStatsLoading ? '—' : formatCurrency(stats?.averageOrderValue ?? 0)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 text-sm">
            <div>
              <span className="text-gray-500">Email:</span> <span className="ml-1">{detail.email ?? '—'}</span>
            </div>
            <div>
              <span className="text-gray-500">Teléfono:</span> <span className="ml-1">{detail.phone ?? '—'}</span>
            </div>
            <div>
              <span className="text-gray-500">Ciudad:</span> <span className="ml-1">{detail.city ?? '—'}</span>
            </div>
            <div>
              <span className="text-gray-500">Provincia:</span> <span className="ml-1">{detail.province ?? '—'}</span>
            </div>
            <div>
              <span className="text-gray-500">Dirección:</span> <span className="ml-1">{detail.address ?? '—'}</span>
            </div>
            <div>
              <span className="text-gray-500">Código postal:</span> <span className="ml-1">{detail.postalCode ?? '—'}</span>
            </div>
            <div>
              <span className="text-gray-500">Tax ID:</span> <span className="ml-1">{detail.taxId ?? '—'}</span>
            </div>
            <div>
              <span className="text-gray-500">Nacimiento:</span>{' '}
              <span className="ml-1">{detail.birthDate ? formatDate(detail.birthDate) : '—'}</span>
            </div>
            <div>
              <span className="text-gray-500">Género:</span> <span className="ml-1">{detail.gender ?? '—'}</span>
            </div>
            <div>
              <span className="text-gray-500">Estado:</span>{' '}
              <span className="ml-1">{detail.isActive ? 'Activo' : 'Inactivo'}</span>
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-gray-700">Historial de compras</h3>
            {isCustomerLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded bg-gray-100" />
                ))}
              </div>
            ) : sales.length === 0 ? (
              <EmptyState text="Sin compras registradas" />
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-3 py-2 text-left">N° Venta</th>
                      <th className="px-3 py-2 text-left">Total</th>
                      <th className="px-3 py-2 text-left">Estado</th>
                      <th className="px-3 py-2 text-left">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sales.map((sale) => (
                      <tr key={sale.id}>
                        <td className="px-3 py-2 font-mono">{sale.saleNumber}</td>
                        <td className="px-3 py-2 font-medium">{formatCurrency(sale.total)}</td>
                        <td className="px-3 py-2">{sale.status}</td>
                        <td className="px-3 py-2 text-gray-500">{formatDate(sale.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t p-6">
          <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
            Cerrar
          </button>
          <button
            onClick={() => {
              onEdit(detail);
              onClose();
            }}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Editar
          </button>
        </div>
      </div>
    </div>
  );
}