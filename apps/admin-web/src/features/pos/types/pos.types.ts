import type { InventoryItem } from '../../inventory/types/inventory.types';

export interface POSCartItem {
  variantId: string;

  productName: string;

  sku?: string;

  quantity: number;

  unitPrice: number;

  discountAmount: number;

  subtotal: number;

  total: number;

  inventoryItem?: InventoryItem;
}

export interface POSCustomer {
  id: string;

  firstName: string;

  lastName: string;

  email?: string;

  phone?: string;
}

export interface AddToCartPayload {
  variantId: string;

  productName: string;

  sku?: string;

  quantity: number;

  unitPrice: number;

  discountAmount?: number;

  inventoryItem?: InventoryItem;
}