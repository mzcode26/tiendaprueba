import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SalesRepository } from './sales.repository';
import { InventoryRepository } from '../inventory/inventory.repository';
import { CreateSaleDto } from './dto/create-sale.dto';
import { CancelSaleDto } from './dto/cancel-sale.dto';
import { CreateRefundDto } from './dto/create-refund.dto';
import { QuerySalesDto } from './dto/query-sales.dto';
import { InventoryMovementType } from '@prisma/client';

@Injectable()
export class SalesService {
  constructor(
    private salesRepository: SalesRepository,
    private inventoryRepository: InventoryRepository,
    private prisma: PrismaService,
  ) {}

  findAll(tenantId: string, query: QuerySalesDto) {
    return this.salesRepository.findAll(tenantId, query);
  }

  async findById(id: string, tenantId: string) {
    const sale = await this.salesRepository.findById(id, tenantId);
    if (!sale) throw new NotFoundException('Sale not found');
    return sale;
  }

  async create(tenantId: string, userId: string, dto: CreateSaleDto) {
    // Validate stock for all items
    for (const item of dto.items) {
      const inventory = await this.inventoryRepository.findByVariantAndStore(
        item.variantId,
        dto.storeId,
        tenantId,
      );
      if (!inventory || inventory.quantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for variant ${item.variantId}`,
        );
      }
    }

    // Validate payments sum
    const subtotal = dto.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity - (item.discount ?? 0),
      0,
    );
    const total = subtotal - (dto.discountAmount ?? 0) + (dto.taxAmount ?? 0);
    const paymentTotal = (dto.payments ?? []).reduce((sum, p) => sum + p.amount, 0);

    if (paymentTotal < total) {
      throw new BadRequestException(
        `Payment total (${paymentTotal}) is less than sale total (${total})`,
      );
    }

    const saleNumber = await this.salesRepository.generateSaleNumber(tenantId);

    return this.prisma.$transaction(async () => {
      const sale = await this.salesRepository.create(
        tenantId,
        userId,
        saleNumber,
        dto,
        subtotal,
        total,
      );

      // Decrement inventory for each item
      for (const item of dto.items) {
        const current = await this.inventoryRepository.findByVariantAndStore(
          item.variantId,
          dto.storeId,
          tenantId,
        );

        const updated = await this.inventoryRepository.incrementStock(
          item.variantId,
          dto.storeId,
          tenantId,
          -item.quantity,
        );

        await this.inventoryRepository.createMovement({
          tenantId,
          inventoryId: updated.id,
          type: InventoryMovementType.SALE,
          quantity: item.quantity,
          previousQuantity: current?.quantity ?? 0,
          newQuantity: (current?.quantity ?? 0) - item.quantity,
          referenceId: saleNumber,   // ← usamos saleNumber local, no sale.saleNumber
          userId,
        });
      }

      return sale;
    });
  }

  async cancel(id: string, tenantId: string, userId: string, dto: CancelSaleDto) {
    const sale = await this.findById(id, tenantId);

    if (sale.status !== 'COMPLETED' && sale.status !== 'PENDING') {
      throw new BadRequestException('Only pending or completed sales can be cancelled');
    }

    return this.prisma.$transaction(async () => {
      await this.salesRepository.updateStatus(id, 'CANCELLED', dto.reason);

      for (const item of sale.items) {
        const current = await this.inventoryRepository.findByVariantAndStore(
          item.variantId,
          sale.storeId,
          tenantId,
        );

        const updated = await this.inventoryRepository.incrementStock(
          item.variantId,
          sale.storeId,
          tenantId,
          item.quantity,
        );

        await this.inventoryRepository.createMovement({
          tenantId,
          inventoryId: updated.id,
          type: InventoryMovementType.RETURN,
          quantity: item.quantity,
          previousQuantity: current?.quantity ?? 0,
          newQuantity: (current?.quantity ?? 0) + item.quantity,
          referenceId: (sale as any).number ?? id,  // ajustá al campo real del schema
          userId,
        });
      }

      return { message: 'Sale cancelled successfully' };
    });
  }

  async refund(id: string, tenantId: string, userId: string, dto: CreateRefundDto) {
    const sale = await this.findById(id, tenantId);

    if (sale.status !== 'COMPLETED') {
      throw new BadRequestException('Only completed sales can be refunded');
    }

    const saleItemsMap = new Map(sale.items.map((i) => [i.id, i]));

    for (const refundItem of dto.items) {
      const saleItem = saleItemsMap.get(refundItem.saleItemId);
      if (!saleItem) {
        throw new BadRequestException(`Sale item ${refundItem.saleItemId} not found`);
      }
      if (refundItem.quantity > saleItem.quantity) {
        throw new BadRequestException(
          `Refund quantity exceeds sold quantity for item ${refundItem.saleItemId}`,
        );
      }
    }

    return this.prisma.$transaction(async () => {
      await this.salesRepository.updateStatus(id, 'REFUNDED', dto.reason);

      for (const refundItem of dto.items) {
        const saleItem = saleItemsMap.get(refundItem.saleItemId)!;

        const current = await this.inventoryRepository.findByVariantAndStore(
          saleItem.variantId,
          sale.storeId,
          tenantId,
        );

        const updated = await this.inventoryRepository.incrementStock(
          saleItem.variantId,
          sale.storeId,
          tenantId,
          refundItem.quantity,
        );

        await this.inventoryRepository.createMovement({
          tenantId,
          inventoryId: updated.id,
          type: InventoryMovementType.RETURN,
          quantity: refundItem.quantity,
          previousQuantity: current?.quantity ?? 0,
          newQuantity: (current?.quantity ?? 0) + refundItem.quantity,
          referenceId: (sale as any).number ?? id,  // ajustá al campo real del schema
          userId,
        });
      }

      return { message: 'Refund processed successfully' };
    });
  }

  getSummary(
    tenantId: string,
    storeId?: string,
    dateFrom?: string,
    dateTo?: string,
  ) {
    return this.salesRepository.getSummary(tenantId, storeId, dateFrom, dateTo);
  }
}