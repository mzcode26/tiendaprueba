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
exports.SalesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const sales_repository_1 = require("./sales.repository");
const inventory_repository_1 = require("../inventory/inventory.repository");
const client_1 = require("@prisma/client");
let SalesService = class SalesService {
    salesRepository;
    inventoryRepository;
    prisma;
    constructor(salesRepository, inventoryRepository, prisma) {
        this.salesRepository = salesRepository;
        this.inventoryRepository = inventoryRepository;
        this.prisma = prisma;
    }
    findAll(tenantId, query) {
        return this.salesRepository.findAll(tenantId, query);
    }
    async findById(id, tenantId) {
        const sale = await this.salesRepository.findById(id, tenantId);
        if (!sale)
            throw new common_1.NotFoundException('Sale not found');
        return sale;
    }
    async create(tenantId, userId, dto) {
        // Validate stock for all items
        for (const item of dto.items) {
            const inventory = await this.inventoryRepository.findByVariantAndStore(item.variantId, dto.storeId, tenantId);
            if (!inventory || inventory.quantity < item.quantity) {
                throw new common_1.BadRequestException(`Insufficient stock for variant ${item.variantId}`);
            }
        }
        // Validate payments sum
        const subtotal = dto.items.reduce((sum, item) => sum + item.unitPrice * item.quantity - (item.discount ?? 0), 0);
        const total = subtotal - (dto.discountAmount ?? 0) + (dto.taxAmount ?? 0);
        const paymentTotal = (dto.payments ?? []).reduce((sum, p) => sum + p.amount, 0);
        if (paymentTotal < total) {
            throw new common_1.BadRequestException(`Payment total (${paymentTotal}) is less than sale total (${total})`);
        }
        const saleNumber = await this.salesRepository.generateSaleNumber(tenantId);
        return this.prisma.$transaction(async () => {
            const sale = await this.salesRepository.create(tenantId, userId, saleNumber, dto, subtotal, total);
            // Decrement inventory for each item
            for (const item of dto.items) {
                const current = await this.inventoryRepository.findByVariantAndStore(item.variantId, dto.storeId, tenantId);
                const updated = await this.inventoryRepository.incrementStock(item.variantId, dto.storeId, tenantId, -item.quantity);
                await this.inventoryRepository.createMovement({
                    tenantId,
                    inventoryId: updated.id,
                    type: client_1.InventoryMovementType.SALE,
                    quantity: item.quantity,
                    previousQuantity: current?.quantity ?? 0,
                    newQuantity: (current?.quantity ?? 0) - item.quantity,
                    referenceId: saleNumber, // ← usamos saleNumber local, no sale.saleNumber
                    userId,
                });
            }
            return sale;
        });
    }
    async cancel(id, tenantId, userId, dto) {
        const sale = await this.findById(id, tenantId);
        if (sale.status !== 'COMPLETED' && sale.status !== 'PENDING') {
            throw new common_1.BadRequestException('Only pending or completed sales can be cancelled');
        }
        return this.prisma.$transaction(async () => {
            await this.salesRepository.updateStatus(id, 'CANCELLED', dto.reason);
            for (const item of sale.items) {
                const current = await this.inventoryRepository.findByVariantAndStore(item.variantId, sale.storeId, tenantId);
                const updated = await this.inventoryRepository.incrementStock(item.variantId, sale.storeId, tenantId, item.quantity);
                await this.inventoryRepository.createMovement({
                    tenantId,
                    inventoryId: updated.id,
                    type: client_1.InventoryMovementType.RETURN,
                    quantity: item.quantity,
                    previousQuantity: current?.quantity ?? 0,
                    newQuantity: (current?.quantity ?? 0) + item.quantity,
                    referenceId: sale.number ?? id, // ajustá al campo real del schema
                    userId,
                });
            }
            return { message: 'Sale cancelled successfully' };
        });
    }
    async refund(id, tenantId, userId, dto) {
        const sale = await this.findById(id, tenantId);
        if (sale.status !== 'COMPLETED') {
            throw new common_1.BadRequestException('Only completed sales can be refunded');
        }
        const saleItemsMap = new Map(sale.items.map((i) => [i.id, i]));
        for (const refundItem of dto.items) {
            const saleItem = saleItemsMap.get(refundItem.saleItemId);
            if (!saleItem) {
                throw new common_1.BadRequestException(`Sale item ${refundItem.saleItemId} not found`);
            }
            if (refundItem.quantity > saleItem.quantity) {
                throw new common_1.BadRequestException(`Refund quantity exceeds sold quantity for item ${refundItem.saleItemId}`);
            }
        }
        return this.prisma.$transaction(async () => {
            await this.salesRepository.updateStatus(id, 'REFUNDED', dto.reason);
            for (const refundItem of dto.items) {
                const saleItem = saleItemsMap.get(refundItem.saleItemId);
                const current = await this.inventoryRepository.findByVariantAndStore(saleItem.variantId, sale.storeId, tenantId);
                const updated = await this.inventoryRepository.incrementStock(saleItem.variantId, sale.storeId, tenantId, refundItem.quantity);
                await this.inventoryRepository.createMovement({
                    tenantId,
                    inventoryId: updated.id,
                    type: client_1.InventoryMovementType.RETURN,
                    quantity: refundItem.quantity,
                    previousQuantity: current?.quantity ?? 0,
                    newQuantity: (current?.quantity ?? 0) + refundItem.quantity,
                    referenceId: sale.number ?? id, // ajustá al campo real del schema
                    userId,
                });
            }
            return { message: 'Refund processed successfully' };
        });
    }
    getSummary(tenantId, storeId, dateFrom, dateTo) {
        return this.salesRepository.getSummary(tenantId, storeId, dateFrom, dateTo);
    }
};
exports.SalesService = SalesService;
exports.SalesService = SalesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sales_repository_1.SalesRepository,
        inventory_repository_1.InventoryRepository,
        prisma_service_1.PrismaService])
], SalesService);
