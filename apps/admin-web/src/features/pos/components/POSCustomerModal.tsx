import { X } from 'lucide-react';
import { CustomerSelector } from '../components/POSCustomerSelector';
import type { POSCustomer } from '../types/pos.types';

type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
};

interface Props {
  isOpen: boolean;
  selectedCustomer: POSCustomer | null;
  onClose: () => void;
  onSelect: (customer: POSCustomer | null) => void;
}

export function POSCustomerModal({
  isOpen,
  selectedCustomer,
  onClose,
  onSelect,
}: Props) {
  if (!isOpen) return null;

  const handleSelect = (customer: Customer | null) => {
    onSelect(
      customer
        ? {
            id: customer.id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email ?? undefined,
            phone: customer.phone ?? undefined,
          }
        : null,
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Seleccionar cliente</h2>
            <p className="text-sm text-gray-500">Busca y asigna un cliente a la venta</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <CustomerSelector
            selectedCustomer={selectedCustomer}
            onSelect={handleSelect}
          />
        </div>
      </div>
    </div>
  );
}