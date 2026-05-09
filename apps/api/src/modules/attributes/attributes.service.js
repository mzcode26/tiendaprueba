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
exports.AttributesService = void 0;
const common_1 = require("@nestjs/common");
const attributes_repository_1 = require("./attributes.repository");
let AttributesService = class AttributesService {
    attributesRepository;
    constructor(attributesRepository) {
        this.attributesRepository = attributesRepository;
    }
    findAll(tenantId) {
        return this.attributesRepository.findAll(tenantId);
    }
    async findById(id, tenantId) {
        const attribute = await this.attributesRepository.findById(id, tenantId);
        if (!attribute)
            throw new common_1.NotFoundException('Attribute not found');
        return attribute;
    }
    async create(tenantId, dto) {
        const slug = dto.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        const existing = await this.attributesRepository.findBySlug(slug, tenantId);
        if (existing)
            throw new common_1.ConflictException('Attribute with this name already exists');
        return this.attributesRepository.create(tenantId, dto);
    }
    async update(id, tenantId, dto) {
        await this.findById(id, tenantId);
        return this.attributesRepository.update(id, dto);
    }
    async addValue(id, tenantId, dto) {
        await this.findById(id, tenantId);
        return this.attributesRepository.addValue(id, tenantId, dto.value);
    }
    async removeValue(id, tenantId, valueId) {
        await this.findById(id, tenantId);
        return this.attributesRepository.removeValue(valueId);
    }
    async remove(id, tenantId) {
        await this.findById(id, tenantId);
        await this.attributesRepository.softDelete(id);
        return { message: 'Attribute deleted successfully' };
    }
};
exports.AttributesService = AttributesService;
exports.AttributesService = AttributesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [attributes_repository_1.AttributesRepository])
], AttributesService);
