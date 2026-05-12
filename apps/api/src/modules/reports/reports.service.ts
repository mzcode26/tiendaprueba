import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryReportDto, ReportGroupBy } from './dto/query-report.dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  // ─── Sales Over Time ───────────────────────────────────────────────────────

  async getSalesOverTime(tenantId: string, dto: QueryReportDto) {
    const { storeId, dateFrom, dateTo, groupBy = ReportGroupBy.DAY } = dto;

    const truncMap: Record<ReportGroupBy, string> = {
      DAY: 'day',
      WEEK: 'week',
      MONTH: 'month',
    };
    const trunc = truncMap[groupBy];

    const storeFilter = storeId ? `AND s.store_id = '${storeId}'` : '';
    const dateFromFilter = dateFrom
      ? `AND s.created_at >= '${new Date(dateFrom).toISOString()}'`
      : '';
    const dateToFilter = dateTo
      ? `AND s.created_at <= '${new Date(dateTo).toISOString()}'`
      : '';

    return this.prisma.$queryRawUnsafe<
      Array<{ period: Date; total_sales: bigint; total_revenue: number }>
    >(`
      SELECT
        DATE_TRUNC('${trunc}', s.created_at) AS period,
        COUNT(s.id)::bigint AS total_sales,
        COALESCE(SUM(s.total), 0)::float AS total_revenue
      FROM sales s
      WHERE s.tenant_id = '${tenantId}'
        AND s.status = 'COMPLETED'
        AND s.deleted_at IS NULL
        ${storeFilter}
        ${dateFromFilter}
        ${dateToFilter}
      GROUP BY period
      ORDER BY period ASC
    `);
  }

  // ─── Top Products ──────────────────────────────────────────────────────────

  async getTopProducts(tenantId: string, dto: QueryReportDto) {
    const { storeId, dateFrom, dateTo, limit = 10 } = dto;

    const storeFilter = storeId ? `AND s.store_id = '${storeId}'` : '';
    const dateFromFilter = dateFrom
      ? `AND s.created_at >= '${new Date(dateFrom).toISOString()}'`
      : '';
    const dateToFilter = dateTo
      ? `AND s.created_at <= '${new Date(dateTo).toISOString()}'`
      : '';

    return this.prisma.$queryRawUnsafe<
      Array<{
        product_id: string;
        product_name: string;
        variant_sku: string;
        total_quantity: bigint;
        total_revenue: number;
      }>
    >(`
      SELECT
        p.id AS product_id,
        p.name AS product_name,
        v.sku AS variant_sku,
        SUM(si.quantity)::bigint AS total_quantity,
        COALESCE(SUM(si.subtotal), 0)::float AS total_revenue
      FROM sale_items si
      JOIN product_variants v ON v.id = si.variant_id
      JOIN products p ON p.id = v.product_id
      JOIN sales s ON s.id = si.sale_id
      WHERE s.tenant_id = '${tenantId}'
        AND s.status = 'COMPLETED'
        AND s.deleted_at IS NULL
        ${storeFilter}
        ${dateFromFilter}
        ${dateToFilter}
      GROUP BY p.id, p.name, v.sku
      ORDER BY total_quantity DESC
      LIMIT ${limit}
    `);
  }

  // ─── Top Customers ─────────────────────────────────────────────────────────

  async getTopCustomers(tenantId: string, dto: QueryReportDto) {
    const { storeId, dateFrom, dateTo, limit = 10 } = dto;

    const storeFilter = storeId ? `AND s.store_id = '${storeId}'` : '';
    const dateFromFilter = dateFrom
      ? `AND s.created_at >= '${new Date(dateFrom).toISOString()}'`
      : '';
    const dateToFilter = dateTo
      ? `AND s.created_at <= '${new Date(dateTo).toISOString()}'`
      : '';

    return this.prisma.$queryRawUnsafe<
      Array<{
        customer_id: string;
        full_name: string;
        email: string;
        total_orders: bigint;
        total_spent: number;
      }>
    >(`
      SELECT
        c.id AS customer_id,
        CONCAT(c.first_name, ' ', c.last_name) AS full_name,
        c.email,
        COUNT(s.id)::bigint AS total_orders,
        COALESCE(SUM(s.total), 0)::float AS total_spent
      FROM sales s
      JOIN customers c ON c.id = s.customer_id
      WHERE s.tenant_id = '${tenantId}'
        AND s.status = 'COMPLETED'
        AND s.deleted_at IS NULL
        AND s.customer_id IS NOT NULL
        ${storeFilter}
        ${dateFromFilter}
        ${dateToFilter}
      GROUP BY c.id, c.first_name, c.last_name, c.email
      ORDER BY total_spent DESC
      LIMIT ${limit}
    `);
  }

  // ─── Revenue by Category ───────────────────────────────────────────────────

  async getRevenueByCategory(tenantId: string, dto: QueryReportDto) {
    const { storeId, dateFrom, dateTo } = dto;

    const storeFilter = storeId ? `AND s.store_id = '${storeId}'` : '';
    const dateFromFilter = dateFrom
      ? `AND s.created_at >= '${new Date(dateFrom).toISOString()}'`
      : '';
    const dateToFilter = dateTo
      ? `AND s.created_at <= '${new Date(dateTo).toISOString()}'`
      : '';

    return this.prisma.$queryRawUnsafe<
      Array<{
        category_id: string;
        category_name: string;
        total_quantity: bigint;
        total_revenue: number;
      }>
    >(`
      SELECT
        cat.id AS category_id,
        cat.name AS category_name,
        SUM(si.quantity)::bigint AS total_quantity,
        COALESCE(SUM(si.subtotal), 0)::float AS total_revenue
      FROM sale_items si
      JOIN product_variants v ON v.id = si.variant_id
      JOIN products p ON p.id = v.product_id
      JOIN categories cat ON cat.id = p.category_id
      JOIN sales s ON s.id = si.sale_id
      WHERE s.tenant_id = '${tenantId}'
        AND s.status = 'COMPLETED'
        AND s.deleted_at IS NULL
        ${storeFilter}
        ${dateFromFilter}
        ${dateToFilter}
      GROUP BY cat.id, cat.name
      ORDER BY total_revenue DESC
    `);
  }

  // ─── Revenue by Payment Method ─────────────────────────────────────────────

