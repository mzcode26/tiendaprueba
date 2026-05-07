import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { generateSlug } from '@tienda/shared-utils';
import { ProductsRepository } from './products.repository';

@Injectable()
export class ProductsService {
  constructor(
    private readonly repository: ProductsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(tenantId: string, filters: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    brandId?: string;
    isActive?: boolean;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    return this.repository.findAll(tenantId, { page, limit, ...filters });
  }

  async findById(id: string, tenantId: string) {
    const product = await this.repository.findById(id, tenantId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async create(tenantId: string, data: any) {
    // Validate category exists
    if (data.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: { id: data.categoryId, tenantId, deletedAt: null },
      });
      if (!category) {
        throw new BadRequestException('Category not found');
      }
    }

    // Validate brand exists
    if (data.brandId) {
      const brand = await this.prisma.brand.findFirst({
        where: { id: data.brandId, tenantId, deletedAt: null },
      });
      if (!brand) {
        throw new BadRequestException('Brand not found');
      }
    }

    // Generate slug if not provided
    if (!data.slug) {
      data.slug = generateSlug(data.name);
    }

    // Check for duplicate SKU
    if (data.sku) {
      const existing = await this.repository.findBySku(data.sku, tenantId);
      if (existing) {
        throw new BadRequestException('Product SKU already exists');
      }
    }

    // Validate variants
    if (data.variants && data.variants.length > 0) {
      await this.validateVariants(tenantId, data.variants);
    }

    return this.repository.create(tenantId, data);
  }

  async update(id: string, tenantId: string, data: any) {
    const product = await this.findById(id, tenantId);

    // Validate category exists
    if (data.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: { id: data.categoryId, tenantId, deletedAt: null },
      });
      if (!category) {
        throw new BadRequestException('Category not found');
      }
    }

    // Validate brand exists
    if (data.brandId) {
      const brand = await this.prisma.brand.findFirst({
        where: { id: data.brandId, tenantId, deletedAt: null },
      });
      if (!brand) {
        throw new BadRequestException('Brand not found');
      }
    }

    // Generate slug if name changed and slug not provided
    if (data.name && !data.slug) {
      data.slug = generateSlug(data.name);
    }

    // Check for duplicate SKU
    if (data.sku && data.sku !== product.sku) {
      const existing = await this.repository.findBySku(data.sku, tenantId);
      if (existing) {
        throw new BadRequestException('Product SKU already exists');
      }
    }

    // Validate variants
    if (data.variants && data.variants.length > 0) {
      await this.validateVariants(tenantId, data.variants);
    }

    return this.repository.update(id, tenantId, data);
  }

  async remove(id: string, tenantId: string) {
    await this.findById(id, tenantId);
    await this.repository.softDelete(id, tenantId);
    return { success: true, message: 'Product deleted successfully' };
  }

  async updateInventory(id: string, tenantId: string, quantity: number) {
    if (quantity < 0) {
      throw new BadRequestException('Inventory quantity cannot be negative');
    }
    await this.findById(id, tenantId);
    return this.repository.updateInventory(id, tenantId, quantity);
  }

  async findVariantById(id: string, tenantId: string) {
    const variant = await this.repository.findVariantById(id, tenantId);
    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }
    return variant;
  }

  async updateVariantInventory(id: string, tenantId: string, quantity: number) {
    if (quantity < 0) {
      throw new BadRequestException('Inventory quantity cannot be negative');
    }
    await this.findVariantById(id, tenantId);
    return this.repository.updateVariantInventory(id, tenantId, quantity);
  }

  async addImage(productId: string, tenantId: string, data: any) {
    await this.findById(productId, tenantId);
    return this.repository.createImage(productId, tenantId, data);
  }

  async updateImageSortOrder(productId: string, imageId: string, tenantId: string, sortOrder: number) {
    await this.findById(productId, tenantId);
    const image = await this.prisma.productImage.findFirst({
      where: { id: imageId, productId, tenantId, deletedAt: null },
    });
    if (!image) {
      throw new NotFoundException('Product image not found');
    }
    return this.repository.updateImageSortOrder(imageId, tenantId, sortOrder);
  }

  async removeImage(productId: string, imageId: string, tenantId: string) {
    await this.findById(productId, tenantId);
    const image = await this.prisma.productImage.findFirst({
      where: { id: imageId, productId, tenantId, deletedAt: null },
    });
    if (!image) {
      throw new NotFoundException('Product image not found');
    }
    await this.repository.deleteImage(imageId, tenantId);
    return { success: true, message: 'Image deleted successfully' };
  }

  private async validateVariants(tenantId: string, variants: any[]) {
    for (const variant of variants) {
      // Check for duplicate SKU
      if (variant.sku) {
        const existing = await this.prisma.productVariant.findFirst({
          where: { sku: variant.sku, tenantId, deletedAt: null },
        });
        if (existing) {
          throw new BadRequestException(`Variant SKU ${variant.sku} already exists`);
        }
      }

      // Validate attributes
      if (variant.attributes && variant.attributes.length > 0) {
        for (const attr of variant.attributes) {
          const attribute = await this.prisma.attribute.findFirst({
            where: { id: attr.attributeId, tenantId, deletedAt: null },
          });
          if (!attribute) {
            throw new BadRequestException(`Attribute ${attr.attributeId} not found`);
          }

          const value = await this.prisma.attributeValue.findFirst({
            where: {
              id: attr.attributeValueId,
              attributeId: attr.attributeId,
              tenantId,
              deletedAt: null,
            },
          });
          if (!value) {
            throw new BadRequestException(`Attribute value ${attr.attributeValueId} not found`);
          }
        }
      }
    }
  }
}