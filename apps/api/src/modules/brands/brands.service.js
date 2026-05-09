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
exports.BrandsService = void 0;
const common_1 = require("@nestjs/common");
const brands_repository_1 = require("./brands.repository");
let BrandsService = class BrandsService {
    brandsRepository;
    constructor(brandsRepository) {
        this.brandsRepository = brandsRepository;
    }
    findAll(tenantId) {
        return this.brandsRepository.findAll(tenantId);
    }
    async findById(id, tenantId) {
        const brand = await this.brandsRepository.findById(id, tenantId);
        if (!brand)
            throw new common_1.NotFoundException('Brand not found');
        return brand;
    }
    async create(tenantId, dto) {
        const slug = dto.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        const existing = await this.brandsRepository.findBySlug(slug, tenantId);
        if (existing)
            throw new common_1.ConflictException('Brand with this name already exists');
        return this.brandsRepository.create(tenantId, dto);
    }
    async update(id, tenantId, dto) {
        await this.findById(id, tenantId);
        return this.brandsRepository.update(id, dto);
    }
    async remove(id, tenantId) {
        await this.findById(id, tenantId);
        await this.brandsRepository.softDelete(id);
        return { message: 'Brand deleted successfully' };
    }
};
exports.BrandsService = BrandsService;
exports.BrandsService = BrandsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [brands_repository_1.BrandsRepository])
], BrandsService);
