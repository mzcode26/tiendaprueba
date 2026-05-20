import { formatDate } from '../../../lib/utils';
import type { CustomerListItem } from '../types/customer.types';

interface Props {
  customers: CustomerListItem[];
  isLoading: boolean;
  onEdit: (customer: CustomerListItem) => void;
  onDelete: (customer: CustomerListItem) => void;
  onView: (customer: CustomerListItem) => void;
  pagination: { page: number; totalPages: number; onPageChange: (p: number) => void };
}

export function CustomersTable({ customers, isLoading, onEdit, onDelete, onView, pagination }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (!customers.length) {
    return <div className="text-center py-12 text-gray-500">No hay clientes registrados</div>;
  }

  const totalPages = Math.max(1, pagination.totalPages);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              {['Nombre', 'Email', 'Teléfono', 'Ciudad', 'Ventas', 'Estado', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">
                  {customer.firstName} {customer.lastName}
                  <div className="text-xs text-gray-400">{formatDate(customer.createdAt)}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">{customer.email ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{customer.phone ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{customer.city ?? '—'}</td>
                <td className="px-4 py-3">{customer._count?.sales ?? 0}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      customer.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {customer.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => onView(customer)} className="text-blue-600 hover:underline text-xs">
                      Ver
                    </button>
                    <button onClick={() => onEdit(customer)} className="text-gray-600 hover:underline text-xs">
                      Editar
                    </button>
                    <button onClick={() => onDelete(customer)} className="text-red-600 hover:underline text-xs">
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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