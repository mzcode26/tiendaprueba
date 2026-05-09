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
exports.PosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const sales_service_1 = require("../sales/sales.service");
let PosService = class PosService {
    prisma;
    salesService;
    constructor(prisma, salesService) {
        this.prisma = prisma;
        this.salesService = salesService;
    }
    async getStoreInventorySummary(tenantId, storeId) {
        const store = await this.prisma.store.findFirst({
            where: { id: storeId, tenantId, deletedAt: null },
            select: { id: true, name: true },
        });
        if (!store)
            throw new common_1.BadRequestException('Store not found');
        const inventory = await this.prisma.inventory.findMany({
            where: { storeId, tenantId },
            include: {
                variant: {
                    include: {
                        product: { select: { id: true, name: true } },
                    },
                },
            },
        });
        const totalItems = inventory.length;
        const lowStock = inventory.filter((i) => i.minStock != null && i.quantity <= i.minStock).length;
        const outOfStock = inventory.filter((i) => i.quantity === 0).length;
        return { store, totalItems, lowStock, outOfStock, inventory };
    }
    async getDailySummary(tenantId, storeId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const sales = await this.prisma.sale.findMany({
            where: {
                tenantId,
                storeId,
                createdAt: { gte: today, lt: tomorrow },
                status: { not: 'CANCELLED' },
            },
            include: {
                payments: true,
            },
        });
        const totalSales = sales.length;
        const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total), 0);
        const totalPayments = sales.flatMap((s) => s.payments).reduce((sum, p) => sum + Number(p.amount), 0);
        return {
            date: today,
            storeId,
            totalSales,
            totalRevenue,
            totalPayments,
        };
    }
    async searchProducts(tenantId, data) {
        const { q, storeId, type = 'name' } = data;
        // Validate store belongs to tenant
        const store = await this.prisma.store.findFirst({
            where: { id: storeId, tenantId, deletedAt: null },
        });
        if (!store) {
            throw new common_1.BadRequestException('Store not found');
        }
        let where = {
            tenantId,
            deletedAt: null,
        };
        // Build search conditions based on type
        if (type === 'barcode') {
            where.barcode = { contains: q, mode: 'insensitive' };
        }
        else if (type === 'sku') {
            where.variants = {
                some: {
                    sku: { contains: q, mode: 'insensitive' },
                    deletedAt: null,
                },
            };
        }
        else {
            where.name = { contains: q, mode: 'insensitive' };
        }
        const products = await this.prisma.product.findMany({
            where,
            include: {
                variants: {
                    where: { deletedAt: null },
                    include: {
                        inventory: {
                            where: {
                                storeId,
                                tenantId,
                                deletedAt: null,
                            },
                        },
                    },
                },
                category: {
                    select: { id: true, name: true },
                },
            },
            take: 50, // Limit results for POS performance
        });
        // Filter and format results for POS
        const results = products
            .filter((product) => product.variants.length > 0)
            .map((product) => ({
            id: product.id,
            name: product.name,
            barcode: product.barcode,
            category: product.category,
            variants: product.variants.map((variant) => ({
                id: variant.id,
                sku: variant.sku,
                price: variant.price,
                cost: variant.cost,
                stock: variant.inventory[0]?.quantity || 0,
                reserved: variant.inventory[0]?.reservedQuantity || 0,
                available: (variant.inventory[0]?.quantity || 0) - (variant.inventory[0]?.reservedQuantity || 0),
            })),
        }));
        return results;
    }
    async quickSale(tenantId, userId, data) {
        // Convert POS items to sales items
        const saleItems = data.items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: 0, // Will be set by service
            discountAmount: item.discountAmount || 0,
        }));
        // Create sale using sales service
        return this.salesService.create(tenantId, userId, {
            storeId: data.storeId,
            customerId: data.customerId,
            items: saleItems,
            discountAmount: data.discountAmount || 0,
            notes: data.notes,
        });
    }
    async getPosData(tenantId, storeId) {
        // Get store info
        const store = await this.prisma.store.findFirst({
            where: { id: storeId, tenantId, deletedAt: null },
            select: { id: true, name: true, address: true },
        });
        if (!store) {
            throw new common_1.BadRequestException('Store not found');
        }
        // Get recent customers for quick selection
        const customers = await this.prisma.customer.findMany({
            where: { tenantId, deletedAt: null },
            select: { id: true, firstName: true, lastName: true, phone: true },
            orderBy: { updatedAt: 'desc' },
            take: 20,
        });
        // Get popular products for quick access
        const popularProducts = await this.prisma.product.findMany({
            where: { tenantId, deletedAt: null },
            include: {
                variants: {
                    where: { deletedAt: null },
                    include: {
                        inventory: {
                            where: { storeId, tenantId, deletedAt: null },
                        },
                    },
                },
            },
            orderBy: { updatedAt: 'desc' },
            take: 10,
        });
        return {
            store,
            customers,
            popularProducts: popularProducts.map((product) => ({
                id: product.id,
                name: product.name,
                variants: product.variants.map((variant) => ({
                    id: variant.id,
                    sku: variant.sku,
                    price: variant.price,
                    stock: variant.inventory[0]?.quantity || 0,
                })),
            })),
        };
    }
};
exports.PosService = PosService;
exports.PosService = PosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        sales_service_1.SalesService])
], PosService);
