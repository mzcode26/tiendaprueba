import { create } from 'zustand';
import type { CartItem, POSProduct } from '../types/sales.types';

interface CartStore {
  items: CartItem[];
  customerId?: string;
  storeId?: string;
  globalDiscount: number;
  subtotal: number;
  total: number;
  itemCount: number;
  addItem: (product: POSProduct) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, qty: number) => void;
  updateItemDiscount: (variantId: string, discount: number) => void;
  setCustomer: (customerId?: string) => void;
  setStore: (storeId: string) => void;
  setGlobalDiscount: (discount: number) => void;
  clearCart: () => void;
}

const calcSubtotal = (items: CartItem[]) =>
  items.reduce((acc, i) => acc + i.subtotal, 0);

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  customerId: undefined,
  storeId: undefined,
  globalDiscount: 0,
  subtotal: 0,
  total: 0,
  itemCount: 0,

  addItem: (product) => {
    const items = get().items;
    const existing = items.find(i => i.variantId === product.variantId);
    let updated: CartItem[];

    if (existing) {
      updated = items.map(i =>
        i.variantId === product.variantId
          ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.price * (1 - i.discount / 100) }
          : i
      );
    } else {
      updated = [...items, {
        variantId: product.variantId,
        sku: product.sku,
        productName: product.productName,
        size: product.size,
        color: product.color,
        price: product.price,
        quantity: 1,
        discount: 0,
        subtotal: product.price,
      }];
    }

    const subtotal = calcSubtotal(updated);
    const globalDiscount = get().globalDiscount;
    set({
      items: updated,
      subtotal,
      total: subtotal * (1 - globalDiscount / 100),
      itemCount: updated.reduce((acc, i) => acc + i.quantity, 0),
    });
  },

  removeItem: (variantId) => {
    const updated = get().items.filter(i => i.variantId !== variantId);
    const subtotal = calcSubtotal(updated);
    const globalDiscount = get().globalDiscount;
    set({
      items: updated,
      subtotal,
      total: subtotal * (1 - globalDiscount / 100),
      itemCount: updated.reduce((acc, i) => acc + i.quantity, 0),
    });
  },

  updateQuantity: (variantId, qty) => {
    if (qty < 1) return;
    const updated = get().items.map(i =>
      i.variantId === variantId
        ? { ...i, quantity: qty, subtotal: qty * i.price * (1 - i.discount / 100) }
        : i
    );
    const subtotal = calcSubtotal(updated);
    const globalDiscount = get().globalDiscount;
    set({
      items: updated,
      subtotal,
      total: subtotal * (1 - globalDiscount / 100),
      itemCount: updated.reduce((acc, i) => acc + i.quantity, 0),
    });
  },

  updateItemDiscount: (variantId, discount) => {
    const updated = get().items.map(i =>
      i.variantId === variantId
        ? { ...i, discount, subtotal: i.quantity * i.price * (1 - discount / 100) }
        : i
    );
    const subtotal = calcSubtotal(updated);
    const globalDiscount = get().globalDiscount;
    set({ items: updated, subtotal, total: subtotal * (1 - globalDiscount / 100) });
  },

  setCustomer: (customerId) => set({ customerId }),
  setStore: (storeId) => set({ storeId }),

  setGlobalDiscount: (discount) => {
    const subtotal = get().subtotal;
    set({ globalDiscount: discount, total: subtotal * (1 - discount / 100) });
  },

  clearCart: () => set({
    items: [],
    customerId: undefined,
    globalDiscount: 0,
    subtotal: 0,
    total: 0,
    itemCount: 0,
  }),
}));