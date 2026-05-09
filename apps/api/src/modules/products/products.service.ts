import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { CreateProductDto, CreateProductVariantDto } from './dto/create-product.dto';
import { UpdateProductDto, UpdateProductVariantDto } from './dto/update-product.dto';
import { CreateProductImageDto } from './dto/create-product-image.dto';

@Injectable()
export class ProductsService {
  constructor(private productsRepository: ProductsRepository) {}

  findAll(
    tenantId: string,
    filters: {
      search?: string;
      categoryId?: string;
      brandId?: string;
      isActive?: boolean;
      page?: number;
      limit?: number;
    },
  ) {
    return this.productsRepository.findAll(tenantId, filters);
  }

  async findById(id: string, tenantId: string) {
    const product = await this.productsRepository.findById(id, tenantId);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(tenantId: string, dto: CreateProductDto) {
    const slug = dto.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const existing = await this.productsRepository.findBySlug(slug, tenantId);
    if (existing) throw new ConflictException('Product with this name already exists');

    if (dto.variants) {
      for (const variant of dto.variants) {
        const skuExists = await this.productsRepository.findVariantBySku(
          variant.sku,
          tenantId,
        );
        if (skuExists) {
          throw new ConflictException(`SKU "${variant.sku}" already exists`);
        }
      }
    }

    return this.productsRepository.create(tenantId, dto);
  }

  async update(id: string, tenantId: string, dto: UpdateProductDto) {
    await this.findById(id, tenantId);
    return this.productsRepository.update(id, dto);
  }

  async addVariant(
    productId: string,
    tenantId: string,
    dto: CreateProductVariantDto,
  ) {
    await this.findById(productId, tenantId);

    const skuExists = await this.productsRepository.findVariantBySku(
      dto.sku,
      tenantId,
    );
    if (skuExists) throw new ConflictException(`SKU "${dto.sku}" already exists`);

    return this.productsRepository.createVariant(productId, tenantId, dto);
  }

  async updateVariant(
    productId: string,
    variantId: string,
    tenantId: string,
    dto: UpdateProductVariantDto,
  ) {
    await this.findById(productId, tenantId);

    if (dto.sku) {
      const skuExists = await this.productsRepository.findVariantBySku(
        dto.sku,
        tenantId,
      );
      if (skuExists && skuExists.id !== variantId) {
        throw new ConflictException(`SKU "${dto.sku}" already exists`);
      }
    }

    return this.productsRepository.updateVariant(variantId, dto);
  }

  async removeVariant(productId: string, variantId: string, tenantId: string) {
    await this.findById(productId, tenantId);
    await this.productsRepository.softDeleteVariant(variantId);
    return { message: 'Variant deleted successfully' };
  }

  async addImage(
    productId: string,
    tenantId: string,
    dto: CreateProductImageDto,
  ) {
    await this.findById(productId, tenantId);
    return this.productsRepository.addImage(productId, tenantId, dto);
  }

  async removeImage(productId: string, imageId: string, tenantId: string) {
    await this.findById(productId, tenantId);
    await this.productsRepository.removeImage(imageId);
    return { message: 'Image deleted successfully' };
  }

  async remove(id: string, tenantId: string) {
    await this.findById(id, tenantId);
    await this.productsRepository.softDelete(id);
    return { message: 'Product deleted successfully' };
  }
}