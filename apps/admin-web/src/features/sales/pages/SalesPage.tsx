import { useState } from 'react';
import { useSales, useCancelSale } from '../hooks/useSales';
import { SalesTable } from '../components/SalesTable';
import { SaleFilters } from '../components/SaleFilters';
import { SaleDetailModal } from '../components/SaleDetailModal';
import type { SaleFilters as SaleFiltersType, SaleListItem } from '../types/sales.types';
import { toast } from 'sonner';

export default function SalesPage() {
  const [filters, setFilters] = useState<SaleFiltersType>({ page: 1, limit: 20 });
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const { data, isLoading } = useSales(filters);
  const cancelSale = useCancelSale();

  const handleCancel = (sale: SaleListItem) => {
    const reason = prompt('Motivo de cancelación:');
    if (!reason) return;

    cancelSale.mutate(
      { id: sale.id, reason },
      {
        onSuccess: () => toast.success('Venta cancelada'),
        onError: () => toast.error('Error al cancelar'),
      },
    );
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Ventas</h1>
      </div>

      <SaleFilters filters={filters} onChange={setFilters} />

      <SalesTable
        sales={data?.items ?? []}
        isLoading={isLoading}
        onView={(sale) => setSelectedSaleId(sale.id)}
        onCancel={handleCancel}
        pagination={{
          page: data?.page ?? filters.page ?? 1,
          totalPages: data?.totalPages ?? 1,
          onPageChange: (p) => setFilters((f) => ({ ...f, page: p })),
        }}
      />

      <SaleDetailModal
        saleId={selectedSaleId}
        isOpen={!!selectedSaleId}
        onClose={() => setSelectedSaleId(null)}
      />
    </div>
  );
}