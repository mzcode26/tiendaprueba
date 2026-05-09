export interface Inventory {
  id: string;
  tenantId: string;
  storeId: string;
  store?: { id: string; name: string };
  productVariantId: string;
  productVariant?: {
    id: string;
    sku: string;
    size?: string;
    color?: string;
    product?: { id: string; name: string; imageUrl?: string };
  };
  quantity: number;
  lowStockThreshold: number;
  updatedAt: string;
}

export interface InventoryMovement {
  id: string;
  inventoryId: string;
  type: 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'LOSS' | 'RETURN';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason?: string;
  createdAt: string;
  user?: { firstName: string; lastName: string };
}

export interface PaginatedInventory {
  data: Inventory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InventoryStats {
  lowStockCount: number;
  outOfStockCount: number;
  totalItems: number;
}