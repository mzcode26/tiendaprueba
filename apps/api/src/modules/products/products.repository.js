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
exports.ProductsRepository = void 0;
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
let ProductsRepository = class ProductsRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(tenantId, filters) {
        const { search, categoryId, brandId, isActive, page = 1, limit = 20 } = filters;
        const skip = (page - 1) * limit;
        const where = {
            tenantId,
            deletedAt: null,
            ...(isActive !== undefined && { isActive }),
            ...(categoryId && { categoryId }),
            ...(brandId && { brandId }),
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { tags: { has: search } },
                ],
            }),
        };
        const [items, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    category: true,
                    brand: true,
                    images: { orderBy: { position: 'asc' } },
                    variants: {
                        where: { deletedAt: null },
                        include: {
                            attributes: {
                                include: { attribute: true, attributeValue: true },
                            },
                        },
                    },
                },
            }),
            this.prisma.product.count({ where }),
        ]);
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findById(id, tenantId) {
        return this.prisma.product.findFirst({
            where: { id, tenantId, deletedAt: null },
            include: {
                category: true,
                brand: true,
                images: { orderBy: { position: 'asc' } },
                variants: {
                    where: { deletedAt: null },
                    include: {
                        attributes: {
                            include: { attribute: true, attributeValue: true },
                        },
                        inventory: {
                            include: { store: true },
                        },
                    },
                },
            },
        });
    }
    async findBySlug(slug, tenantId) {
        return this.prisma.product.findFirst({
            where: { slug, tenantId, deletedAt: null },
        });
    }
    async findVariantBySku(sku, tenantId) {
        return this.prisma.productVariant.findFirst({
            where: { sku, tenantId, deletedAt: null },
        });
    }
    async create(tenantId, dto) {
        const slug = toSlug(dto.name);
        return this.prisma.product.create({
            data: {
                tenantId,
                name: dto.name,
                slug,
                description: dto.description,
                categoryId: dto.categoryId,
                brandId: dto.brandId,
                isActive: dto.isActive ?? true,
                tags: dto.tags ?? [],
                variants: dto.variants
                    ? {
                        create: dto.variants.map((v) => ({
                            tenantId,
                            sku: v.sku,
                            barcode: v.barcode,
                            price: v.price,
                            compareAtPrice: v.compareAtPrice,
                            costPrice: v.costPrice,
                            isActive: v.isActive ?? true,
                            attributes: v.attributes
                                ? {
                                    create: v.attributes.map((a) => ({
                                        attributeId: a.attributeId,
                                        attributeValueId: a.attributeValueId,
                                    })),
                                }
                                : undefined,
                        })),
                    }
                    : undefined,
            },
            include: {
                category: true,
                brand: true,
                variants: {
                    include: {
                        attributes: {
                            include: { attribute: true, attributeValue: true },
                        },
                    },
                },
                images: true,
            },
        });
    }
    async update(id, dto) {
        const data = { ...dto };
        if (dto.name)
            data.slug = toSlug(dto.name);
        return this.prisma.product.update({
            where: { id },
            data,
            include: {
                category: true,
                brand: true,
                variants: { where: { deletedAt: null } },
                images: true,
            },
        });
    }
    async createVariant(productId, tenantId, dto) {
        return this.prisma.productVariant.create({
            data: {
                productId,
                tenantId,
                sku: dto.sku,
                barcode: dto.barcode,
                price: dto.price,
                compareAtPrice: dto.compareAtPrice,
                costPrice: dto.costPrice,
                isActive: dto.isActive ?? true,
                attributes: dto.attributes
                    ? {
                        create: dto.attributes.map((a) => ({
                            attributeId: a.attributeId,
                            attributeValueId: a.attributeValueId,
                        })),
                    }
                    : undefined,
            },
            include: {
                attributes: {
                    include: { attribute: true, attributeValue: true },
                },
            },
        });
    }
    async updateVariant(variantId, dto) {
        return this.prisma.productVariant.update({
            where: { id: variantId },
            data: {
                ...(dto.sku && { sku: dto.sku }),
                ...(dto.barcode !== undefined && { barcode: dto.barcode }),
                ...(dto.price !== undefined && { price: dto.price }),
                ...(dto.compareAtPrice !== undefined && { compareAtPrice: dto.compareAtPrice }),
                ...(dto.costPrice !== undefined && { costPrice: dto.costPrice }),
                ...(dto.isActive !== undefined && { isActive: dto.isActive }),
            },
        });
    }
    async softDeleteVariant(variantId) {
        return this.prisma.productVariant.update({
            where: { id: variantId },
            data: { deletedAt: new Date() },
        });
    }
    async addImage(productId, tenantId, dto) {
        return this.prisma.productImage.create({
            data: {
                productId,
                tenantId,
                url: dto.url,
                altText: dto.altText,
                position: dto.position ?? 0,
                isPrimary: dto.isPrimary ?? false,
            },
        });
    }
    async removeImage(imageId) {
        return this.prisma.productImage.delete({ where: { id: imageId } });
    }
    async softDelete(id) {
        return this.prisma.product.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
};
exports.ProductsRepository = ProductsRepository;
exports.ProductsRepository = ProductsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsRepository);
