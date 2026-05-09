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
exports.PosController = void 0;
const common_1 = require("@nestjs/common");
const pos_service_1 = require("./pos.service");
const create_sale_dto_1 = require("../sales/dto/create-sale.dto");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../auth/decorators/require-permissions.decorator");
let PosController = class PosController {
    posService;
    constructor(posService) {
        this.posService = posService;
    }
    searchProducts(user, query, storeId) {
        return this.posService.searchProducts(user.tenantId, { q: query, storeId });
    }
    getStoreSummary(storeId, user) {
        return this.posService.getStoreInventorySummary(user.tenantId, storeId);
    }
    getDailySummary(storeId, user) {
        return this.posService.getDailySummary(user.tenantId, storeId);
    }
    quickSale(dto, user) {
        return this.posService.quickSale(user.tenantId, user.sub, dto);
    }
};
exports.PosController = PosController;
__decorate([
    (0, common_1.Get)('search'),
    (0, require_permissions_decorator_1.RequirePermissions)('create_sales'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('q')),
    __param(2, (0, common_1.Query)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], PosController.prototype, "searchProducts", null);
__decorate([
    (0, common_1.Get)('store/:storeId/summary'),
    (0, require_permissions_decorator_1.RequirePermissions)('view_inventory'),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PosController.prototype, "getStoreSummary", null);
__decorate([
    (0, common_1.Get)('store/:storeId/daily-summary'),
    (0, require_permissions_decorator_1.RequirePermissions)('view_reports'),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PosController.prototype, "getDailySummary", null);
__decorate([
    (0, common_1.Post)('quick-sale'),
    (0, require_permissions_decorator_1.RequirePermissions)('create_sales'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sale_dto_1.CreateSaleDto, Object]),
    __metadata("design:returntype", void 0)
], PosController.prototype, "quickSale", null);
exports.PosController = PosController = __decorate([
    (0, common_1.Controller)('pos'),
    __metadata("design:paramtypes", [pos_service_1.PosService])
], PosController);
