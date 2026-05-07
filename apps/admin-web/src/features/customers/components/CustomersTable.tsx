import type { Customer } from '../types/customer.types';
import { formatCurrency, formatDate } from '../../../lib/utils';

interface Props {
  customers: Customer[];
  isLoading: boolean;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onView: (customer: Customer) => void;
  pagination: { page: number; totalPages: number; onPageChange: (p: number) => void };
}

export function CustomersTable({ customers, isLoading, onEdit, onDelete, onView, pagination }: Props) {
  if (isLoading) return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
      ))}
    </div>
  );

  if (!customers.length) return (
    <div className="text-center py-12 text-gray-500">No hay clientes registrados</div>
  );

  return (
    <div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
          <tr>
            {['Nombre', 'Email', 'Teléfono', 'Ciudad', 'Compras', 'Total gastado', 'Estado', ''].map(h => (
              <th key={h} className="px-4 py-3 text-left">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {customers.map(customer => (
            <tr key={customer.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium">
                {customer.firstName} {customer.lastName}
                <div className="text-xs text-gray-400">{formatDate(customer.createdAt)}</div>
              </td>
              <td className="px-4 py-3 text-gray-600">{customer.email ?? '—'}</td>
              <td className="px-4 py-3 text-gray-600">{customer.phone ?? '—'}</td>
              <td className="px-4 py-3 text-gray-600">{customer.city ?? '—'}</td>
              <td className="px-4 py-3">{customer.salesCount}</td>
              <td className="px-4 py-3 font-medium">{formatCurrency(customer.totalSpent)}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  customer.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {customer.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button onClick={() => onView(customer)}
                    className="text-blue-600 hover:underline text-xs">Ver</button>
                  <button onClick={() => onEdit(customer)}
                    className="text-gray-600 hover:underline text-xs">Editar</button>
                  <button onClick={() => onDelete(customer)}
                    className="text-red-600 hover:underline text-xs">Eliminar</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-end gap-2 mt-4">
        {Array.from({ length: pagination.totalPages }).map((_, i) => (
          <button key={i}
            onClick={() => pagination.onPageChange(i + 1)}
            className={`px-3 py-1 rounded text-sm ${
              pagination.page === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-100'
            }`}>
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}