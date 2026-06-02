import { useEffect, useMemo, useState } from 'react';
import { Search, Store as StoreIcon } from 'lucide-react';

import { useStores } from '../../settings/hooks/useSettings';
import { useInventoryByStore } from '../../inventory/hooks/useInventory';

import { InventoryProductsTable } from '../../../shared/InventoryProductsTable';
import { StoreSelector } from '../../../shared/StoreSelector';

import { POSCart } from '../components/POSCart';
import { POSItemModal } from '../components/POSItemModal';
import { POSPaymentModal } from '../components/POSPaymentModal';
import { POSCustomerModal } from '../components/POSCustomerModal';

import { usePOSCartStore } from '../stores/pos-cart.store';

import type { InventoryItem } from '../../inventory/types/inventory.types';
import type { AddToCartPayload } from '../types/pos.types';
import type { Store as StoreType } from '../../settings/types/settings.types';

export default function POSPage() {
  /**
   * STORE
   */
  const [selectedStoreId, setSelectedStoreId] =
    useState('');

  /**
   * SEARCH
   */
  const [searchTerm, setSearchTerm] =
    useState('');

  /**
   * PRODUCT MODAL
   */
  const [selectedItem, setSelectedItem] =
    useState<InventoryItem | null>(null);

  const [itemModalOpen, setItemModalOpen] =
    useState(false);

  /**
   * PAYMENT
   */
  const [paymentOpen, setPaymentOpen] =
    useState(false);

  /**
   * CUSTOMER MODAL
   */
  const [customerModalOpen, setCustomerModalOpen] =
    useState(false);

  /**
   * CART
   */
  const {
    addItem,
    clearCart,
    customer,
    setCustomer,
  } = usePOSCartStore();

  /**
   * STORES
   */
  const {
    data: storesData,
    isLoading: storesLoading,
  } = useStores(false);

  const activeStores =
    storesData?.filter(
      (store: StoreType) =>
        store.isActive,
    ) ?? [];

  /**
   * AUTOSELECT STORE
   */
  useEffect(() => {
    if (
      !selectedStoreId &&
      activeStores.length > 0
    ) {
      setSelectedStoreId(
        activeStores[0].id,
      );
    }
  }, [
    selectedStoreId,
    activeStores,
  ]);

  /**
   * RESET SEARCH
   */
  useEffect(() => {
    setSearchTerm('');
  }, [selectedStoreId]);

  /**
   * INVENTORY
   */
  const {
    data: inventoryItems = [],
    isLoading: inventoryLoading,
    isFetching: inventoryFetching,
  } = useInventoryByStore(
    selectedStoreId,
    Boolean(selectedStoreId),
  );

  /**
   * FILTERED ITEMS
   */
  const filteredInventoryItems =
    useMemo(() => {
      const term =
        searchTerm
          .trim()
          .toLowerCase();

      if (!term) {
        return inventoryItems;
      }

      return inventoryItems.filter(
        (
          item: InventoryItem,
        ) => {
          const productName =
            item.variant?.product
              ?.name ??
            item.variant
              ?.productName ??
            item.variant
              ?.variantName ??
            '';

          const sku =
            item.variant?.sku ??
            '';

          return (
            productName
              .toLowerCase()
              .includes(term) ||
            sku
              .toLowerCase()
              .includes(term)
          );
        },
      );
    }, [
      inventoryItems,
      searchTerm,
    ]);

  /**
   * OPEN ITEM MODAL
   */
  const handleAddToSale = (
    item: InventoryItem,
  ) => {
    setSelectedItem(item);

    setItemModalOpen(true);
  };

  /**
   * CLOSE ITEM MODAL
   */
  const handleCloseItemModal =
    () => {
      setSelectedItem(null);

      setItemModalOpen(false);
    };

  /**
   * CONFIRM ITEM
   */
  const handleConfirmItem = (
    payload: AddToCartPayload,
  ) => {
    addItem(payload);
  };

  /**
   * CHECKOUT
   */
  const handleCheckout = () => {
    if (!selectedStoreId) {
      return;
    }

    setPaymentOpen(true);
  };

  /**
   * CUSTOMER
   */
  const handleSelectCustomer =
    () => {
      setCustomerModalOpen(true);
    };

  const handleRemoveCustomer =
    () => {
      setCustomer(null);
    };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-100">
      {/* LEFT PANEL */}
      <div className="flex flex-1 flex-col border-r bg-white">
        {/* HEADER */}
        <div className="border-b bg-white p-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <StoreIcon className="h-6 w-6 text-blue-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Punto de Venta
              </h1>

              <p className="text-sm text-gray-500">
                Selecciona productos y registra ventas
              </p>
            </div>
          </div>

          {/* STORE SELECTOR */}
          <div className="mb-4">
            <StoreSelector
              value={
                selectedStoreId
              }
              onChange={
                setSelectedStoreId
              }
              stores={
                activeStores
              }
              loading={
                storesLoading
              }
            />
          </div>

          {/* SEARCH */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value,
                )
              }
              placeholder="Buscar producto o SKU..."
              className="w-full rounded-xl border py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* PRODUCTS */}
        <div className="flex-1 overflow-hidden p-4">
          <InventoryProductsTable
            items={
              filteredInventoryItems
            }
            isLoading={
              inventoryLoading ||
              inventoryFetching
            }
            mode="pos"
            onAddToSale={
              handleAddToSale
            }
          />
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-[420px] border-l bg-white">
        <POSCart
          onCheckout={
            handleCheckout
          }
          onClear={() => {
            clearCart();
          }}
          onSelectCustomer={
            handleSelectCustomer
          }
          onRemoveCustomer={
            handleRemoveCustomer
          }
        />
      </div>

      {/* ITEM MODAL */}
      <POSItemModal
        isOpen={itemModalOpen}
        item={selectedItem}
        onClose={
          handleCloseItemModal
        }
        onConfirm={
          handleConfirmItem
        }
      />

      {/* PAYMENT */}
      <POSPaymentModal
        isOpen={paymentOpen}
        storeId={
          selectedStoreId
        }
        onClose={() =>
          setPaymentOpen(false)
        }
        onSuccess={() =>
          setPaymentOpen(false)
        }
      />

      {/* CUSTOMER SELECTOR */}
    <POSCustomerModal
      isOpen={customerModalOpen}
      selectedCustomer={customer}
      onClose={() => setCustomerModalOpen(false)}
      onSelect={(selectedCustomer) => {
        setCustomer(selectedCustomer);
      }}
    />
    </div>
  );
}