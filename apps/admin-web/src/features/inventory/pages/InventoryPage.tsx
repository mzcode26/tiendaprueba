import { useEffect, useMemo, useState } from 'react';

import { useStores } from '../../settings/hooks/useSettings';
import { useProducts } from '../../products/hooks/useProducts';

import {
  useAdjustStock,
  useInitialStock,
  useInventoryByStore,
  useInventoryItem,
  useInventoryMovements,
  useLowStock,
  useTransferStock,
  useUpdateInventorySettings,
} from '../hooks/useInventory';

import { InventoryFilters } from '../components/InventoryFilters';
import { InventoryTable } from '../components/InventoryTable';
import { LowStockBanner } from '../components/LowStockBanner';
import { AdjustStockModal } from '../components/AdjustStockModal';
import { TransferStockModal } from '../components/TransferStockModal';
import { MovementsModal } from '../components/MovementsModal';
import { InitialStockModal } from '../components/InitialStockModal';

import type {
  InventoryItem,
  InventoryMovement,
} from '../types/inventory.types';

import type {
  InventoryFiltersFormValues,
  AdjustStockFormValues,
  TransferStockFormValues,
  InventorySettingsFormValues,
} from '../schemas/inventory.schema';

export default function InventoryPage() {
  const { data: stores = [], isLoading: storesLoading } = useStores(false);

    const { data: productsResponse, isLoading: productsLoading } = useProducts({
    isActive: true,
    page: 1,
    limit: 200,
  });

    const products = productsResponse?.items ?? [];

  const activeStores = useMemo(
    () => stores.filter((store) => store.isActive),
    [stores],
  );

  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [filters, setFilters] = useState<InventoryFiltersFormValues>({
    storeId: undefined,
    search: '',
    lowStock: false,
    outOfStock: false,
    page: 1,
    limit: 10,
  });

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [movementsModalOpen, setMovementsModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [initialStockModalOpen, setInitialStockModalOpen] = useState(false);

  useEffect(() => {
    if (!selectedStoreId && activeStores.length > 0) {
      setSelectedStoreId(activeStores[0].id);
    }
  }, [activeStores, selectedStoreId]);

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      storeId: selectedStoreId || undefined,
    }));
  }, [selectedStoreId]);

  const {
    data: inventoryItems = [],
    isLoading: inventoryLoading,
    isFetching: inventoryFetching,
  } = useInventoryByStore(selectedStoreId, Boolean(selectedStoreId));

  const { data: lowStockItems = [], isLoading: lowStockLoading } =
    useLowStock(Boolean(selectedStoreId));

  const { data: selectedItemDetail } = useInventoryItem(
    selectedItem?.storeId ?? '',
    selectedItem?.variantId ?? '',
    movementsModalOpen && Boolean(selectedItem),
  );

  const {
    data: movementResponse,
    isLoading: movementsLoading,
  } = useInventoryMovements(
    selectedItem
      ? {
          storeId: selectedItem.storeId,
          variantId: selectedItem.variantId,
          page: 1,
          limit: 50,
        }
      : undefined,
    movementsModalOpen && Boolean(selectedItem),
  );

  const adjustStockMutation = useAdjustStock();
  const initialStockMutation = useInitialStock();
  const transferStockMutation = useTransferStock();
  const updateInventorySettingsMutation = useUpdateInventorySettings();

  const filteredItems = useMemo(() => {
    let result = [...inventoryItems];

    if (filters.search?.trim()) {
      const q = filters.search.trim().toLowerCase();

      result = result.filter((item) => {
        const productName =
          item.variant?.productName ??
          item.variant?.product?.name ??
          '';

        const variantName =
          item.variant?.variantName ??
          item.variant?.name ??
          '';

        const sku = item.variant?.sku ?? '';
        const barcode = item.variant?.barcode ?? '';
        const storeName = item.store?.name ?? '';

        return [productName, variantName, sku, barcode, storeName]
          .join(' ')
          .toLowerCase()
          .includes(q);
      });
    }

    if (filters.lowStock) {
      result = result.filter(
        (item) => item.quantity > 0 && item.quantity <= item.minStock,
      );
    }

    if (filters.outOfStock) {
      result = result.filter((item) => item.quantity <= 0);
    }

    return result;
  }, [inventoryItems, filters]);

  const lowStockFiltered = useMemo(() => {
    if (!filters.search?.trim()) return lowStockItems;

    const q = filters.search.trim().toLowerCase();

    return lowStockItems.filter((item) => {
      const productName = item.productName ?? '';
      const sku = item.sku ?? '';
      const storeName = item.storeName ?? '';

      return [productName, sku, storeName]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [lowStockItems, filters.search]);

  const selectedMovements: InventoryMovement[] =
    movementResponse?.items ?? [];

  const selectedStore = activeStores.find(
    (store) => store.id === selectedStoreId,
  );

  const handleFiltersChange = (values: InventoryFiltersFormValues) => {
    setFilters((prev) => ({
      ...prev,
      ...values,
      storeId: selectedStoreId || undefined,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      storeId: selectedStoreId || undefined,
      search: '',
      lowStock: false,
      outOfStock: false,
      page: 1,
      limit: 10,
    });
  };

  const openAdjustModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setAdjustModalOpen(true);
  };

  const openTransferModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setTransferModalOpen(true);
  };

  const openMovementsModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setMovementsModalOpen(true);
  };

  const openSettingsModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setSettingsModalOpen(true);
  };

  const openInitialStockModal = () => {
    setInitialStockModalOpen(true);
  };

  const closeItemModals = () => {
    setAdjustModalOpen(false);
    setTransferModalOpen(false);
    setMovementsModalOpen(false);
    setSettingsModalOpen(false);
    setSelectedItem(null);
  };

  const closeInitialStockModal = () => {
    setInitialStockModalOpen(false);
  };

  const handleAdjustSubmit = async (values: AdjustStockFormValues) => {
    await adjustStockMutation.mutateAsync(values);
    closeItemModals();
  };

  const handleInitialStockSubmit = async (values: AdjustStockFormValues) => {
    await initialStockMutation.mutateAsync({
      storeId: values.storeId,
      variantId: values.variantId,
      quantity: values.quantity,
      reason: values.reason ?? 'Carga de stock inicial',
      reference: 'STOCK_INICIAL',
    });

    closeInitialStockModal();
  };

  const handleTransferSubmit = async (values: TransferStockFormValues) => {
    await transferStockMutation.mutateAsync(values);
    closeItemModals();
  };

  const handleSettingsSubmit = async (values: InventorySettingsFormValues) => {
    await updateInventorySettingsMutation.mutateAsync(values);
    closeItemModals();
  };

  const productNameByVariantId = useMemo(() => {
  const map = new Map<string, string>();

  for (const product of products) {
    for (const variant of product.variants ?? []) {
      map.set(variant.id, product.name);
    }
  }

  return map;
}, [products]);

  return (
    <div className="space-y-6 m-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Inventario
          </h1>
          <p className="text-sm text-gray-500">
            Control de stock por sucursal, variantes, movimientos y niveles mínimos.
          </p>
        </div>

        <button
          type="button"
          onClick={openInitialStockModal}
          disabled={!selectedStoreId || productsLoading}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cargar stock inicial
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <label className="mb-1 block text-sm font-medium text-gray-800">
          Sucursal
        </label>

        <select
          value={selectedStoreId}
          onChange={(e) => setSelectedStoreId(e.target.value)}
          disabled={storesLoading}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 text-gray-700"
        >
          <option value="">Seleccionar sucursal</option>
          {activeStores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Sucursal seleccionada</p>
          <p className="mt-2 text-lg font-semibold text-gray-900">
            {selectedStore?.name ?? 'Sin sucursal'}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Ítems visibles</p>
          <p className="mt-2 text-lg font-semibold text-gray-900">
            {filteredItems.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Bajo stock</p>
          <p className="mt-2 text-lg font-semibold text-yellow-600">
            {lowStockFiltered.length}
          </p>
        </div>
      </div>

      <LowStockBanner
        items={lowStockFiltered}
        isLoading={lowStockLoading}
      />

      <InventoryFilters
        values={filters}
        onChange={handleFiltersChange}
        onReset={handleResetFilters}
        isLoading={storesLoading}
      />

      <InventoryTable
        items={filteredItems}
        isLoading={inventoryLoading || inventoryFetching}
        onAdjust={openAdjustModal}
        onTransfer={openTransferModal}
        onMovements={openMovementsModal}
        onSettings={openSettingsModal}
        productNameByVariantId={productNameByVariantId}
      />

      <InitialStockModal
        open={initialStockModalOpen}
        storeId={selectedStoreId}
        storeName={selectedStore?.name}
        products={products}
        isLoading={initialStockMutation.isPending}
        onClose={closeInitialStockModal}
        onSubmit={handleInitialStockSubmit}
      />

      <AdjustStockModal
        open={adjustModalOpen}
        item={selectedItem}
        isLoading={adjustStockMutation.isPending}
        onClose={closeItemModals}
        onSubmit={handleAdjustSubmit}
      />

      <TransferStockModal
        open={transferModalOpen}
        item={selectedItem}
        stores={stores}
        isLoading={transferStockMutation.isPending}
        onClose={closeItemModals}
        onSubmit={handleTransferSubmit}
      />

      <MovementsModal
        open={movementsModalOpen}
        item={selectedItemDetail ?? selectedItem}
        movements={selectedMovements}
        isLoading={movementsLoading}
        onClose={closeItemModals}
      />

      {settingsModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Configurar stock mínimo
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedItem.variant?.productName ??
                    selectedItem.variant?.product?.name ??
                    'Producto'}{' '}
                  —{' '}
                  {selectedItem.variant?.variantName ??
                    selectedItem.variant?.name ??
                    selectedItem.variant?.sku ??
                    'Sin variante'}{' '}
                  — {selectedItem.store?.name ?? 'Sucursal'}
                </p>
              </div>

              <button
                type="button"
                onClick={closeItemModals}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cerrar
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();

                const formData = new FormData(e.currentTarget);
                const minStock = Number(formData.get('minStock') ?? 0);

                handleSettingsSubmit({
                  storeId: selectedItem.storeId,
                  variantId: selectedItem.variantId,
                  minStock,
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Stock mínimo
                </label>
                <input
                  name="minStock"
                  type="number"
                  min={0}
                  defaultValue={selectedItem.minStock}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeItemModals}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={updateInventorySettingsMutation.isPending}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updateInventorySettingsMutation.isPending
                    ? 'Guardando...'
                    : 'Guardar mínimo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}