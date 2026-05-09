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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const reports_service_1 = require("./reports.service");
const query_report_dto_1 = require("./dto/query-report.dto");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../auth/decorators/require-permissions.decorator");
let ReportsController = class ReportsController {
    reportsService;
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    getDashboard(user, storeId) {
        return this.reportsService.getDashboardSummary(user.tenantId, storeId);
    }
    getSalesOverTime(user, query) {
        return this.reportsService.getSalesOverTime(user.tenantId, query);
    }
    getTopProducts(user, query) {
        return this.reportsService.getTopProducts(user.tenantId, query);
    }
    getTopCustomers(user, query) {
        return this.reportsService.getTopCustomers(user.tenantId, query);
    }
    getRevenueByCategory(user, query) {
        return this.reportsService.getRevenueByCategory(user.tenantId, query);
    }
    getRevenueByPaymentMethod(user, query) {
        return this.reportsService.getRevenueByPaymentMethod(user.tenantId, query);
    }
    getInventoryValuation(user, storeId) {
        return this.reportsService.getInventoryValuation(user.tenantId, storeId);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, require_permissions_decorator_1.RequirePermissions)('view_reports'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('sales-over-time'),
    (0, require_permissions_decorator_1.RequirePermissions)('view_reports'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_report_dto_1.QueryReportDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getSalesOverTime", null);
__decorate([
    (0, common_1.Get)('top-products'),
    (0, require_permissions_decorator_1.RequirePermissions)('view_reports'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_report_dto_1.QueryReportDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getTopProducts", null);
__decorate([
    (0, common_1.Get)('top-customers'),
    (0, require_permissions_decorator_1.RequirePermissions)('view_reports'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_report_dto_1.QueryReportDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getTopCustomers", null);
__decorate([
    (0, common_1.Get)('revenue-by-category'),
    (0, require_permissions_decorator_1.RequirePermissions)('view_reports'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_report_dto_1.QueryReportDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getRevenueByCategory", null);
__decorate([
    (0, common_1.Get)('revenue-by-payment-method'),
    (0, require_permissions_decorator_1.RequirePermissions)('view_reports'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_report_dto_1.QueryReportDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getRevenueByPaymentMethod", null);
__decorate([
    (0, common_1.Get)('inventory-valuation'),
    (0, require_permissions_decorator_1.RequirePermissions)('view_reports'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getInventoryValuation", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.Controller)('reports'),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
