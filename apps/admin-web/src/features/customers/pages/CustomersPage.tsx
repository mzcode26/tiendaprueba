import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '../hooks/useCustomers';
import { CustomersTable } from '../components/CustomersTable';
import { CustomerForm } from '../components/CustomerForm';
import { CustomerDetailModal } from '../components/CustomerDetailModal';
import type { Customer, CustomerFilters } from '../types/customer.types';
import type { CustomerFormData } from '../schemas/customer.schema';
import { toast } from 'sonner';

export default function CustomersPage() {
  const [filters, setFilters] = useState<CustomerFilters>({ page: 1, limit: 20 });
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const { data, isLoading } = useCustomers({ ...filters, search: search || undefined });
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  const handleSubmit = (formData: CustomerFormData) => {
    if (editingCustomer) {
      updateCustomer.mutate({ id: editingCustomer.id, data: formData }, {
        onSuccess: () => { toast.success('Cliente actualizado'); setShowForm(false); setEditingCustomer(null); },
        onError: () => toast.error('Error al actualizar'),
      });
    } else {
      createCustomer.mutate(formData, {
        onSuccess: () => { toast.success('Cliente creado'); setShowForm(false); },
        onError: () => toast.error('Error al crear cliente'),
      });
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
    setShowDetail(false);
  };

  const handleDelete = (customer: Customer) => {
    if (!confirm(`¿Eliminar a ${customer.firstName} ${customer.lastName}?`)) return;
    deleteCustomer.mutate(customer.id, {
      onSuccess: () => toast.success('Cliente eliminado'),
      onError: () => toast.error('Error al eliminar'),
    });
  };

  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetail(true);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <button onClick={() => { setEditingCustomer(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
          <UserPlus className="w-4 h-4" /> Nuevo Cliente
        </button>
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Buscar por nombre o email..."
        className="w-full max-w-sm border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <CustomersTable
        customers={data?.data ?? []}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        pagination={{
          page: filters.page ?? 1,
          totalPages: data?.meta.totalPages ?? 1,
          onPageChange: (p) => setFilters(f => ({ ...f, page: p })),
        }}
      />

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold mb-4">
              {editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h2>
            <CustomerForm
              defaultValues={editingCustomer ?? undefined}
              onSubmit={handleSubmit}
              isLoading={createCustomer.isPending || updateCustomer.isPending}
              onCancel={() => { setShowForm(false); setEditingCustomer(null); }}
            />
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <CustomerDetailModal
        customer={selectedCustomer}
        isOpen={showDetail}
        onClose={() => { setShowDetail(false); setSelectedCustomer(null); }}
        onEdit={handleEdit}
      />
    </div>
  );
}