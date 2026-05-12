import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto, CreateProductVariantDto } from './dto/create-product.dto';
import { UpdateProductDto, UpdateProductVariantDto } from './dto/update-product.dto';
import { CreateProductImageDto } from './dto/create-product-image.dto';

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

@Injectable()
export class ProductsRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(
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
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
        { tags: { has: search } },
        {
          variants: {
            some: {
              deletedAt: null,
              sku: { contains: search, mode: 'insensitive' as const },
            },
          },
        },
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

  async findById(id: string, tenantId: string) {
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

  async findBySlug(slug: string, tenantId: string) {
    return this.prisma.product.findFirst({
      where: { slug, tenantId, deletedAt: null },
    });
  }

  async findVariantBySku(sku: string, tenantId: string) {
    return this.prisma.productVariant.findFirst({
      where: { sku, tenantId, deletedAt: null },
    });
  }

  async create(tenantId: string, dto: CreateProductDto) {
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

  async update(id: string, dto: UpdateProductDto) {
    const data: Record<string, unknown> = { ...dto };
    if (dto.name) data.slug = toSlug(dto.name);
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

  async createVariant(
    productId: string,
    tenantId: string,
    dto: CreateProductVariantDto,
  ) {
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

  async updateVariant(variantId: string, dto: UpdateProductVariantDto) {
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

  async softDeleteVariant(variantId: string) {
    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: { deletedAt: new Date() },
    });
  }

  async addImage(productId: string, tenantId: string, dto: CreateProductImageDto) {
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

  async removeImage(imageId: string) {
    return this.prisma.productImage.delete({ where: { id: imageId } });
  }

  async softDelete(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}