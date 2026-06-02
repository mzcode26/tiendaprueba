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
    <div className="bg-white border rounded-lg p-3 sm:p-4 text-gray-900">
      <div className="flex justify-between items-center mb-3 sm:mb-4 gap-2">
        <h3 className="font-semibold text-gray-700 text-sm md:text-base">Ventas recientes</h3>
        <button onClick={() => navigate('/sales')}
          className="text-xs sm:text-sm text-blue-600 hover:underline whitespace-nowrap">
          Ver todas →
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ) : !sales?.length ? (
        <p className="text-gray-400 text-xs md:text-sm text-center py-6 md:py-8">Sin ventas recientes</p>
      ) : (
        <div className="overflow-x-auto rounded">
          <table className="w-full text-xs md:text-sm">
            <thead className="text-xs text-gray-500 uppercase border-b bg-gray-50">
              <tr>
                <th className="pb-2 px-2 sm:px-4 text-left">N° Venta</th>
                <th className="pb-2 px-2 sm:px-4 text-left hidden md:table-cell">Cliente</th>
                <th className="pb-2 px-2 sm:px-4 text-right">Total</th>
                <th className="pb-2 px-2 sm:px-4 text-left">Estado</th>
                <th className="pb-2 px-2 sm:px-4 text-left hidden lg:table-cell">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sales.map(sale => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="py-2 px-2 sm:px-4 font-mono text-xs">{sale.saleNumber}</td>
                  <td className="py-2 px-2 sm:px-4 text-gray-600 text-xs hidden md:table-cell truncate">{sale.customerName ?? 'Consumidor'}</td>
                  <td className="py-2 px-2 sm:px-4 text-right font-medium text-xs md:text-sm">{formatCurrency(sale.total)}</td>
                  <td className="py-2 px-2 sm:px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap inline-block ${statusStyles[sale.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {statusLabels[sale.status] ?? sale.status}
                    </span>
                  </td>
                  <td className="py-2 px-2 sm:px-4 text-gray-400 text-xs hidden lg:table-cell">{formatDate(sale.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}