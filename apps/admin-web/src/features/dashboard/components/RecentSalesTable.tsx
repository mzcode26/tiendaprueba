import { useNavigate } from 'react-router-dom';
import type { RecentSale } from '../types/dashboard.types';
import { formatCurrency, formatDate } from '../../../lib/utils';

interface Props {
  sales?: RecentSale[];
  isLoading: boolean;
}

const statusStyles: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-700',
  PENDING:   'bg-yellow-100 text-yellow-700',
  CANCELLED: 'bg-red-100 text-red-600',
};

const statusLabels: Record<string, string> = {
  COMPLETED: 'Completada',
  PENDING:   'Pendiente',
  CANCELLED: 'Cancelada',
};

export function RecentSalesTable({ sales, isLoading }: Props) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-700">Ventas recientes</h3>
        <button onClick={() => navigate('/sales')}
          className="text-sm text-blue-600 hover:underline">
          Ver todas →
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ) : !sales?.length ? (
        <p className="text-gray-400 text-sm text-center py-8">Sin ventas recientes</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="text-xs text-gray-500 uppercase border-b">
            <tr>
              <th className="pb-2 text-left">N° Venta</th>
              <th className="pb-2 text-left">Cliente</th>
              <th className="pb-2 text-right">Total</th>
              <th className="pb-2 text-left">Estado</th>
              <th className="pb-2 text-left">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sales.map(sale => (
              <tr key={sale.id} className="hover:bg-gray-50">
                <td className="py-2 font-mono text-xs">{sale.saleNumber}</td>
                <td className="py-2 text-gray-600">{sale.customerName ?? 'Consumidor final'}</td>
                <td className="py-2 text-right font-medium">{formatCurrency(sale.total)}</td>
                <td className="py-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[sale.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {statusLabels[sale.status] ?? sale.status}
                  </span>
                </td>
                <td className="py-2 text-gray-400 text-xs">{formatDate(sale.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}