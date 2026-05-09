import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InventoryRepository } from './inventory.repository';
import { AdjustStockDto, AdjustmentType } from './dto/adjust-stock.dto';
import { TransferStockDto } from './dto/transfer-stock.dto';
import { UpdateInventorySettingsDto } from './dto/update-inventory-settings.dto';
import { InventoryMovementType } from '@prisma/client';  // ← nombre correcto

@Injectable()
export class InventoryService {
  constructor(
    private inventoryRepository: InventoryRepository,
    private prisma: PrismaService,
  ) {}

  async getByStore(storeId: string, tenantId: string) {
    return this.inventoryRepository.findByStore(storeId, tenantId);
  }

  async getByVariantAndStore(variantId: string, storeId: string, tenantId: string) {
    const inventory = await this.inventoryRepository.findByVariantAndStore(
      variantId,
      storeId,
      tenantId,
    );
    if (!inventory) throw new NotFoundException('Inventory record not found');
    return inventory;
  }

  async getLowStock(tenantId: string) {
    return this.inventoryRepository.findLowStock(tenantId);
  }

  async adjustStock(tenantId: string, userId: string, dto: AdjustStockDto) {
    const current = await this.inventoryRepository.findByVariantAndStore(
      dto.variantId,
      dto.storeId,
      tenantId,
    );

    const previousQuantity = current?.quantity ?? 0;
    let newQuantity: number;

    switch (dto.type) {
      case AdjustmentType.ADD:
        newQuantity = previousQuantity + dto.quantity;
        break;
      case AdjustmentType.REMOVE:
        newQuantity = previousQuantity - dto.quantity;
        if (newQuantity < 0) throw new BadRequestException('Insufficient stock');
        break;
      case AdjustmentType.SET:
        if (dto.quantity < 0) throw new BadRequestException('Stock cannot be negative');
        newQuantity = dto.quantity;
        break;
      default:
        throw new BadRequestException('Invalid adjustment type');
    }

    const movementTypeMap: Record<AdjustmentType, InventoryMovementType> = {
      [AdjustmentType.ADD]: InventoryMovementType.ADJUSTMENT_IN,
      [AdjustmentType.REMOVE]: InventoryMovementType.ADJUSTMENT_OUT,
      [AdjustmentType.SET]: InventoryMovementType.ADJUSTMENT_IN,
    };

    return this.prisma.$transaction(async () => {
      // Upsert inventory y obtener el id resultante
      const inventory = await this.inventoryRepository.upsertInventory(
        dto.variantId,
        dto.storeId,
        tenantId,
        newQuantity,
      );

      // Ahora pasamos inventoryId en lugar de variantId/storeId
      await this.inventoryRepository.createMovement({
        tenantId,
        inventoryId: inventory.id,
        type: movementTypeMap[dto.type],
        quantity: Math.abs(newQuantity - previousQuantity),
        previousQuantity,
        newQuantity,
        reason: dto.reason,
        referenceId: dto.reference,
        userId,
      });

      return inventory;
    });
  }

  async transferStock(tenantId: string, userId: string, dto: TransferStockDto) {
    const source = await this.inventoryRepository.findByVariantAndStore(
      dto.variantId,
      dto.fromStoreId,
      tenantId,
    );

    if (!source || source.quantity < dto.quantity) {
      throw new BadRequestException('Insufficient stock in source store');
    }

    return this.prisma.$transaction(async () => {
      // Decrement source
      const updatedSource = await this.inventoryRepository.incrementStock(
        dto.variantId,
        dto.fromStoreId,
        tenantId,
        -dto.quantity,
      );

      // Increment destination
      const updatedDest = await this.inventoryRepository.incrementStock(
        dto.variantId,
        dto.toStoreId,
        tenantId,
        dto.quantity,
      );

      // Movement OUT — usamos id del inventory source
      await this.inventoryRepository.createMovement({
        tenantId,
        inventoryId: updatedSource.id,
        type: InventoryMovementType.TRANSFER_OUT,
        quantity: dto.quantity,
        previousQuantity: source.quantity,
        newQuantity: source.quantity - dto.quantity,
        reason: dto.notes,
        userId,
      });

      // Movement IN — usamos id del inventory destino
      const destPreviousQty = (updatedDest.quantity) - dto.quantity; // antes del increment
      await this.inventoryRepository.createMovement({
        tenantId,
        inventoryId: updatedDest.id,
        type: InventoryMovementType.TRANSFER_IN,
        quantity: dto.quantity,
        previousQuantity: destPreviousQty,
        newQuantity: updatedDest.quantity,
        reason: dto.notes,
        userId,
      });

      return { message: 'Transfer completed successfully' };
    });
  }

  async updateSettings(
    variantId: string,
    storeId: string,
    tenantId: string,
    dto: UpdateInventorySettingsDto,
  ) {
    const inventory = await this.inventoryRepository.findByVariantAndStore(
      variantId,
      storeId,
      tenantId,
    );
    if (!inventory) throw new NotFoundException('Inventory record not found');

    return this.inventoryRepository.updateSettings(
      variantId,
      storeId,
      dto.minStock,
      dto.maxStock,
    );
  }

  async getMovements(
    tenantId: string,
    filters: {
      variantId?: string;
      storeId?: string;
      type?: InventoryMovementType;
      page?: number;
      limit?: number;
    },
  ) {
    return this.inventoryRepository.findMovements(tenantId, filters);
  }
}