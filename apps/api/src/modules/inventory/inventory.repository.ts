import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InventoryMovementType } from '@prisma/client';

@Injectable()
export class InventoryRepository {
  constructor(private prisma: PrismaService) {}

  async findByVariantAndStore(variantId: string, storeId: string, tenantId: string) {
    return this.prisma.inventory.findFirst({
      where: { variantId, storeId, tenantId },
      include: {
        variant: {
          include: {
            product: { select: { id: true, name: true, slug: true } },
            attributes: {
              include: { attribute: true, attributeValue: true },
            },
          },
        },
        store: true,
      },
    });
  }

  async findByStore(storeId: string, tenantId: string, lowStockOnly = false) {
    if (lowStockOnly) {
      const allLow = await this.findLowStock(tenantId);
      return allLow.filter((r) => r.storeId === storeId);
    }

    return this.prisma.inventory.findMany({
      where: { storeId, tenantId },
      include: {
        variant: {
          include: {
            product: { select: { id: true, name: true, slug: true, images: { take: 1 } } },
            attributes: {
              include: { attribute: true, attributeValue: true },
            },
          },
        },
        store: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findLowStock(tenantId: string) {
    return this.prisma.$queryRaw<
      Array<{
        id: string;
        variantId: string;
        storeId: string;
        quantity: number;
        minStock: number;
        sku: string;
        product_name: string;
        store_name: string;
      }>
    >`
      SELECT i.id, i.variant_id as "variantId", i.store_id as "storeId",
             i.quantity, i.min_stock as "minStock",
             v.sku, p.name as product_name, s.name as store_name
      FROM inventory i
      JOIN product_variants v ON v.id = i.variant_id
      JOIN products p ON p.id = v.product_id
      JOIN stores s ON s.id = i.store_id
      WHERE i.tenant_id = ${tenantId}
        AND i.min_stock IS NOT NULL
        AND i.quantity <= i.min_stock
        AND p.deleted_at IS NULL
        AND v.deleted_at IS NULL
      ORDER BY (i.quantity - i.min_stock) ASC
    `;
  }

  async upsertInventory(
    variantId: string,
    storeId: string,
    tenantId: string,
    quantity: number,
    minStock?: number,
    maxStock?: number,
  ) {
    return this.prisma.inventory.upsert({
      where: { variantId_storeId: { variantId, storeId } },
      create: { variantId, storeId, tenantId, quantity, minStock, maxStock },
      update: {
        quantity,
        ...(minStock !== undefined && { minStock }),
        ...(maxStock !== undefined && { maxStock }),
      },
    });
  }

  async incrementStock(
    variantId: string,
    storeId: string,
    tenantId: string,
    delta: number,
  ) {
    return this.prisma.inventory.upsert({
      where: { variantId_storeId: { variantId, storeId } },
      create: { variantId, storeId, tenantId, quantity: Math.max(0, delta) },
      update: { quantity: { increment: delta } },
    });
  }

  async updateSettings(
    variantId: string,
    storeId: string,
    minStock?: number,
    maxStock?: number,
  ) {
    return this.prisma.inventory.update({
      where: { variantId_storeId: { variantId, storeId } },
      data: {
        ...(minStock !== undefined && { minStock }),
        ...(maxStock !== undefined && { maxStock }),
      },
    });
  }

  async createMovement(params: {
    tenantId: string;
    inventoryId: string;           // ← ahora recibe inventoryId directamente
    type: InventoryMovementType;
    quantity: number;
    previousQuantity: number;
    newQuantity: number;
    reason?: string;
    referenceId?: string;
    userId?: string;
  }) {
    return this.prisma.inventoryMovement.create({
      data: {
        tenantId: params.tenantId,
        inventory: { connect: { id: params.inventoryId } },  // ← connect en lugar de campo directo
        type: params.type,
        quantity: params.quantity,
        previousQuantity: params.previousQuantity,
        newQuantity: params.newQuantity,
        reason: params.reason,
        referenceId: params.referenceId,
        userId: params.userId,
      },
    });
  }

  async findMovements(
    tenantId: string,
    filters: {
      variantId?: string;
      storeId?: string;
      type?: InventoryMovementType;
      page?: number;
      limit?: number;
    },
  ) {
    const { variantId, storeId, type, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { tenantId };

    // Filtramos por variantId/storeId navegando a través de la relación inventory
    if (variantId || storeId) {
      where['inventory'] = {
        ...(variantId && { variantId }),
        ...(storeId && { storeId }),
      };
    }
    if (type) where['type'] = type;

    const [items, total] = await Promise.all([
      this.prisma.inventoryMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          inventory: {                          // ← navegamos a través de inventory
            include: {
              variant: {
                include: {
                  product: { select: { id: true, name: true } },
                },
              },
              store: true,
            },
          },
        },
      }),
      this.prisma.inventoryMovement.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}