import { useState } from 'react';
import { useSales, useCancelSale } from '../hooks/useSales';
import { SalesTable } from '../components/SalesTable';
import type { Sale, SaleFilters } from '../types/sales.types';
import { toast } from 'sonner';

export default function SalesPage() {
  const [filters, setFilters] = useState<SaleFilters>({ page: 1, limit: 20 });
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const { data, isLoading } = useSales(filters);
  const cancelSale = useCancelSale();

  const handleCancel = (sale: Sale) => {
    const reason = prompt('Motivo de cancelación:');
    if (!reason) return;
    cancelSale.mutate({ id: sale.id, reason }, {
      onSuccess: () => toast.success('Venta cancelada'),
      onError: () => toast.error('Error al cancelar'),
    });
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Ventas</h1>
      </div>
      <SalesTable
        sales={data?.data ?? []}
        isLoading={isLoading}
        onView={setSelectedSale}
        onCancel={handleCancel}
        pagination={{
          page: filters.page ?? 1,
          totalPages: data?.meta.totalPages ?? 1,
          onPageChange: (p) => setFilters(f => ({ ...f, page: p })),
        }}
      />

      {/* Detail Modal — placeholder hasta implementar SaleDetailModal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Venta {selectedSale.saleNumber}</h2>
              <button onClick={() => setSelectedSale(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <p className="text-sm text-gray-500">Total: {selectedSale.total}</p>
            <p className="text-sm text-gray-500">Estado: {selectedSale.status}</p>
          </div>
        </div>
      )}
    </div>
  );
}