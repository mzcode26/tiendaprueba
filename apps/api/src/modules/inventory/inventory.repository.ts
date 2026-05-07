import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PrismaClient } from '@prisma/client';
import { InventoryMovementType } from './types/inventory.type';

@Injectable()
export class InventoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, filters: {
    page?: number;
    limit?: number;
    storeId?: string;
    variantId?: string;
    productId?: string;
    lowStock?: boolean;
  }) {
    const where: any = {
      tenantId,
      deletedAt: null,
    };

    if (filters.storeId) {
      where.storeId = filters.storeId;
    }

    if (filters.variantId) {
      where.variantId = filters.variantId;
    }

    if (filters.productId) {
      where.variant = {
        productId: filters.productId,
      };
    }

    if (filters.lowStock) {
      where.quantity = {
        lte: this.prisma.inventory.fields.minStock,
      };
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;

    const [total, data] = await Promise.all([
      this.prisma.inventory.count({ where }),
      this.prisma.inventory.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          variant: {
            include: {
              product: { select: { id: true, name: true, slug: true } },
              attributes: {
                include: {
                  attributeValue: { select: { value: true } },
                },
              },
            },
          },
          store: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { data, total };
  }

  async findByVariantAndStore(variantId: string, storeId: string, tenantId: string) {
    return this.prisma.inventory.findFirst({
      where: {
        variantId,
        storeId,
        tenantId,
        deletedAt: null,
      },
      include: {
        variant: true,
        store: true,
      },
    });
  }

  async findOrCreateInventory(variantId: string, storeId: string, tenantId: string) {
    let inventory = await this.findByVariantAndStore(variantId, storeId, tenantId);
    if (!inventory) {
      inventory = await this.prisma.inventory.create({
        data: {
          tenantId,
          variantId,
          storeId,
          quantity: 0,
          reservedQuantity: 0,
          minStock: 0,
        },
        include: {
          variant: true,
          store: true,
        },
      });
    }
    return inventory;
  }

  async getStockLevel(variantId: string, storeId: string, tenantId: string) {
    const inventory = await this.findByVariantAndStore(variantId, storeId, tenantId);
    if (!inventory) {
      return { quantity: 0, reservedQuantity: 0, availableQuantity: 0 };
    }
    return {
      quantity: inventory.quantity,
      reservedQuantity: inventory.reservedQuantity,
      availableQuantity: inventory.quantity - inventory.reservedQuantity,
    };
  }

  async getTotalStockByVariant(variantId: string, tenantId: string) {
    const inventories = await this.prisma.inventory.findMany({
      where: {
        variantId,
        tenantId,
        deletedAt: null,
      },
      include: {
        store: { select: { id: true, name: true } },
      },
    });

    const total = inventories.reduce((sum: number, inv: any) => sum + inv.quantity, 0);
    const byStore = inventories.map((inv: any) => ({
      storeId: inv.storeId,
      storeName: inv.store.name,
      quantity: inv.quantity,
    }));

    return { total, byStore };
  }

  async adjustStock(
    inventoryId: string,
    tenantId: string,
    data: {
      quantity: number;
      type: InventoryMovementType;
      reason?: string;
      referenceId?: string;
      referenceType?: string;
      userId?: string;
    },
  ) {
    return this.prisma.$transaction(async (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => {
      const inventory = await tx.inventory.findUnique({
        where: { id: inventoryId },
      });

      if (!inventory) {
        throw new Error('Inventory not found');
      }

      const newQuantity = inventory.quantity + data.quantity;
      if (newQuantity < 0) {
        throw new Error('Insufficient stock');
      }

      const updatedInventory = await tx.inventory.update({
        where: { id: inventoryId },
        data: { quantity: newQuantity },
        include: {
          variant: {
            include: {
              product: { select: { id: true, name: true } },
            },
          },
          store: { select: { id: true, name: true } },
        },
      });

      const movement = await tx.inventoryMovement.create({
        data: {
          tenantId,
          inventoryId,
          type: data.type,
          quantity: Math.abs(data.quantity),
          previousQuantity: inventory.quantity,
          newQuantity,
          reason: data.reason,
          referenceId: data.referenceId,
          referenceType: data.referenceType,
          userId: data.userId,
        },
      });

      return { inventory: updatedInventory, movement };
    });
  }

  async transferStock(
    tenantId: string,
    data: {
      variantId: string;
      sourceStoreId: string;
      destinationStoreId: string;
      quantity: number;
      reason?: string;
      userId?: string;
    },
  ) {
    const transferId = `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return this.prisma.$transaction(async (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => {
      // Find or create source inventory
      let sourceInventory = await tx.inventory.findFirst({
        where: {
          variantId: data.variantId,
          storeId: data.sourceStoreId,
          tenantId,
          deletedAt: null,
        },
      });

      if (!sourceInventory) {
        sourceInventory = await tx.inventory.create({
          data: {
            tenantId,
            variantId: data.variantId,
            storeId: data.sourceStoreId,
            quantity: 0,
            reservedQuantity: 0,
            minStock: 0,
          },
        });
      }

      if (sourceInventory.quantity < data.quantity) {
        throw new Error('Insufficient stock in source store');
      }

      // Find or create destination inventory
      let destInventory = await tx.inventory.findFirst({
        where: {
          variantId: data.variantId,
          storeId: data.destinationStoreId,
          tenantId,
          deletedAt: null,
        },
      });

      if (!destInventory) {
        destInventory = await tx.inventory.create({
          data: {
            tenantId,
            variantId: data.variantId,
            storeId: data.destinationStoreId,
            quantity: 0,
            reservedQuantity: 0,
            minStock: 0,
          },
        });
      }

      // Update source
      const newSourceQuantity = sourceInventory.quantity - data.quantity;
      await tx.inventory.update({
        where: { id: sourceInventory.id },
        data: { quantity: newSourceQuantity },
      });

      // Update destination
      const newDestQuantity = destInventory.quantity + data.quantity;
      await tx.inventory.update({
        where: { id: destInventory.id },
        data: { quantity: newDestQuantity },
      });

      // Create movements
      await tx.inventoryMovement.create({
        data: {
          tenantId,
          inventoryId: sourceInventory.id,
          type: InventoryMovementType.TRANSFER_OUT,
          quantity: data.quantity,
          previousQuantity: sourceInventory.quantity,
          newQuantity: newSourceQuantity,
          reason: data.reason,
          referenceId: transferId,
          referenceType: 'transfer',
          userId: data.userId,
        },
      });

      await tx.inventoryMovement.create({
        data: {
          tenantId,
          inventoryId: destInventory.id,
          type: InventoryMovementType.TRANSFER_IN,
          quantity: data.quantity,
          previousQuantity: destInventory.quantity,
          newQuantity: newDestQuantity,
          reason: data.reason,
          referenceId: transferId,
          referenceType: 'transfer',
          userId: data.userId,
        },
      });

      return {
        source: { inventoryId: sourceInventory.id, newQuantity: newSourceQuantity },
        destination: { inventoryId: destInventory.id, newQuantity: newDestQuantity },
        transferId,
      };
    });
  }

  async findMovements(tenantId: string, filters: {
    page?: number;
    limit?: number;
    inventoryId?: string;
    variantId?: string;
    storeId?: string;
    type?: InventoryMovementType;
    startDate?: string;
    endDate?: string;
    userId?: string;
  }) {
    const where: any = {
      tenantId,
      deletedAt: null,
    };

    if (filters.inventoryId) {
      where.inventoryId = filters.inventoryId;
    }

    if (filters.variantId) {
      where.inventory = {
        variantId: filters.variantId,
      };
    }

    if (filters.storeId) {
      where.inventory = {
        ...where.inventory,
        storeId: filters.storeId,
      };
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;

    const [total, data] = await Promise.all([
      this.prisma.inventoryMovement.count({ where }),
      this.prisma.inventoryMovement.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          inventory: {
            include: {
              variant: {
                include: {
                  product: { select: { id: true, name: true } },
                },
              },
              store: { select: { id: true, name: true } },
            },
          },
          user: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { data, total };
  }

  async getLowStockAlerts(tenantId: string, storeId?: string) {
    const where: any = {
      tenantId,
      deletedAt: null,
      quantity: {
        lte: this.prisma.inventory.fields.minStock,
      },
    };

    if (storeId) {
      where.storeId = storeId;
    }

    const alerts = await this.prisma.inventory.findMany({
      where,
      include: {
        variant: {
          include: {
            product: { select: { id: true, name: true } },
          },
        },
        store: { select: { id: true, name: true } },
      },
    });

    return alerts.map((alert: any) => ({
      inventoryId: alert.id,
      variantId: alert.variantId,
      sku: alert.variant.sku,
      productName: alert.variant.product.name,
      storeName: alert.store.name,
      quantity: alert.quantity,
      minStock: alert.minStock,
      deficit: alert.minStock - alert.quantity,
    }));
  }

  async updateMinMaxStock(inventoryId: string, _tenantId: string, data: { minStock: number; maxStock?: number }) {
    return this.prisma.inventory.update({
      where: { id: inventoryId },
      data: {
        minStock: data.minStock,
        maxStock: data.maxStock,
      },
    });
  }
}