import type { TopCustomer } from '../types/reports.types';
import { formatCurrency } from '../../../lib/utils';

interface Props {
  data?: TopCustomer[];
  isLoading: boolean;
}

export function TopCustomersTable({ data, isLoading }: Props) {
  if (isLoading) return <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />;

  return (
    <div className="bg-white border rounded-xl p-4">
      <h3 className="font-semibold text-gray-700 mb-4">Top Clientes</h3>
      {!data?.length ? (
        <p className="text-gray-400 text-sm text-center py-8">Sin datos</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="text-xs text-gray-500 uppercase border-b">
            <tr>
              <th className="pb-2 text-left">#</th>
              <th className="pb-2 text-left">Cliente</th>
              <th className="pb-2 text-right">Compras</th>
              <th className="pb-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((c, i) => (
              <tr key={c.customerId} className="hover:bg-gray-50">
                <td className="py-2 text-gray-400">{i + 1}</td>
                <td className="py-2 font-medium">{c.customerName}</td>
                <td className="py-2 text-right">{c.salesCount}</td>
                <td className="py-2 text-right font-medium">{formatCurrency(c.totalSpent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}