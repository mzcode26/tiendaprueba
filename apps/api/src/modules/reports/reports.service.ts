import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SalesSummary, InventorySummary, CustomerSummary } from './types/report.type';

type InventoryWithVariant = {
  quantity: number;
  minStock: number;
  variant: {
    price: number | string;
    product: { id: string; name: string };
  };
};

type CustomerWithSales = {
  id: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  sales: Array<{ total: number | string }>;
};

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getSalesReport(tenantId: string, filters: {
    storeId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<SalesSummary> {
    const { storeId, startDate, endDate } = filters;

    const where = {
      tenantId,
      deletedAt: null,
      ...(storeId && { storeId }),
      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }),
    };

    const sales = await this.prisma.sale.findMany({
      where,
      include: {
        items: true,
        payments: { where: { status: 'COMPLETED' } },
      },
    });

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum: number, sale: any) => sum + Number(sale.total), 0);
    const totalItems = sales.reduce((sum: number, sale: any) => sum + sale.items.length, 0);

    const byPaymentMethod = sales
      .flatMap((sale: any) => sale.payments)
      .reduce(
        (
          acc: Record<string, { count: number; total: number }>,
          payment: { method: string; amount: number | string }
        ) => {
          const method = payment.method;
          if (!acc[method]) {
            acc[method] = { count: 0, total: 0 };
          }
          acc[method].count += 1;
          acc[method].total += Number(payment.amount);
          return acc;
        },
        {} as Record<string, { count: number; total: number }>
      );

    return {
      totalSales,
      totalRevenue,
      totalItems,
      byPaymentMethod,
    };
  }

  async getInventoryReport(tenantId: string, storeId?: string): Promise<InventorySummary> {
    const where = {
      tenantId,
      deletedAt: null,
      ...(storeId && { storeId }),
    };

    const inventory = await this.prisma.inventory.findMany({
      where,
      include: {
        variant: {
          include: {
            product: { select: { id: true, name: true } },
          },
        },
      },
    });

    const totalProducts = inventory.length;
    const lowStock = inventory.filter((inv: InventoryWithVariant) => inv.quantity <= inv.minStock).length;
const outOfStock = inventory.filter((inv: InventoryWithVariant) => inv.quantity === 0).length;
const totalValue = inventory.reduce(
  (sum: number, inv: InventoryWithVariant) => sum + (inv.quantity * Number(inv.variant.price)),
  0
);

    return {
      totalProducts,
      lowStock,
      outOfStock,
      totalValue,
    };
  }

  async getCustomerReport(tenantId: string): Promise<CustomerSummary> {
    const customers = await this.prisma.customer.findMany({
      where: { tenantId, deletedAt: null },
      include: {
        sales: {
          where: { status: 'COMPLETED' },
          select: { total: true },
        },
      },
    });

    const totalCustomers = customers.length;
    const activeCustomers = customers.filter((c: CustomerWithSales) => c.isActive).length;
const totalRevenue = customers.reduce(
  (sum: number, c: CustomerWithSales) => sum + c.sales.reduce(
    (s: number, sale) => s + Number(sale.total), 0
  ),
  0
);

const topCustomers = customers
  .map((c: CustomerWithSales) => ({
    id: c.id,
    name: `${c.firstName} ${c.lastName}`,
    totalSpent: c.sales.reduce((sum: number, sale) => sum + Number(sale.total), 0),
    salesCount: c.sales.length,
  }))
  .sort((a: { totalSpent: number }, b: { totalSpent: number }) => b.totalSpent - a.totalSpent)
  .slice(0, 10);

    return {
      totalCustomers,
      activeCustomers,
      totalRevenue,
      topCustomers,
    };
  }
}