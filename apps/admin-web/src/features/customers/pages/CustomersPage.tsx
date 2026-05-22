import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '../hooks/useCustomers';
import { CustomersTable } from '../components/CustomersTable';
import { CustomerForm } from '../components/CustomerForm';
import { CustomerDetailModal } from '../components/CustomerDetailModal';
import type { CustomerFilters, CustomerFormDefaults, CustomerListItem } from '../types/customer.types';
import type { CustomerFormData } from '../schemas/customer.schema';
import { toast } from 'sonner';

export default function CustomersPage() {
  const [filters, setFilters] = useState<CustomerFilters>({ page: 1, limit: 20 });
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerListItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerFormDefaults | null>(null);

  const { data, isLoading } = useCustomers({ ...filters, search: search || undefined });
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();
const buildCreatePayload = (formData: CustomerFormData) => {
  const payload = {
    firstName: formData.firstName.trim(),
    lastName: formData.lastName.trim(),
    email: formData.email?.trim() || undefined,
    phone: formData.phone?.trim() || undefined,
    address: formData.address?.trim() || undefined,
    city: formData.city?.trim() || undefined,
    province: formData.province?.trim() || undefined,
    postalCode: formData.postalCode?.trim() || undefined,
    taxId: formData.taxId?.trim() || undefined,
    birthDate: formData.birthDate?.trim() || undefined,
    gender: formData.gender || undefined,
    notes: formData.notes?.trim() || undefined,
  };

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== '')
  );
};

const buildUpdatePayload = (formData: CustomerFormData) => ({
  ...buildCreatePayload(formData),
  isActive: formData.isActive,
});

const handleSubmit = (formData: CustomerFormData) => {
  if (editingCustomer?.id) {
    updateCustomer.mutate(
      { id: editingCustomer.id, data: buildUpdatePayload(formData) as any },
      {
        onSuccess: () => {
          toast.success('Cliente actualizado');
          setShowForm(false);
          setEditingCustomer(null);
        },
        onError: () => toast.error('Error al actualizar'),
      },
    );
    return;
  }

  createCustomer.mutate(buildCreatePayload(formData) as any, {
    onSuccess: () => {
      toast.success('Cliente creado');
      setShowForm(false);
    },
    onError: () => toast.error('Error al crear cliente'),
  });
};

  const handleEdit = (customer: CustomerFormDefaults) => {
    setEditingCustomer(customer);
    setShowForm(true);
    setShowDetail(false);
  };

  const handleDelete = (customer: CustomerListItem) => {
    if (!confirm(`¿Eliminar a ${customer.firstName} ${customer.lastName}?`)) return;
    deleteCustomer.mutate(customer.id, {
      onSuccess: () => toast.success('Cliente eliminado'),
      onError: () => toast.error('Error al eliminar'),
    });
  };

  const handleView = (customer: CustomerListItem) => {
    setSelectedCustomer(customer);
    setShowDetail(true);
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <button
          onClick={() => {
            setEditingCustomer(null);
            setShowForm(true);
          }}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          <UserPlus className="h-4 w-4" /> Nuevo Cliente
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setFilters((f) => ({ ...f, page: 1 }));
        }}
        placeholder="Buscar por nombre, email, teléfono o CUIT..."
        className="w-full max-w-md rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <CustomersTable
        customers={data?.items ?? []}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        pagination={{
          page: data?.page ?? filters.page ?? 1,
          totalPages: data?.totalPages ?? 1,
          onPageChange: (page) => setFilters((f) => ({ ...f, page })),
        }}
      />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-bold">{editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
            <CustomerForm
              defaultValues={editingCustomer ?? undefined}
              onSubmit={handleSubmit}
              isLoading={createCustomer.isPending || updateCustomer.isPending}
              onCancel={() => {
                setShowForm(false);
                setEditingCustomer(null);
              }}
            />
          </div>
        </div>
      )}

      <CustomerDetailModal
        customer={selectedCustomer}
        isOpen={showDetail}
        onClose={() => {
          setShowDetail(false);
          setSelectedCustomer(null);
        }}
        onEdit={handleEdit}
      />
    </div>
  );
}