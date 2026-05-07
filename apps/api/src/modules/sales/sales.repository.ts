import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SaleStatus, PaymentMethod, PaymentStatus, InventoryMovementType } from '@prisma/client';
import { SaleWithRelations, SalesSummary } from './types/sale.type';
import { SaleFiltersDto } from './dto/sale-filters.dto';

@Injectable()
export class SalesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, filters: SaleFiltersDto) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;

    const where: any = {
      tenantId,
      deletedAt: null,
    };

    // Apply filters
    if (filters.storeId) {
      where.storeId = filters.storeId;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters.status) {
      where.status = filters.status;
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

    if (filters.search) {
      where.OR = [
        { id: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.sale.count({ where }),
      this.prisma.sale.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          store: { select: { id: true, name: true } },
          user: { select: { id: true, firstName: true, lastName: true } },
          customer: { select: { id: true, firstName: true, lastName: true, phone: true } },
          items: {
            include: {
              variant: {
                select: {
                  id: true,
                  sku: true,
                  product: { select: { id: true, name: true } },
                },
              },
            },
          },
          payments: {
            select: {
              id: true,
              method: true,
              amount: true,
              status: true,
              reference: true,
              installments: true,
              installmentAmount: true,
            },
          },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { data, total };
  }

  async findById(id: string, tenantId: string): Promise<SaleWithRelations> {
    const sale = await this.prisma.sale.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        store: { select: { id: true, name: true } },
        user: { select: { id: true, firstName: true, lastName: true } },
        customer: { select: { id: true, firstName: true, lastName: true, phone: true } },
        items: {
          include: {
            variant: {
              select: {
                id: true,
                sku: true,
                product: { select: { id: true, name: true } },
              },
            },
          },
        },
        payments: {
          select: {
            id: true,
            method: true,
            amount: true,
            status: true,
            reference: true,
            installments: true,
            installmentAmount: true,
          },
        },
      },
    });

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    return sale as SaleWithRelations;
  }

  async create(tenantId: string, data: {
    storeId: string;
    userId: string;
    customerId?: string;
    items: Array<{
      variantId: string;
      quantity: number;
      unitPrice: number;
      discountAmount: number;
      subtotal: number;
    }>;
    payments?: Array<{
      method: PaymentMethod;
      amount: number;
      reference?: string;
      installments?: number;
      installmentAmount?: number;
    }>;
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    total: number;
    notes?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      // Create sale
      const sale = await tx.sale.create({
        data: {
          tenantId,
          storeId: data.storeId,
          userId: data.userId,
          customerId: data.customerId,
          status: data.payments && data.payments.length > 0 ? SaleStatus.COMPLETED : SaleStatus.PENDING,
          subtotal: data.subtotal,
          discountAmount: data.discountAmount,
          taxAmount: data.taxAmount,
          total: data.total,
          notes: data.notes,
        },
      });

      // Create sale items and update inventory
      for (const item of data.items) {
        await tx.saleItem.create({
          data: {
            tenantId,
            saleId: sale.id,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountAmount: item.discountAmount,
            subtotal: item.subtotal,
          },
        });

        // Update inventory and create movement
        const inventory = await tx.inventory.findFirst({
          where: {
            variantId: item.variantId,
            storeId: data.storeId,
            tenantId,
            deletedAt: null,
          },
        });

        if (!inventory) {
          throw new Error(`Inventory not found for variant ${item.variantId} in store ${data.storeId}`);
        }

        if (inventory.quantity < item.quantity) {
          throw new Error(`Insufficient stock for variant ${item.variantId}`);
        }

        await tx.inventory.update({
          where: { id: inventory.id },
          data: { quantity: { decrement: item.quantity } },
        });

        await tx.inventoryMovement.create({
          data: {
            tenantId,
            inventoryId: inventory.id,
            type: InventoryMovementType.SALE,
            quantity: -item.quantity,
            previousQuantity: inventory.quantity,
            newQuantity: inventory.quantity - item.quantity,
            referenceId: sale.id,
            referenceType: 'sale',
            userId: data.userId,
          },
        });
      }

      // Create payments if provided
      if (data.payments && data.payments.length > 0) {
        for (const payment of data.payments) {
          await tx.payment.create({
            data: {
              tenantId,
              saleId: sale.id,
              method: payment.method,
              amount: payment.amount,
              status: PaymentStatus.COMPLETED,
              reference: payment.reference,
              installments: payment.installments || 1,
              installmentAmount: payment.installmentAmount,
            },
          });
        }
      }

      return sale;
    });
  }

  async updateStatus(id: string, tenantId: string, status: SaleStatus) {
    return this.prisma.sale.update({
      where: { id, tenantId },
      data: { status },
    });
  }

  async cancel(id: string, tenantId: string, data: { cancelReason: string; userId: string }) {
    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findFirst({
        where: { id, tenantId, deletedAt: null },
        include: { items: true },
      });

      if (!sale) {
        throw new NotFoundException('Sale not found');
      }

      // Update sale status
      await tx.sale.update({
        where: { id },
        data: {
          status: SaleStatus.CANCELLED,
          cancelledAt: new Date(),
          cancelReason: data.cancelReason,
        },
      });

      // Restore inventory for each item
      for (const item of sale.items) {
        const inventory = await tx.inventory.findFirst({
          where: {
            variantId: item.variantId,
            storeId: sale.storeId,
            tenantId,
            deletedAt: null,
          },
        });

        if (inventory) {
          await tx.inventory.update({
            where: { id: inventory.id },
            data: { quantity: { increment: item.quantity } },
          });

          await tx.inventoryMovement.create({
            data: {
              tenantId,
              inventoryId: inventory.id,
              type: InventoryMovementType.RETURN,
              quantity: item.quantity,
              previousQuantity: inventory.quantity,
              newQuantity: inventory.quantity + item.quantity,
              referenceId: sale.id,
              referenceType: 'sale_cancel',
              userId: data.userId,
            },
          });
        }
      }

      return sale;
    });
  }

  async addPayment(saleId: string, tenantId: string, data: {
    method: PaymentMethod;
    amount: number;
    reference?: string;
    installments?: number;
    installmentAmount?: number;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findFirst({
        where: { id: saleId, tenantId, deletedAt: null },
        include: { payments: true },
      });

      if (!sale) {
        throw new NotFoundException('Sale not found');
      }

      if (sale.status === SaleStatus.CANCELLED) {
        throw new Error('Cannot add payment to cancelled sale');
      }

      // Create payment
      const payment = await tx.payment.create({
        data: {
          tenantId,
          saleId,
          method: data.method,
          amount: data.amount,
          status: PaymentStatus.COMPLETED,
          reference: data.reference,
          installments: data.installments || 1,
          installmentAmount: data.installmentAmount,
        },
      });

      // Check if sale should be marked as completed
      const totalPayments = sale.payments.reduce((sum, p) => sum + Number(p.amount), 0) + Number(data.amount);
      if (totalPayments >= Number(sale.total)) {
        await tx.sale.update({
          where: { id: saleId },
          data: { status: SaleStatus.COMPLETED },
        });
      }

      return payment;
    });
  }

  async refund(saleId: string, tenantId: string, data: {
    reason: string;
    items?: Array<{ saleItemId: string; quantity: number }>;
    userId: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findFirst({
        where: { id: saleId, tenantId, deletedAt: null },
        include: { items: true, payments: true },
      });

      if (!sale) {
        throw new NotFoundException('Sale not found');
      }

      if (sale.status !== SaleStatus.COMPLETED) {
        throw new Error('Can only refund completed sales');
      }

      // Determine refund items
      const refundItems = data.items || sale.items.map(item => ({
        saleItemId: item.id,
        quantity: item.quantity,
      }));

      // Create refund payments (negative amounts)
      const refundAmount = refundItems.reduce((sum, refundItem) => {
        const item = sale.items.find(i => i.id === refundItem.saleItemId);
        return sum + (Number(item?.unitPrice || 0) * refundItem.quantity);
      }, 0);

      // Create refund payment
      await tx.payment.create({
        data: {
          tenantId,
          saleId,
          method: PaymentMethod.OTHER,
          amount: -refundAmount,
          status: PaymentStatus.REFUNDED,
          reference: `Refund: ${data.reason}`,
        },
      });

      // Restore inventory for refunded items
      for (const refundItem of refundItems) {
        const saleItem = sale.items.find(i => i.id === refundItem.saleItemId);
        if (saleItem) {
          const inventory = await tx.inventory.findFirst({
            where: {
              variantId: saleItem.variantId,
              storeId: sale.storeId,
              tenantId,
              deletedAt: null,
            },
          });

          if (inventory) {
            await tx.inventory.update({
              where: { id: inventory.id },
              data: { quantity: { increment: refundItem.quantity } },
            });

            await tx.inventoryMovement.create({
              data: {
                tenantId,
                inventoryId: inventory.id,
                type: InventoryMovementType.RETURN,
                quantity: refundItem.quantity,
                previousQuantity: inventory.quantity,
                newQuantity: inventory.quantity + refundItem.quantity,
                referenceId: sale.id,
                referenceType: 'sale_refund',
                userId: data.userId,
              },
            });
          }
        }
      }

      // Update sale status
      const newStatus = refundItems.length === sale.items.length
        ? SaleStatus.REFUNDED
        : SaleStatus.PARTIALLY_REFUNDED;

      await tx.sale.update({
        where: { id: saleId },
        data: { status: newStatus },
      });

      return sale;
    });
  }

  async getSalesSummary(
    tenantId: string,
    storeId?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<SalesSummary> {
    const where: any = {
      tenantId,
      deletedAt: null,
      status: { in: [SaleStatus.COMPLETED, SaleStatus.PARTIALLY_REFUNDED] },
    };

    if (storeId) {
      where.storeId = storeId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [totalSales, totalRevenue, totalItems, paymentSummary] = await Promise.all([
      this.prisma.sale.count({ where }),
      this.prisma.sale.aggregate({
        where,
        _sum: { total: true },
      }),
      this.prisma.saleItem.aggregate({
        where: { sale: where },
        _sum: { quantity: true },
      }),
      this.prisma.payment.groupBy({
        by: ['method'],
        where: { sale: where },
        _count: true,
        _sum: { amount: true },
      }),
    ]);

    return {
      totalSales,
      totalRevenue: Number(totalRevenue._sum.total || 0),
      totalItems: totalItems._sum.quantity || 0,
      byPaymentMethod: paymentSummary.map(p => ({
        method: p.method,
        count: p._count,
        total: Number(p._sum.amount || 0),
      })),
    };
  }
}