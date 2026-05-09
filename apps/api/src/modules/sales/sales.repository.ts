import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { QuerySalesDto } from './dto/query-sales.dto';
import { SaleStatus, PaymentMethod } from '@prisma/client';

@Injectable()
export class SalesRepository {
  constructor(private prisma: PrismaService) {}

  async generateSaleNumber(tenantId: string): Promise<string> {
    const count = await this.prisma.sale.count({ where: { tenantId } });
    const padded = String(count + 1).padStart(6, '0');
    return `SALE-${padded}`;
  }

  async findAll(tenantId: string, query: QuerySalesDto) {
    const { storeId, customerId, status, dateFrom, dateTo, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where = {
      tenantId,
      deletedAt: null,
      ...(storeId && { storeId }),
      ...(customerId && { customerId }),
      ...(status && { status: status as SaleStatus }),
      ...((dateFrom || dateTo) && {
        createdAt: {
          ...(dateFrom && { gte: new Date(dateFrom) }),
          ...(dateTo && { lte: new Date(dateTo) }),
        },
      }),
      ...(search && {
        OR: [
          { saleNumber: { contains: search, mode: 'insensitive' as const } },
          {
            customer: {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' as const } },
                { lastName: { contains: search, mode: 'insensitive' as const } },
              ],
            },
          },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.sale.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          store: { select: { id: true, name: true } },
          user: { select: { id: true, firstName: true, lastName: true } },
          payments: true,
          _count: { select: { items: true } },
        },
      }),
      this.prisma.sale.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string, tenantId: string) {
    return this.prisma.sale.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        customer: true,
        store: true,
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        items: {
          include: {
            variant: {
              include: {
                product: { select: { id: true, name: true, images: { take: 1 } } },
                attributes: {
                  include: { attribute: true, attributeValue: true },
                },
              },
            },
          },
        },
        payments: true,
      },
    });
  }

  async findBySaleNumber(saleNumber: string, tenantId: string) {
    return this.prisma.sale.findFirst({
      where: { saleNumber, tenantId, deletedAt: null },
    });
  }

  async create(
    tenantId: string,
    userId: string,
    saleNumber: string,
    dto: CreateSaleDto,
    subtotal: number,
    total: number,
  ) {
    return this.prisma.sale.create({
      data: {
        tenantId,
        userId,
        storeId: dto.storeId,
        customerId: dto.customerId,
        saleNumber,
        subtotal,
        discountAmount: dto.discountAmount ?? 0,
        taxAmount: dto.taxAmount ?? 0,
        total,
        notes: dto.notes,
        status: 'COMPLETED',
        items: {
          create: dto.items.map((item) => ({
            tenantId,
            variant: { connect: { id: item.variantId } },
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount ?? 0,
            subtotal: item.unitPrice * item.quantity - (item.discount ?? 0),
          })),
        },
        payments: {
         create: (dto.payments ?? []).map((p) => ({
            tenantId,
            method: p.method as PaymentMethod,
            amount: p.amount,
            reference: p.reference,
            status: 'COMPLETED',
          })),
        },
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: { select: { id: true, name: true } },
              },
            },
          },
        },
        payments: true,
        customer: true,
        store: true,
      },
    });
  }

  async updateStatus(id: string, status: SaleStatus, notes?: string) {
    return this.prisma.sale.update({
      where: { id },
      data: {
        status,
        ...(notes && { notes }),
      },
    });
  }

  async getSummary(
    tenantId: string,
    storeId?: string,
    dateFrom?: string,
    dateTo?: string,
  ) {
    const where = {
      tenantId,
      status: 'COMPLETED' as SaleStatus,
      deletedAt: null,
      ...(storeId && { storeId }),
      ...((dateFrom || dateTo) && {
        createdAt: {
          ...(dateFrom && { gte: new Date(dateFrom) }),
          ...(dateTo && { lte: new Date(dateTo) }),
        },
      }),
    };

    const [totals, byPaymentMethod, topProducts] = await Promise.all([
      this.prisma.sale.aggregate({
        where,
        _sum: { total: true, discountAmount: true, taxAmount: true },
        _count: { id: true },
        _avg: { total: true },
      }),
      this.prisma.payment.groupBy({
        by: ['method'],
        where: { sale: where },
        _sum: { amount: true },
        _count: { id: true },
      }),
      this.prisma.saleItem.groupBy({
        by: ['variantId'],
        where: { sale: where },
        _sum: { quantity: true, subtotal: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      totalSales: totals._count.id,
      totalRevenue: totals._sum.total ?? 0,
      totalDiscount: totals._sum.discountAmount ?? 0,
      totalTax: totals._sum.taxAmount ?? 0,
      averageOrderValue: totals._avg.total ?? 0,
      byPaymentMethod,
      topProducts,
    };
  }
}