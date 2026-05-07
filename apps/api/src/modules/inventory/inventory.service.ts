import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InventoryMovementType } from './types/inventory.type';
import { InventoryRepository } from './inventory.repository';
import { AdjustStockDto, TransferStockDto, InventoryFiltersDto, MovementFiltersDto } from './dto/adjust-stock.dto';

@Injectable()
export class InventoryService {
  constructor(
    private readonly repository: InventoryRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getInventory(tenantId: string, filters: InventoryFiltersDto) {
    return this.repository.findAll(tenantId, filters);
  }

  async getStockByVariantAndStore(variantId: string, storeId: string, tenantId: string) {
    const inventory = await this.repository.findByVariantAndStore(variantId, storeId, tenantId);
    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }
    return inventory;
  }

  async adjustStock(tenantId: string, userId: string, data: AdjustStockDto) {
    // Validate store belongs to tenant
    const store = await this.prisma.store.findFirst({
      where: { id: data.storeId, tenantId, deletedAt: null },
    });
    if (!store) {
      throw new BadRequestException('Store not found');
    }

    // Validate variant belongs to tenant
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: data.variantId, tenantId, deletedAt: null },
    });
    if (!variant) {
      throw new BadRequestException('Product variant not found');
    }

    // Validate manual adjustment types
    const allowedTypes = [InventoryMovementType.PURCHASE, InventoryMovementType.ADJUSTMENT, InventoryMovementType.RETURN];
    if (!allowedTypes.includes(data.type)) {
      throw new BadRequestException('Invalid movement type for manual adjustment');
    }

    const inventory = await this.repository.findOrCreateInventory(data.variantId, data.storeId, tenantId);
    return this.repository.adjustStock(inventory.id, tenantId, {
      quantity: data.quantity,
      type: data.type,
      reason: data.reason,
      userId,
    });
  }

  async transferStock(tenantId: string, userId: string, data: TransferStockDto) {
    // Validate stores belong to tenant
    const [sourceStore, destStore] = await Promise.all([
      this.prisma.store.findFirst({
        where: { id: data.sourceStoreId, tenantId, deletedAt: null },
      }),
      this.prisma.store.findFirst({
        where: { id: data.destinationStoreId, tenantId, deletedAt: null },
      }),
    ]);

    if (!sourceStore || !destStore) {
      throw new BadRequestException('Store not found');
    }

    if (data.sourceStoreId === data.destinationStoreId) {
      throw new BadRequestException('Source and destination stores must be different');
    }

    // Validate variant belongs to tenant
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: data.variantId, tenantId, deletedAt: null },
    });
    if (!variant) {
      throw new BadRequestException('Product variant not found');
    }

    return this.repository.transferStock(tenantId, {
      ...data,
      userId,
    });
  }

  async getMovements(tenantId: string, filters: MovementFiltersDto) {
    return this.repository.findMovements(tenantId, filters);
  }

  async getLowStockAlerts(tenantId: string, storeId?: string) {
    return this.repository.getLowStockAlerts(tenantId, storeId);
  }

  async setInitialStock(tenantId: string, userId: string, data: { variantId: string; storeId: string; quantity: number }) {
    // Validate store and variant
    const [store, variant] = await Promise.all([
      this.prisma.store.findFirst({
        where: { id: data.storeId, tenantId, deletedAt: null },
      }),
      this.prisma.productVariant.findFirst({
        where: { id: data.variantId, tenantId, deletedAt: null },
      }),
    ]);

    if (!store || !variant) {
      throw new BadRequestException('Store or variant not found');
    }

    const inventory = await this.repository.findOrCreateInventory(data.variantId, data.storeId, tenantId);

    // Check if already has movements
    const existingMovements = await this.prisma.inventoryMovement.count({
      where: { inventoryId: inventory.id },
    });

    if (existingMovements > 0) {
      throw new BadRequestException('Stock already initialized for this variant and store');
    }

    return this.repository.adjustStock(inventory.id, tenantId, {
      quantity: data.quantity,
      type: InventoryMovementType.INITIAL,
      userId,
    });
  }

  async updateStockLimits(tenantId: string, inventoryId: string, data: { minStock: number; maxStock?: number }) {
    // Validate inventory belongs to tenant
    const inventory = await this.prisma.inventory.findFirst({
      where: { id: inventoryId, tenantId, deletedAt: null },
    });
    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    return this.repository.updateMinMaxStock(inventoryId, tenantId, data);
  }
}