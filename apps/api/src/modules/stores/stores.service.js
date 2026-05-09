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
exports.StoresService = void 0;
const common_1 = require("@nestjs/common");
const stores_repository_1 = require("./stores.repository");
let StoresService = class StoresService {
    storesRepository;
    constructor(storesRepository) {
        this.storesRepository = storesRepository;
    }
    async findAll(tenantId, includeInactive = false) {
        return this.storesRepository.findAll(tenantId, includeInactive);
    }
    async findById(id, tenantId) {
        const store = await this.storesRepository.findById(id, tenantId);
        if (!store)
            throw new common_1.NotFoundException('Store not found');
        return store;
    }
    async create(tenantId, dto) {
        return this.storesRepository.create(tenantId, dto);
    }
    async update(id, tenantId, dto) {
        await this.findById(id, tenantId);
        return this.storesRepository.update(id, dto);
    }
    async remove(id, tenantId) {
        await this.findById(id, tenantId);
        await this.storesRepository.softDelete(id);
        return { message: 'Store deleted successfully' };
    }
};
exports.StoresService = StoresService;
exports.StoresService = StoresService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [stores_repository_1.StoresRepository])
], StoresService);
