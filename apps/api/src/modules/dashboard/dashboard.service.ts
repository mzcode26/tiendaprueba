import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReportsService } from '../reports/reports.service';

import type {
  DashboardStats,
  RecentSale,
  StockAlert,
} from './types/dashboard.type';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reportsService: ReportsService,
  ) {}

  async getStats(tenantId: string): Promise<DashboardStats> {
    const summary = await this.reportsService.getDashboardSummary(tenantId);

    const stats: DashboardStats = {
      todaySales: summary.today.sales,
      todayRevenue: summary.today.revenue,
      weekRevenue: 0,
      monthRevenue: summary.currentMonth.revenue,
      totalCustomers: summary.totalCustomers,
      newCustomersThisMonth: 0,
      totalProducts: 0,
      lowStockCount: summary.lowStockAlerts,
      outOfStockCount: 0,
    };

    return stats;
  }

  async getRecentSales(
    tenantId: string,
    limit: number,
  ): Promise<RecentSale[]> {
    const sales = await this.prisma.sale.findMany({
      where: {
        tenantId,
        deletedAt: null,
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        customer: true,
      },
    });

    const formattedSales: RecentSale[] = sales.map((sale) => ({
      id: sale.id,
      saleNumber: sale.saleNumber,
      customerName: sale.customer
        ? `${sale.customer.firstName} ${sale.customer.lastName}`
        : undefined,
      total: Number(sale.total),
      status: sale.status,
      createdAt: sale.createdAt.toISOString(),
    }));

    return formattedSales;
  }

async getStockAlerts(
  tenantId: string,
  limit: number,
): Promise<StockAlert[]> {
  const rows = await this.prisma.$queryRaw<StockAlert[]>`
    SELECT
      p.id AS "productId",
      p.name AS "productName",
      v.sku AS "sku",
      i.quantity AS "currentStock",
      i.min_stock AS "minStock",
      s.name AS "storeName"
    FROM inventory i
    JOIN product_variants v ON v.id = i.variant_id
    JOIN products p ON p.id = v.product_id
    JOIN stores s ON s.id = i.store_id
    WHERE
      i.tenant_id = ${tenantId}
      AND i.deleted_at IS NULL
      AND i.quantity <= i.min_stock
    ORDER BY i.quantity ASC
    LIMIT ${limit}
  `;

  return rows;
}
}