async getRevenueByPaymentMethod(tenantId: string, dto: QueryReportDto) {
  const { storeId, dateFrom, dateTo } = dto;

  const storeFilter = storeId ? `AND s.store_id = '${storeId}'` : '';
  const dateFromFilter = dateFrom
    ? `AND s.created_at >= '${new Date(dateFrom).toISOString()}'`
    : '';
  const dateToFilter = dateTo
    ? `AND s.created_at <= '${new Date(dateTo).toISOString()}'`
    : '';

  return this.prisma.$queryRawUnsafe<
    Array<{
      method: string;
      total_transactions: bigint;
      total_amount: number;
    }>
  >(`
    SELECT
      pmt.method,
      COUNT(pmt.id)::bigint AS total_transactions,
      COALESCE(SUM(pmt.amount), 0)::float AS total_amount
    FROM payments pmt
    JOIN sales s ON s.id = pmt.sale_id
    WHERE s.tenant_id = '${tenantId}'
      AND s.status = 'COMPLETED'
      AND s.deleted_at IS NULL
      ${storeFilter}
      ${dateFromFilter}
      ${dateToFilter}
    GROUP BY pmt.method
    ORDER BY total_amount DESC
  `);
}

  // ─── Inventory Valuation ───────────────────────────────────────────────────

 async getInventoryValuation(tenantId: string, storeId?: string) {
  const storeFilter = storeId ? `AND i.store_id = '${storeId}'` : '';

  return this.prisma.$queryRawUnsafe<
    Array<{
      store_name: string;
      product_name: string;
      variant_sku: string;
      quantity: number;
      cost_price: number;
      total_value: number;
    }>
  >(`
    SELECT
      st.name AS store_name,
      p.name AS product_name,
      v.sku AS variant_sku,
      i.quantity,
      COALESCE(v.cost_price, 0)::float AS cost_price,
      (i.quantity * COALESCE(v.cost_price, 0))::float AS total_value
    FROM inventory i
    JOIN product_variants v ON v.id = i.variant_id
    JOIN products p ON p.id = v.product_id
    JOIN stores st ON st.id = i.store_id
    WHERE i.tenant_id = '${tenantId}'
      AND i.deleted_at IS NULL
      AND p.deleted_at IS NULL
      AND v.deleted_at IS NULL
      ${storeFilter}
    ORDER BY total_value DESC
  `);
}

  // ─── Dashboard Summary ─────────────────────────────────────────────────────

async getDashboardSummary(tenantId: string, storeId?: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

  const storeWhere = storeId ? { storeId } : {};

  const baseWhere = {
    tenantId,
    status: 'COMPLETED' as const,
    deletedAt: null,
    ...storeWhere,
  };

  const [
    todaySales,
    monthSales,
    lastMonthSales,
    totalCustomers,
    lowStockCount,
  ] = await Promise.all([
    this.prisma.sale.aggregate({
      where: { ...baseWhere, createdAt: { gte: today } },
      _sum: { total: true },
      _count: { id: true },
    }),
    this.prisma.sale.aggregate({
      where: { ...baseWhere, createdAt: { gte: startOfMonth } },
      _sum: { total: true },
      _count: { id: true },
    }),
    this.prisma.sale.aggregate({
      where: {
        ...baseWhere,
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
      _sum: { total: true },
      _count: { id: true },
    }),
    this.prisma.customer.count({
      where: { tenantId, deletedAt: null, isActive: true },
    }),
    this.prisma.$queryRawUnsafe<[{ count: bigint }]>(`
      SELECT COUNT(*)::bigint AS count
      FROM inventory i
      WHERE i.tenant_id = '${tenantId}'
        ${storeId ? `AND i.store_id = '${storeId}'` : ''}
        AND i.min_stock IS NOT NULL
        AND i.quantity <= i.min_stock
    `),
  ]);

  const monthRevenue = Number(monthSales._sum.total ?? 0);
  const lastMonthRevenue = Number(lastMonthSales._sum.total ?? 0);

  const revenueGrowth =
    lastMonthRevenue > 0
      ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

  return {
    today: {
      sales: todaySales._count.id,
      revenue: Number(todaySales._sum.total ?? 0),
    },
    currentMonth: {
      sales: monthSales._count.id,
      revenue: monthRevenue,
      revenueGrowth: Math.round(revenueGrowth * 100) / 100,
    },
    lastMonth: {
      sales: lastMonthSales._count.id,
      revenue: lastMonthRevenue,
    },
    totalCustomers,
    lowStockAlerts: Number(lowStockCount[0]?.count ?? 0),
  };
}
}