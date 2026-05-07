import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SalesRepository } from './sales.repository';
import { SaleWithRelations } from './types/sale.type';
import { CreateSaleDto, SaleFiltersDto, AddPaymentDto, CancelSaleDto, RefundSaleDto } from './dto/index';

@Injectable()
export class SalesService {
  constructor(
    private readonly repository: SalesRepository,
    private readonly prisma: PrismaService,
  ) {}

  async createSale(tenantId: string, userId: string, data: CreateSaleDto): Promise<SaleWithRelations> {
    // Validate store belongs to tenant
    const store = await this.prisma.store.findFirst({
      where: { id: data.storeId, tenantId, deletedAt: null },
    });
    if (!store) {
      throw new BadRequestException('Store not found');
    }

    // Validate customer belongs to tenant (if provided)
    if (data.customerId) {
      const customer = await this.prisma.customer.findFirst({
        where: { id: data.customerId, tenantId, deletedAt: null },
      });
      if (!customer) {
        throw new BadRequestException('Customer not found');
      }
    }

    // Process items and validate stock
    const processedItems = [];
    let subtotal = 0;

    for (const item of data.items) {
      // Validate variant belongs to tenant and get price
      const variant = await this.prisma.productVariant.findFirst({
        where: { id: item.variantId, tenantId, deletedAt: null },
        include: { product: true },
      });
      if (!variant) {
        throw new BadRequestException(`Product variant ${item.variantId} not found`);
      }

      // Check stock availability
      const inventory = await this.prisma.inventory.findFirst({
        where: {
          variantId: item.variantId,
          storeId: data.storeId,
          tenantId,
          deletedAt: null,
        },
      });

      const availableQuantity = inventory ? inventory.quantity - inventory.reservedQuantity : 0;
      if (availableQuantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${variant.product.name} (${variant.sku}). Available: ${availableQuantity}`
        );
      }

      const unitPrice = item.unitPrice || Number(variant.price);
      const discountAmount = item.discountAmount || 0;
      const itemSubtotal = (unitPrice - discountAmount) * item.quantity;

      processedItems.push({
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice,
        discountAmount,
        subtotal: itemSubtotal,
      });

      subtotal += itemSubtotal;
    }

    // Calculate totals
    const discountAmount = data.discountAmount || 0;
    const taxAmount = 0; // TODO: Implement tax calculation
    const total = subtotal - discountAmount + taxAmount;

    // Process payments if provided
    const processedPayments = data.payments?.map(payment => ({
      method: payment.method as any,
      amount: payment.amount,
      reference: payment.reference,
      installments: payment.installments,
      installmentAmount: payment.installmentAmount,
    }));

    const sale = await this.repository.create(tenantId, {
      storeId: data.storeId,
      userId,
      customerId: data.customerId,
      items: processedItems,
      payments: processedPayments,
      subtotal,
      discountAmount,
      taxAmount,
      total,
      notes: data.notes,
    });

    return this.repository.findById(sale.id, tenantId);
  }

  async getSales(tenantId: string, filters: SaleFiltersDto) {
    return this.repository.findAll(tenantId, filters);
  }

  async getSaleById(tenantId: string, id: string): Promise<SaleWithRelations> {
    return this.repository.findById(id, tenantId);
  }

  async cancelSale(tenantId: string, userId: string, id: string, data: CancelSaleDto): Promise<SaleWithRelations> {
    // Validate sale belongs to tenant
    await this.repository.findById(id, tenantId);

    await this.repository.cancel(id, tenantId, {
      cancelReason: data.cancelReason,
      userId,
    });

    return this.repository.findById(id, tenantId);
  }

  async addPayment(tenantId: string, saleId: string, data: AddPaymentDto): Promise<SaleWithRelations> {
    // Validate sale belongs to tenant
    await this.repository.findById(saleId, tenantId);

    await this.repository.addPayment(saleId, tenantId, {
      method: data.method,
      amount: data.amount,
      reference: data.reference,
      installments: data.installments,
      installmentAmount: data.installmentAmount,
    });

    return this.repository.findById(saleId, tenantId);
  }

  async refundSale(tenantId: string, userId: string, saleId: string, data: RefundSaleDto): Promise<SaleWithRelations> {
    // Validate sale belongs to tenant
    await this.repository.findById(saleId, tenantId);

    await this.repository.refund(saleId, tenantId, {
      reason: data.reason,
      items: data.items,
      userId,
    });

    return this.repository.findById(saleId, tenantId);
  }

  async getDailySummary(tenantId: string, storeId: string, date: string) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    return this.repository.getSalesSummary(
      tenantId,
      storeId,
      startDate.toISOString(),
      endDate.toISOString(),
    );
  }

  async getSalesSummary(tenantId: string, storeId?: string, startDate?: string, endDate?: string) {
    return this.repository.getSalesSummary(tenantId, storeId, startDate, endDate);
  }
}