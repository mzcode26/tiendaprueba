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
exports.InventoryRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let InventoryRepository = class InventoryRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByVariantAndStore(variantId, storeId, tenantId) {
        return this.prisma.inventory.findFirst({
            where: { variantId, storeId, tenantId },
            include: {
                variant: {
                    include: {
                        product: { select: { id: true, name: true, slug: true } },
                        attributes: {
                            include: { attribute: true, attributeValue: true },
                        },
                    },
                },
                store: true,
            },
        });
    }
    async findByStore(storeId, tenantId, lowStockOnly = false) {
        if (lowStockOnly) {
            const allLow = await this.findLowStock(tenantId);
            return allLow.filter((r) => r.storeId === storeId);
        }
        return this.prisma.inventory.findMany({
            where: { storeId, tenantId },
            include: {
                variant: {
                    include: {
                        product: { select: { id: true, name: true, slug: true, images: { take: 1 } } },
                        attributes: {
                            include: { attribute: true, attributeValue: true },
                        },
                    },
                },
                store: true,
            },
            orderBy: { updatedAt: 'desc' },
        });
    }
    async findLowStock(tenantId) {
        return this.prisma.$queryRaw `
      SELECT i.id, i.variant_id as "variantId", i.store_id as "storeId",
             i.quantity, i.min_stock as "minStock",
             v.sku, p.name as product_name, s.name as store_name
      FROM inventory i
      JOIN product_variants v ON v.id = i.variant_id
      JOIN products p ON p.id = v.product_id
      JOIN stores s ON s.id = i.store_id
      WHERE i.tenant_id = ${tenantId}
        AND i.min_stock IS NOT NULL
        AND i.quantity <= i.min_stock
        AND p.deleted_at IS NULL
        AND v.deleted_at IS NULL
      ORDER BY (i.quantity - i.min_stock) ASC
    `;
    }
    async upsertInventory(variantId, storeId, tenantId, quantity, minStock, maxStock) {
        return this.prisma.inventory.upsert({
            where: { variantId_storeId: { variantId, storeId } },
            create: { variantId, storeId, tenantId, quantity, minStock, maxStock },
            update: {
                quantity,
                ...(minStock !== undefined && { minStock }),
                ...(maxStock !== undefined && { maxStock }),
            },
        });
    }
    async incrementStock(variantId, storeId, tenantId, delta) {
        return this.prisma.inventory.upsert({
            where: { variantId_storeId: { variantId, storeId } },
            create: { variantId, storeId, tenantId, quantity: Math.max(0, delta) },
            update: { quantity: { increment: delta } },
        });
    }
    async updateSettings(variantId, storeId, minStock, maxStock) {
        return this.prisma.inventory.update({
            where: { variantId_storeId: { variantId, storeId } },
            data: {
                ...(minStock !== undefined && { minStock }),
                ...(maxStock !== undefined && { maxStock }),
            },
        });
    }
    async createMovement(params) {
        return this.prisma.inventoryMovement.create({
            data: {
                tenantId: params.tenantId,
                inventory: { connect: { id: params.inventoryId } }, // ← connect en lugar de campo directo
                type: params.type,
                quantity: params.quantity,
                previousQuantity: params.previousQuantity,
                newQuantity: params.newQuantity,
                reason: params.reason,
                referenceId: params.referenceId,
                userId: params.userId,
            },
        });
    }
    async findMovements(tenantId, filters) {
        const { variantId, storeId, type, page = 1, limit = 20 } = filters;
        const skip = (page - 1) * limit;
        const where = { tenantId };
        // Filtramos por variantId/storeId navegando a través de la relación inventory
        if (variantId || storeId) {
            where['inventory'] = {
                ...(variantId && { variantId }),
                ...(storeId && { storeId }),
            };
        }
        if (type)
            where['type'] = type;
        const [items, total] = await Promise.all([
            this.prisma.inventoryMovement.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    inventory: {
                        include: {
                            variant: {
                                include: {
                                    product: { select: { id: true, name: true } },
                                },
                            },
                            store: true,
                        },
                    },
                },
            }),
            this.prisma.inventoryMovement.count({ where }),
        ]);
        return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
};
exports.InventoryRepository = InventoryRepository;
exports.InventoryRepository = InventoryRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventoryRepository);
