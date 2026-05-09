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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const inventory_repository_1 = require("./inventory.repository");
const adjust_stock_dto_1 = require("./dto/adjust-stock.dto");
const client_1 = require("@prisma/client"); // ← nombre correcto
let InventoryService = class InventoryService {
    inventoryRepository;
    prisma;
    constructor(inventoryRepository, prisma) {
        this.inventoryRepository = inventoryRepository;
        this.prisma = prisma;
    }
    async getByStore(storeId, tenantId) {
        return this.inventoryRepository.findByStore(storeId, tenantId);
    }
    async getByVariantAndStore(variantId, storeId, tenantId) {
        const inventory = await this.inventoryRepository.findByVariantAndStore(variantId, storeId, tenantId);
        if (!inventory)
            throw new common_1.NotFoundException('Inventory record not found');
        return inventory;
    }
    async getLowStock(tenantId) {
        return this.inventoryRepository.findLowStock(tenantId);
    }
    async adjustStock(tenantId, userId, dto) {
        const current = await this.inventoryRepository.findByVariantAndStore(dto.variantId, dto.storeId, tenantId);
        const previousQuantity = current?.quantity ?? 0;
        let newQuantity;
        switch (dto.type) {
            case adjust_stock_dto_1.AdjustmentType.ADD:
                newQuantity = previousQuantity + dto.quantity;
                break;
            case adjust_stock_dto_1.AdjustmentType.REMOVE:
                newQuantity = previousQuantity - dto.quantity;
                if (newQuantity < 0)
                    throw new common_1.BadRequestException('Insufficient stock');
                break;
            case adjust_stock_dto_1.AdjustmentType.SET:
                if (dto.quantity < 0)
                    throw new common_1.BadRequestException('Stock cannot be negative');
                newQuantity = dto.quantity;
                break;
            default:
                throw new common_1.BadRequestException('Invalid adjustment type');
        }
        const movementTypeMap = {
            [adjust_stock_dto_1.AdjustmentType.ADD]: client_1.InventoryMovementType.ADJUSTMENT_IN,
            [adjust_stock_dto_1.AdjustmentType.REMOVE]: client_1.InventoryMovementType.ADJUSTMENT_OUT,
            [adjust_stock_dto_1.AdjustmentType.SET]: client_1.InventoryMovementType.ADJUSTMENT_IN,
        };
        return this.prisma.$transaction(async () => {
            // Upsert inventory y obtener el id resultante
            const inventory = await this.inventoryRepository.upsertInventory(dto.variantId, dto.storeId, tenantId, newQuantity);
            // Ahora pasamos inventoryId en lugar de variantId/storeId
            await this.inventoryRepository.createMovement({
                tenantId,
                inventoryId: inventory.id,
                type: movementTypeMap[dto.type],
                quantity: Math.abs(newQuantity - previousQuantity),
                previousQuantity,
                newQuantity,
                reason: dto.reason,
                referenceId: dto.reference,
                userId,
            });
            return inventory;
        });
    }
    async transferStock(tenantId, userId, dto) {
        const source = await this.inventoryRepository.findByVariantAndStore(dto.variantId, dto.fromStoreId, tenantId);
        if (!source || source.quantity < dto.quantity) {
            throw new common_1.BadRequestException('Insufficient stock in source store');
        }
        return this.prisma.$transaction(async () => {
            // Decrement source
            const updatedSource = await this.inventoryRepository.incrementStock(dto.variantId, dto.fromStoreId, tenantId, -dto.quantity);
            // Increment destination
            const updatedDest = await this.inventoryRepository.incrementStock(dto.variantId, dto.toStoreId, tenantId, dto.quantity);
            // Movement OUT — usamos id del inventory source
            await this.inventoryRepository.createMovement({
                tenantId,
                inventoryId: updatedSource.id,
                type: client_1.InventoryMovementType.TRANSFER_OUT,
                quantity: dto.quantity,
                previousQuantity: source.quantity,
                newQuantity: source.quantity - dto.quantity,
                reason: dto.notes,
                userId,
            });
            // Movement IN — usamos id del inventory destino
            const destPreviousQty = (updatedDest.quantity) - dto.quantity; // antes del increment
            await this.inventoryRepository.createMovement({
                tenantId,
                inventoryId: updatedDest.id,
                type: client_1.InventoryMovementType.TRANSFER_IN,
                quantity: dto.quantity,
                previousQuantity: destPreviousQty,
                newQuantity: updatedDest.quantity,
                reason: dto.notes,
                userId,
            });
            return { message: 'Transfer completed successfully' };
        });
    }
    async updateSettings(variantId, storeId, tenantId, dto) {
        const inventory = await this.inventoryRepository.findByVariantAndStore(variantId, storeId, tenantId);
        if (!inventory)
            throw new common_1.NotFoundException('Inventory record not found');
        return this.inventoryRepository.updateSettings(variantId, storeId, dto.minStock, dto.maxStock);
    }
    async getMovements(tenantId, filters) {
        return this.inventoryRepository.findMovements(tenantId, filters);
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [inventory_repository_1.InventoryRepository,
        prisma_service_1.PrismaService])
], InventoryService);
