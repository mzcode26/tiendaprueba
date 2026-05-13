import type { InventoryItem } from '../types/inventory.types';

export function getInventoryProductName(
  item: InventoryItem,
  productNameByVariantId?: Map<string, string>,
) {
  return (
    item.variant?.product?.name ??
    item.variant?.productName ??
    productNameByVariantId?.get(item.variantId) ??
    'Producto sin nombre'
  );
}

export function getInventoryVariantName(item: InventoryItem) {
  return (
    item.variant?.variantName ??
    item.variant?.name ??
    item.variant?.sku ??
    item.variant?.barcode ??
    'Sin variante'
  );
}

export function getInventoryStoreName(item: InventoryItem) {
  return item.store?.name ?? 'Sucursal desconocida';
}