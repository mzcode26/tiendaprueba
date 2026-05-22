import { useMemo, useState } from 'react';
import { Banknote, CreditCard, ArrowRightLeft, X } from 'lucide-react';
import { toast } from 'sonner';

import { formatCurrency } from '../../../lib/utils';
import { useCreateSale } from '../../sales/hooks/useSales';
import { usePOSCartStore } from '../stores/pos-cart.store';

import type { SalePaymentMethod } from '../../sales/types/sales.types';

interface Props {
  isOpen: boolean;
  storeId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const PAYMENT_METHODS: Array<{
  value: SalePaymentMethod;
  label: string;
  icon: React.ReactNode;
}> = [
  {
    value: 'CASH',
    label: 'Efectivo',
    icon: <Banknote className="h-4 w-4" />,
  },
  {
    value: 'CARD_DEBIT',
    label: 'Tarjeta débito',
    icon: <CreditCard className="h-4 w-4" />,
  },
  {
    value: 'CARD_CREDIT',
    label: 'Tarjeta crédito',
    icon: <CreditCard className="h-4 w-4" />,
  },
  {
    value: 'TRANSFER',
    label: 'Transferencia',
    icon: <ArrowRightLeft className="h-4 w-4" />,
  },
  {
    value: 'QR',
    label: 'QR',
    icon: <ArrowRightLeft className="h-4 w-4" />,
  },
  {
    value: 'OTHER',
    label: 'Otro',
    icon: <ArrowRightLeft className="h-4 w-4" />,
  },
];

export function POSPaymentModal({
  isOpen,
  storeId,
  onClose,
  onSuccess,
}: Props) {
  const {
    items,
    customer,
    total,
    clearCart,
    setCustomer,
  } = usePOSCartStore();

  const createSale = useCreateSale();

  const [paymentMethod, setPaymentMethod] = useState<SalePaymentMethod>('CASH');
  const [cashReceived, setCashReceived] = useState('');
  const [reference, setReference] = useState('');

  const receivedAmount = Number(cashReceived || 0);

  const change = useMemo(() => {
    return Math.max(0, receivedAmount - total);
  }, [receivedAmount, total]);

  const resetForm = () => {
    setPaymentMethod('CASH');
    setCashReceived('');
    setReference('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleConfirm = async () => {
    if (!storeId) {
      toast.error('Selecciona una sucursal');
      return;
    }

    if (items.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    if (paymentMethod === 'CASH' && receivedAmount < total) {
      toast.error('El efectivo recibido es insuficiente');
      return;
    }

    try {
      await createSale.mutateAsync({
        storeId,
        customerId: customer?.id ?? undefined,
        items: items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountAmount: item.discountAmount ?? 0,
        })),
        payments: [
          {
            method: paymentMethod,
            amount: total,
            reference: reference.trim() || undefined,
          },
        ],
      });

      toast.success('Venta registrada correctamente');
      clearCart();
      setCustomer(null);
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error(error);
      toast.error('No se pudo registrar la venta');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Cobrar venta</h2>
            <p className="text-sm text-gray-500">Selecciona el método de pago</p>
          </div>

          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="rounded-xl border bg-gray-50 p-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-gray-600">
                <span>Items</span>
                <span>{items.length}</span>
              </div>

              <div className="flex items-center justify-between text-gray-600">
                <span>Total unidades</span>
                <span>{items.reduce((acc, item) => acc + item.quantity, 0)}</span>
              </div>

              <div className="flex items-center justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span className="text-blue-600">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Método de pago</p>

            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((method) => {
                const active = paymentMethod === method.value;

                return (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setPaymentMethod(method.value)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-sm transition ${
                      active
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {method.icon}
                    <span>{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {paymentMethod === 'CASH' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Efectivo recibido
              </label>

              <input
                type="number"
                min={0}
                step="0.01"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={formatCurrency(total)}
              />

              {receivedAmount >= total && (
                <p className="mt-1 text-sm text-green-600">
                  Vuelto: {formatCurrency(change)}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Referencia / comprobante
            </label>

            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Opcional"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
          <button
            onClick={handleClose}
            className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirm}
            disabled={createSale.isPending}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {createSale.isPending ? 'Procesando...' : 'Confirmar venta'}
          </button>
        </div>
      </div>
    </div>
  );
}