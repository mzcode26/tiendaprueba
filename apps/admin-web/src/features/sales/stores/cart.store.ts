import { create } from 'zustand';

export interface CartItem {
  variantId: string;
  productName: string;
  sku: string;
  size?: string;
  color?: string;
  price: number;
  quantity: number;
  discountAmount: number;
  subtotal: number;
}

interface CartStore {
  items: CartItem[];
  total: number;
  itemCount: number;
  customerId: string | null;
  addItem: (item: Omit<CartItem, 'quantity' | 'discountAmount' | 'subtotal'>) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  setCustomerId: (customerId: string | null) => void;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  total: 0,
  itemCount: 0,
  customerId: null,

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.variantId === item.variantId);

      let items: CartItem[];

      if (existing) {
        items = state.items.map((i) =>
          i.variantId === item.variantId
            ? {
                ...i,
                quantity: i.quantity + 1,
                subtotal: (i.quantity + 1) * i.price - i.discountAmount,
              }
            : i,
        );
      } else {
        items = [
          ...state.items,
          {
            ...item,
            quantity: 1,
            discountAmount: 0,
            subtotal: item.price,
          },
        ];
      }

      const total = items.reduce((sum, i) => sum + i.subtotal, 0);
      const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

      return { items, total, itemCount };
    }),

  removeItem: (variantId) =>
    set((state) => {
      const items = state.items.filter((i) => i.variantId !== variantId);
      const total = items.reduce((sum, i) => sum + i.subtotal, 0);
      const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

      return { items, total, itemCount };
    }),

  updateQuantity: (variantId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        const items = state.items.filter((i) => i.variantId !== variantId);
        const total = items.reduce((sum, i) => sum + i.subtotal, 0);
        const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
        return { items, total, itemCount };
      }

      const items = state.items.map((i) =>
        i.variantId === variantId
          ? {
              ...i,
              quantity,
              subtotal: quantity * i.price - i.discountAmount,
            }
          : i,
      );

      const total = items.reduce((sum, i) => sum + i.subtotal, 0);
      const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

      return { items, total, itemCount };
    }),

  clearCart: () => ({ items: [], total: 0, itemCount: 0, customerId: null }),

  setCustomerId: (customerId) => set({ customerId }),

  getTotal: () => get().total,
}));