import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import type { StockAlert } from '../types/dashboard.types';

interface Props {
  alerts?: StockAlert[];
  isLoading: boolean;
}

export function StockAlertsPanel({ alerts, isLoading }: Props) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-700">Alertas de stock</h3>
        <button onClick={() => navigate('/inventory')}
          className="text-sm text-blue-600 hover:underline">
          Ver inventario →
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ) : !alerts?.length ? (
        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
          <AlertTriangle className="w-8 h-8 mb-2 text-gray-300" />
          <p className="text-sm">Sin alertas de stock</p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map(alert => (
            <div key={`${alert.productId}-${alert.storeName}`}
              className="flex items-center justify-between p-2 rounded-lg bg-red-50 border border-red-100">
              <div>
                <p className="text-sm font-medium text-gray-800">{alert.productName}</p>
                <p className="text-xs text-gray-400">{alert.sku} · {alert.storeName}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${alert.currentStock === 0 ? 'text-red-600' : 'text-orange-500'}`}>
                  {alert.currentStock === 0 ? 'Sin stock' : `${alert.currentStock} uds`}
                </p>
                <p className="text-xs text-gray-400">mín: {alert.minStock}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}