import { AlertTriangle } from 'lucide-react';

interface LowStockAlertProps {
  products: Array<{
    id: string;
    name: string;
    stock: number;
    minStock: number;
  }>;
}

export const LowStockAlert = ({ products }: LowStockAlertProps) => {
  if (products.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center mb-4">
        <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Productos con Stock Bajo</h3>
      </div>
      <div className="space-y-3">
        {products.map((product) => (
          <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{product.name}</p>
              <p className="text-sm text-gray-600">
                Stock actual: {product.stock} | Mínimo: {product.minStock}
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-orange-600">
                {product.stock === 0 ? 'Sin stock' : 'Stock bajo'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};