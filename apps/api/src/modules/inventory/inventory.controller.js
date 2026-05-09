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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const inventory_service_1 = require("./inventory.service");
const adjust_stock_dto_1 = require("./dto/adjust-stock.dto");
const transfer_stock_dto_1 = require("./dto/transfer-stock.dto");
const update_inventory_settings_dto_1 = require("./dto/update-inventory-settings.dto");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../auth/decorators/require-permissions.decorator");
const client_1 = require("@prisma/client");
let InventoryController = class InventoryController {
    inventoryService;
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    getByStore(storeId, user) {
        return this.inventoryService.getByStore(storeId, user.tenantId);
    }
    getByVariantAndStore(storeId, variantId, user) {
        return this.inventoryService.getByVariantAndStore(variantId, storeId, user.tenantId);
    }
    getLowStock(user) {
        return this.inventoryService.getLowStock(user.tenantId);
    }
    getMovements(user, variantId, storeId, type, page, limit) {
        return this.inventoryService.getMovements(user.tenantId, {
            variantId,
            storeId,
            type,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20,
        });
    }
    adjustStock(dto, user) {
        return this.inventoryService.adjustStock(user.tenantId, user.sub, dto);
    }
    transferStock(dto, user) {
        return this.inventoryService.transferStock(user.tenantId, user.sub, dto);
    }
    updateSettings(storeId, variantId, dto, user) {
        return this.inventoryService.updateSettings(variantId, storeId, user.tenantId, dto);
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Get)('store/:storeId'),
    (0, require_permissions_decorator_1.RequirePermissions)('view_inventory'),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "getByStore", null);
__decorate([
    (0, common_1.Get)('store/:storeId/variant/:variantId'),
    (0, require_permissions_decorator_1.RequirePermissions)('view_inventory'),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, common_1.Param)('variantId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "getByVariantAndStore", null);
__decorate([
    (0, common_1.Get)('low-stock'),
    (0, require_permissions_decorator_1.RequirePermissions)('view_inventory'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "getLowStock", null);
__decorate([
    (0, common_1.Get)('movements'),
    (0, require_permissions_decorator_1.RequirePermissions)('view_inventory'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('variantId')),
    __param(2, (0, common_1.Query)('storeId')),
    __param(3, (0, common_1.Query)('type')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "getMovements", null);
__decorate([
    (0, common_1.Post)('adjust'),
    (0, require_permissions_decorator_1.RequirePermissions)('manage_inventory'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [adjust_stock_dto_1.AdjustStockDto, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "adjustStock", null);
__decorate([
    (0, common_1.Post)('transfer'),
    (0, require_permissions_decorator_1.RequirePermissions)('manage_inventory'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transfer_stock_dto_1.TransferStockDto, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "transferStock", null);
__decorate([
    (0, common_1.Patch)('settings/:storeId/:variantId'),
    (0, require_permissions_decorator_1.RequirePermissions)('manage_inventory'),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, common_1.Param)('variantId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_inventory_settings_dto_1.UpdateInventorySettingsDto, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "updateSettings", null);
exports.InventoryController = InventoryController = __decorate([
    (0, common_1.Controller)('inventory'),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService])
], InventoryController);
