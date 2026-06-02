import type { TopProduct } from '../types/reports.types';
import { formatCurrency } from '../../../lib/utils';

interface Props {
  data?: TopProduct[];
  isLoading: boolean;
}

export function TopProductsTable({ data, isLoading }: Props) {
  if (isLoading) return <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />;

  return (
    <div className="bg-white border rounded-xl p-4">
      <h3 className="font-semibold text-gray-700 mb-4">Top Productos</h3>
      {!data?.length ? (
        <p className="text-gray-400 text-sm text-center py-8">Sin datos</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="text-xs text-gray-500 uppercase border-b">
            <tr>
              <th className="pb-2 text-left">#</th>
              <th className="pb-2 text-left">Producto</th>
              <th className="pb-2 text-left">SKU</th>
              <th className="pb-2 text-right">Unidades</th>
              <th className="pb-2 text-right">Ingresos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((product, index) => (
              <tr key={product.productId} className="hover:bg-gray-50">
                <td className="py-2 text-gray-400">{index + 1}</td>
                <td className="py-2">
                  <div className="font-medium">{product.productName}</div>
                </td>
                <td className="py-2 text-gray-500">{product.variantSku}</td>
                <td className="py-2 text-right">{product.totalQuantity}</td>
                <td className="py-2 text-right font-medium">{formatCurrency(product.totalRevenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
