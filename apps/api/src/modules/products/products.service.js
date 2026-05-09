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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const products_repository_1 = require("./products.repository");
let ProductsService = class ProductsService {
    productsRepository;
    constructor(productsRepository) {
        this.productsRepository = productsRepository;
    }
    findAll(tenantId, filters) {
        return this.productsRepository.findAll(tenantId, filters);
    }
    async findById(id, tenantId) {
        const product = await this.productsRepository.findById(id, tenantId);
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return product;
    }
    async create(tenantId, dto) {
        const slug = dto.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        const existing = await this.productsRepository.findBySlug(slug, tenantId);
        if (existing)
            throw new common_1.ConflictException('Product with this name already exists');
        if (dto.variants) {
            for (const variant of dto.variants) {
                const skuExists = await this.productsRepository.findVariantBySku(variant.sku, tenantId);
                if (skuExists) {
                    throw new common_1.ConflictException(`SKU "${variant.sku}" already exists`);
                }
            }
        }
        return this.productsRepository.create(tenantId, dto);
    }
    async update(id, tenantId, dto) {
        await this.findById(id, tenantId);
        return this.productsRepository.update(id, dto);
    }
    async addVariant(productId, tenantId, dto) {
        await this.findById(productId, tenantId);
        const skuExists = await this.productsRepository.findVariantBySku(dto.sku, tenantId);
        if (skuExists)
            throw new common_1.ConflictException(`SKU "${dto.sku}" already exists`);
        return this.productsRepository.createVariant(productId, tenantId, dto);
    }
    async updateVariant(productId, variantId, tenantId, dto) {
        await this.findById(productId, tenantId);
        if (dto.sku) {
            const skuExists = await this.productsRepository.findVariantBySku(dto.sku, tenantId);
            if (skuExists && skuExists.id !== variantId) {
                throw new common_1.ConflictException(`SKU "${dto.sku}" already exists`);
            }
        }
        return this.productsRepository.updateVariant(variantId, dto);
    }
    async removeVariant(productId, variantId, tenantId) {
        await this.findById(productId, tenantId);
        await this.productsRepository.softDeleteVariant(variantId);
        return { message: 'Variant deleted successfully' };
    }
    async addImage(productId, tenantId, dto) {
        await this.findById(productId, tenantId);
        return this.productsRepository.addImage(productId, tenantId, dto);
    }
    async removeImage(productId, imageId, tenantId) {
        await this.findById(productId, tenantId);
        await this.productsRepository.removeImage(imageId);
        return { message: 'Image deleted successfully' };
    }
    async remove(id, tenantId) {
        await this.findById(id, tenantId);
        await this.productsRepository.softDelete(id);
        return { message: 'Product deleted successfully' };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [products_repository_1.ProductsRepository])
], ProductsService);
