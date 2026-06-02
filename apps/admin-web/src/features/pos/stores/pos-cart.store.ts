import { create } from 'zustand';

import type {
  AddToCartPayload,
  POSCartItem,
  POSCustomer,
} from '../types/pos.types';

interface POSCartStore {
  /**
   * DATA
   */
  items: POSCartItem[];

  customer: POSCustomer | null;

  /**
   * TOTALS
   */
  subtotal: number;

  discountTotal: number;

  total: number;

  itemCount: number;

  /**
   * ACTIONS
   */
  addItem: (payload: AddToCartPayload) => void;

  removeItem: (variantId: string) => void;

  updateQuantity: (
    variantId: string,
    quantity: number,
  ) => void;

  updatePrice: (
    variantId: string,
    price: number,
  ) => void;

  updateDiscount: (
    variantId: string,
    discount: number,
  ) => void;

  clearCart: () => void;

  setCustomer: (
    customer: POSCustomer | null,
  ) => void;
}

/**
 * HELPERS
 */
const calculateItem = (
  item: POSCartItem,
): POSCartItem => {
  const subtotal =
    item.quantity * item.unitPrice;

  const total =
    subtotal - item.discountAmount ;

  return {
    ...item,
    subtotal,
    total,
  };
};

const calculateTotals = (
  items: POSCartItem[],
) => {
  const subtotal = items.reduce(
    (acc, item) => acc + item.subtotal,
    0,
  );

  const discountTotal = items.reduce(
    (acc, item) => acc + item.discountAmount,
    0,
  );

  const total = items.reduce(
    (acc, item) => acc + item.total,
    0,
  );

  const itemCount = items.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );

  return {
    subtotal,
    discountTotal,
    total,
    itemCount,
  };
};

export const usePOSCartStore =
  create<POSCartStore>((set) => ({
    /**
     * INITIAL STATE
     */
    items: [],

    customer: null,

    subtotal: 0,

    discountTotal: 0,

    total: 0,

    itemCount: 0,

    /**
     * ADD ITEM
     */
    addItem: (payload) =>
      set((state) => {
        const existing = state.items.find(
          (item) =>
            item.variantId === payload.variantId,
        );

        let items: POSCartItem[];

        if (existing) {
          items = state.items.map((item) => {
            if (
              item.variantId !== payload.variantId
            ) {
              return item;
            }

            return calculateItem({
              ...item,
              quantity: item.quantity + payload.quantity,
            });
          });
        } else {
          items = [
            ...state.items,

            calculateItem({
              variantId: payload.variantId,

              productName:
                payload.productName,

              sku: payload.sku,

              quantity: payload.quantity,

              unitPrice:
                payload.unitPrice,

              discountAmount:
                payload.discountAmount ?? 0,

              subtotal: 0,

              total: 0,

              inventoryItem:
                payload.inventoryItem,
            }),
          ];
        }

        return {
          items,
          ...calculateTotals(items),
        };
      }),

    /**
     * REMOVE ITEM
     */
    removeItem: (variantId) =>
      set((state) => {
        const items = state.items.filter(
          (item) =>
            item.variantId !== variantId,
        );

        return {
          items,
          ...calculateTotals(items),
        };
      }),

    /**
     * UPDATE QUANTITY
     */
    updateQuantity: (
      variantId,
      quantity,
    ) =>
      set((state) => {
        if (quantity <= 0) {
          const items = state.items.filter(
            (item) =>
              item.variantId !== variantId,
          );

          return {
            items,
            ...calculateTotals(items),
          };
        }

        const items = state.items.map(
          (item) => {
            if (
              item.variantId !== variantId
            ) {
              return item;
            }

            return calculateItem({
              ...item,
              quantity,
            });
          },
        );

        return {
          items,
          ...calculateTotals(items),
        };
      }),

    /**
     * UPDATE PRICE
     */
    updatePrice: (
      variantId,
      price,
    ) =>
      set((state) => {
        const items = state.items.map(
          (item) => {
            if (
              item.variantId !== variantId
            ) {
              return item;
            }

            return calculateItem({
              ...item,
              unitPrice: price,
            });
          },
        );

        return {
          items,
          ...calculateTotals(items),
        };
      }),

    /**
     * UPDATE DISCOUNT
     */
    updateDiscount: (
      variantId,
      discount,
    ) =>
      set((state) => {
        const items = state.items.map(
          (item) => {
            if (
              item.variantId !== variantId
            ) {
              return item;
            }

            return calculateItem({
              ...item,
              discountAmount: discount,
            });
          },
        );

        return {
          items,
          ...calculateTotals(items),
        };
      }),

    /**
     * CUSTOMER
     */
    setCustomer: (customer) =>
      set({
        customer,
      }),

    /**
     * CLEAR
     */
    clearCart: () =>
      set({
        items: [],

        customer: null,

        subtotal: 0,

        discountTotal: 0,

        total: 0,

        itemCount: 0,
      }),
  }));