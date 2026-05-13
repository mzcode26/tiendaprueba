export type InventoryMovementType =
  | 'PURCHASE'
  | 'SALE'
  | 'RETURN'
  | 'ADJUSTMENT'
  | 'ADJUSTMENT_IN'
  | 'ADJUSTMENT_OUT'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'INITIAL';

export type InventoryAdjustmentType = 'ADD' | 'REMOVE' | 'SET';

export interface InventoryStore {
  id: string;
  name: string;
  isActive?: boolean;
}

export interface InventoryProduct {
  id: string;
  name: string;
  code?: string | null;
}

export interface InventoryVariant {
  id: string;
  sku?: string | null;
  barcode?: string | null;
  name?: string | null;
  productId?: string | null;
  product?: InventoryProduct | null;

  // Compatibilidad con el frontend que ya veníamos armando
  productName?: string | null;
  variantName?: string | null;
  productCode?: string | null;
}

export interface InventoryItem {
  id: string;
  storeId: string;
  variantId: string;
  quantity: number;
  minStock: number;
  maxStock?: number | null;
  isLowStock?: boolean;

  store?: InventoryStore;
  variant?: InventoryVariant;

  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryMovement {
  id: string;
  tenantId?: string;
  inventoryId: string;
  storeId?: string;
  variantId?: string;

  type: InventoryMovementType;
  quantity: number;
  previousQuantity?: number | null;
  newQuantity?: number | null;

  reason?: string | null;
  referenceId?: string | null;
  userId?: string | null;

  createdAt: string;
  updatedAt?: string;

  store?: InventoryStore;
  variant?: InventoryVariant;
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
}

export interface StockLevel {
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
}

export interface StockByStore {
  total: number;
  byStore: {
    storeId: string;
    storeName: string;
    quantity: number;
  }[];
}

export interface LowStockAlert {
  inventoryId: string;
  variantId: string;
  sku: string;
  productName: string;
  storeName: string;
  quantity: number;
  minStock: number;
  deficit: number;
}

export interface TransferResult {
  source: { inventoryId: string; newQuantity: number };
  destination: { inventoryId: string; newQuantity: number };
  transferId: string;
}

export interface AdjustStockInput {
  storeId: string;
  variantId: string;
  type: InventoryAdjustmentType;
  quantity: number;
  reason?: string;
  reference?: string;
}

export interface TransferStockInput {
  fromStoreId: string;
  toStoreId: string;
  variantId: string;
  quantity: number;
  notes?: string;
}

export interface UpdateInventorySettingsInput {
  storeId: string;
  variantId: string;
  minStock: number;
  maxStock?: number | null;
}

export interface InventoryFilters {
  storeId?: string;
  search?: string;
  lowStock?: boolean;
  outOfStock?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}