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
exports.BrandsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
function toSlug(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}
let BrandsRepository = class BrandsRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(tenantId) {
        return this.prisma.brand.findMany({
            where: { tenantId, deletedAt: null },
            orderBy: { name: 'asc' },
        });
    }
    async findById(id, tenantId) {
        return this.prisma.brand.findFirst({
            where: { id, tenantId, deletedAt: null },
        });
    }
    async findBySlug(slug, tenantId) {
        return this.prisma.brand.findFirst({
            where: { slug, tenantId, deletedAt: null },
        });
    }
    async create(tenantId, dto) {
        const slug = toSlug(dto.name);
        return this.prisma.brand.create({
            data: {
                tenantId,
                name: dto.name,
                slug,
                description: dto.description,
                logoUrl: dto.logoUrl,
            },
        });
    }
    async update(id, dto) {
        const data = { ...dto };
        if (dto.name)
            data.slug = toSlug(dto.name);
        return this.prisma.brand.update({ where: { id }, data });
    }
    async softDelete(id) {
        return this.prisma.brand.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
};
exports.BrandsRepository = BrandsRepository;
exports.BrandsRepository = BrandsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BrandsRepository);
