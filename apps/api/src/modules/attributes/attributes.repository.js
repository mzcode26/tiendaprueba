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
exports.AttributesRepository = void 0;
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
let AttributesRepository = class AttributesRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(tenantId) {
        return this.prisma.attribute.findMany({
            where: { tenantId, deletedAt: null },
            include: {
                values: { where: { deletedAt: null }, orderBy: { value: 'asc' } },
            },
            orderBy: { name: 'asc' },
        });
    }
    async findById(id, tenantId) {
        return this.prisma.attribute.findFirst({
            where: { id, tenantId, deletedAt: null },
            include: {
                values: { where: { deletedAt: null }, orderBy: { value: 'asc' } },
            },
        });
    }
    async findBySlug(slug, tenantId) {
        return this.prisma.attribute.findFirst({
            where: { slug, tenantId, deletedAt: null },
        });
    }
    async create(tenantId, dto) {
        const slug = toSlug(dto.name);
        return this.prisma.attribute.create({
            data: {
                tenantId,
                name: dto.name,
                slug,
                values: dto.values
                    ? {
                        create: dto.values.map((v) => ({
                            tenantId,
                            value: v.value,
                            slug: toSlug(v.value),
                        })),
                    }
                    : undefined,
            },
            include: {
                values: { where: { deletedAt: null } },
            },
        });
    }
    async update(id, dto) {
        const data = { ...dto };
        if (dto.name)
            data.slug = toSlug(dto.name);
        return this.prisma.attribute.update({ where: { id }, data });
    }
    async addValue(attributeId, tenantId, value) {
        const slug = toSlug(value);
        return this.prisma.attributeValue.create({
            data: { attributeId, tenantId, value, slug },
        });
    }
    async removeValue(valueId) {
        return this.prisma.attributeValue.update({
            where: { id: valueId },
            data: { deletedAt: new Date() },
        });
    }
    async softDelete(id) {
        return this.prisma.attribute.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
};
exports.AttributesRepository = AttributesRepository;
exports.AttributesRepository = AttributesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttributesRepository);
