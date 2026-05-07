export enum InventoryMovementType {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  RETURN = 'RETURN',
  ADJUSTMENT = 'ADJUSTMENT',
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
  INITIAL = 'INITIAL',
}

export type StockLevel = {
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
};

export type StockByStore = {
  total: number;
  byStore: {
    storeId: string;
    storeName: string;
    quantity: number;
  }[];
};

export type LowStockAlert = {
  inventoryId: string;
  variantId: string;
  sku: string;
  productName: string;
  storeName: string;
  quantity: number;
  minStock: number;
  deficit: number;
};

export type TransferResult = {
  source: { inventoryId: string; newQuantity: number };
  destination: { inventoryId: string; newQuantity: number };
  transferId: string;
};