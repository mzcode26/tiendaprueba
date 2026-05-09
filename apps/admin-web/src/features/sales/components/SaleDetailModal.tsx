import type { Sale } from '../types/sales.types';

interface Props {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  COMPLETED: { label: 'Completada', className: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelada', className: 'bg-red-100 text-red-800' },
  REFUNDED: { label: 'Reembolsada', className: 'bg-yellow-100 text-yellow-800' },
  PENDING: { label: 'Pendiente', className: 'bg-gray-100 text-gray-800' },
};

const PAYMENT_LABELS: Record<string, string> = {
  CASH: 'Efectivo', CARD: 'Tarjeta', TRANSFER: 'Transferencia',
};

export function SaleDetailModal({ sale, isOpen, onClose }: Props) {
  if (!isOpen || !sale) return null;
  const status = STATUS_LABELS[sale.status] ?? { label: sale.status, className: 'bg-gray-100 text-gray-800' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-semibold">Venta #{sale.saleNumber ?? sale.id.slice(0, 8)}</h2>
            <p className="text-sm text-gray-500">{new Date(sale.createdAt).toLocaleString('es-AR')}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-2 py-1 text-xs rounded-full font-medium ${status.className}`}>
              {status.label}
            </span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
          </div>
        </div>

        {sale.customer && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-xs text-gray-500 mb-1">Cliente</p>
            <p className="text-sm font-medium">{sale.customer.firstName} {sale.customer.lastName}</p>
            {sale.customer.email && <p className="text-xs text-gray-500">{sale.customer.email}</p>}
          </div>
        )}

        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 uppercase mb-2">Productos</p>
          <div className="space-y-2">
            {sale.items?.map((item, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{item.productName ?? item.productVariant?.product?.name}</p>
                  <p className="text-xs text-gray-500">
                    SKU: {item.sku ?? item.productVariant?.sku} · x{item.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold">${(item.unitPrice * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {sale.payments && sale.payments.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 uppercase mb-2">Pagos</p>
            {sale.payments.map((p, i) => (
              <div key={i} className="flex justify-between text-sm py-1">
                <span className="text-gray-600">{PAYMENT_LABELS[p.method] ?? p.method}</span>
                <span className="font-medium">${p.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="border-t pt-3 flex justify-between text-base font-bold">
          <span>Total</span>
          <span className="text-indigo-600">${sale.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}