import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CreditCard, Banknote, Smartphone } from 'lucide-react';
import { useCartStore } from '../../stores/cart.store';
import { useCreateSale } from '../../hooks/useSales';
import { toast } from 'sonner';

interface Props {
  isOpen: boolean;
  customerId: string | null;
  storeId: string;
  onClose: () => void;
  onSuccess: () => void;
}

type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER';

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { value: 'CASH', label: 'Efectivo', icon: <Banknote className="h-5 w-5" /> },
  { value: 'CARD', label: 'Tarjeta', icon: <CreditCard className="h-5 w-5" /> },
  { value: 'TRANSFER', label: 'Transferencia', icon: <Smartphone className="h-5 w-5" /> },
];

export function PaymentModal({ isOpen, customerId, storeId, onClose, onSuccess }: Props) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [cashReceived, setCashReceived] = useState('');
  const { items, getTotal, clearCart } = useCartStore();
  const createSale = useCreateSale();
  const total = getTotal();
  const change = paymentMethod === 'CASH' ? Math.max(0, Number(cashReceived) - total) : 0;

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      await createSale.mutateAsync({
        storeId,
        customerId: customerId ?? undefined,
        items: items.map(i => ({ productVariantId: i.variantId, quantity: i.quantity, unitPrice: i.unitPrice })),
        payments: [{ method: paymentMethod, amount: total }],
      });
      clearCart();
      toast.success('Venta registrada exitosamente');
      onSuccess();
    } catch {
      toast.error('Error al procesar la venta');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">Confirmar Pago</h2>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>{items.length} producto(s)</span>
            <span>{items.reduce((a, i) => a + i.quantity, 0)} unidades</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-indigo-600">${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Método de pago</p>
          <div className="grid grid-cols-3 gap-2">
            {PAYMENT_METHODS.map(m => (
              <button
                key={m.value}
                onClick={() => setPaymentMethod(m.value)}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-colors ${
                  paymentMethod === m.value
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                {m.icon}
                <span className="text-xs font-medium">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {paymentMethod === 'CASH' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Efectivo recibido</label>
            <input
              type="number"
              value={cashReceived}
              onChange={e => setCashReceived(e.target.value)}
              placeholder={`Mínimo $${total.toFixed(2)}`}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {Number(cashReceived) >= total && (
              <p className="text-sm text-green-600 mt-1 font-medium">
                Vuelto: ${change.toFixed(2)}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border rounded-lg text-sm hover:bg-gray-50">
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={createSale.isPending || (paymentMethod === 'CASH' && Number(cashReceived) < total)}
            className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {createSale.isPending ? 'Procesando...' : 'Confirmar Venta'}
          </button>
        </div>
      </div>
    </div>
  );
}