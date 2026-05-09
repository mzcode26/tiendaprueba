"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const query_report_dto_1 = require("./dto/query-report.dto");
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    // ─── Sales Over Time ───────────────────────────────────────────────────────
    async getSalesOverTime(tenantId, dto) {
        const { storeId, dateFrom, dateTo, groupBy = query_report_dto_1.ReportGroupBy.DAY } = dto;
        const truncMap = {
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
        return this.prisma.$queryRawUnsafe(`
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
    async getTopProducts(tenantId, dto) {
        const { storeId, dateFrom, dateTo, limit = 10 } = dto;
        const storeFilter = storeId ? `AND s.store_id = '${storeId}'` : '';
        const dateFromFilter = dateFrom
            ? `AND s.created_at >= '${new Date(dateFrom).toISOString()}'`
            : '';
        const dateToFilter = dateTo
            ? `AND s.created_at <= '${new Date(dateTo).toISOString()}'`
            : '';
        return this.prisma.$queryRawUnsafe(`
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
    async getTopCustomers(tenantId, dto) {
        const { storeId, dateFrom, dateTo, limit = 10 } = dto;
        const storeFilter = storeId ? `AND s.store_id = '${storeId}'` : '';
        const dateFromFilter = dateFrom
            ? `AND s.created_at >= '${new Date(dateFrom).toISOString()}'`
            : '';
        const dateToFilter = dateTo
            ? `AND s.created_at <= '${new Date(dateTo).toISOString()}'`
            : '';
        return this.prisma.$queryRawUnsafe(`
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
    async getRevenueByCategory(tenantId, dto) {
        const { storeId, dateFrom, dateTo } = dto;
        const storeFilter = storeId ? `AND s.store_id = '${storeId}'` : '';
        const dateFromFilter = dateFrom
            ? `AND s.created_at >= '${new Date(dateFrom).toISOString()}'`
            : '';
        const dateToFilter = dateTo
            ? `AND s.created_at <= '${new Date(dateTo).toISOString()}'`
            : '';
        return this.prisma.$queryRawUnsafe(`
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
    async getRevenueByPaymentMethod(tenantId, dto) {
        const { storeId, dateFrom, dateTo } = dto;
        const storeFilter = storeId ? `AND s.store_id = '${storeId}'` : '';
        const dateFromFilter = dateFrom
            ? `AND s.created_at >= '${new Date(dateFrom).toISOString()}'`
            : '';
        const dateToFilter = dateTo
            ? `AND s.created_at <= '${new Date(dateTo).toISOString()}'`
            : '';
        return this.prisma.$queryRawUnsafe(`
      SELECT
        sp.method,
        COUNT(sp.id)::bigint AS total_transactions,
        COALESCE(SUM(sp.amount), 0)::float AS total_amount
      FROM sale_payments sp
      JOIN sales s ON s.id = sp.sale_id
      WHERE s.tenant_id = '${tenantId}'
        AND s.status = 'COMPLETED'
        AND s.deleted_at IS NULL
        ${storeFilter}
        ${dateFromFilter}
        ${dateToFilter}
      GROUP BY sp.method
      ORDER BY total_amount DESC
    `);
    }
    // ─── Inventory Valuation ───────────────────────────────────────────────────
    async getInventoryValuation(tenantId, storeId) {
        const storeFilter = storeId ? `AND i.store_id = '${storeId}'` : '';
        return this.prisma.$queryRawUnsafe(`
      SELECT
        st.name AS store_name,
        p.name AS product_name,
        v.sku AS variant_sku,
        i.quantity,
        COALESCE(v.cost_price, 0)::float AS cost_price,
        (i.quantity * COALESCE(v.cost_price, 0))::float AS total_value
      FROM inventories i
      JOIN product_variants v ON v.id = i.variant_id
      JOIN products p ON p.id = v.product_id
      JOIN stores st ON st.id = i.store_id
      WHERE i.tenant_id = '${tenantId}'
        AND p.deleted_at IS NULL
        AND v.deleted_at IS NULL
        ${storeFilter}
      ORDER BY total_value DESC
    `);
    }
    // ─── Dashboard Summary ─────────────────────────────────────────────────────
    async getDashboardSummary(tenantId, storeId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        const storeWhere = storeId ? { storeId } : {};
        const baseWhere = {
            tenantId,
            status: 'COMPLETED',
            deletedAt: null,
            ...storeWhere,
        };
        const [todaySales, monthSales, lastMonthSales, totalCustomers, lowStockCount,] = await Promise.all([
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
            this.prisma.$queryRawUnsafe(`
        SELECT COUNT(*)::bigint as count
        FROM inventories i
        WHERE i.tenant_id = '${tenantId}'
          ${storeId ? `AND i.store_id = '${storeId}'` : ''}
          AND i.min_stock IS NOT NULL
          AND i.quantity <= i.min_stock
      `),
        ]);
        const monthRevenue = Number(monthSales._sum.total ?? 0);
        const lastMonthRevenue = Number(lastMonthSales._sum.total ?? 0);
        const revenueGrowth = lastMonthRevenue > 0
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
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
