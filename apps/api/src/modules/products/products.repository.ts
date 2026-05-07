import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, filters: {
    page: number;
    limit: number;
    search?: string;
    categoryId?: string;
    brandId?: string;
    isActive?: boolean;
  }) {
    const where: any = {
      tenantId,
      deletedAt: null,
    };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.brandId) {
      where.brandId = filters.brandId;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const [total, data] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        include: {
          category: true,
          brand: true,
          variants: {
            where: { deletedAt: null },
            include: {
              attributes: {
                include: {
                  attribute: true,
                  attributeValue: true,
                },
              },
            },
          },
          images: {
            where: { deletedAt: null },
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { data, total };
  }

  async findById(id: string, tenantId: string) {
    return this.prisma.product.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        category: true,
        brand: true,
        variants: {
          where: { deletedAt: null },
          include: {
            attributes: {
              include: {
                attribute: true,
                attributeValue: true,
              },
            },
          },
        },
        images: {
          where: { deletedAt: null },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  async findBySku(sku: string, tenantId: string) {
    return this.prisma.product.findFirst({
      where: { sku, tenantId, deletedAt: null },
    });
  }

  async create(tenantId: string, data: any) {
    const { variants, images, ...productData } = data;

    return this.prisma.product.create({
      data: {
        tenantId,
        ...productData,
        variants: variants ? {
          create: variants.map((variant: any) => ({
            tenantId,
            sku: variant.sku,
            price: variant.price,
            compareAtPrice: variant.compareAtPrice,
            cost: variant.cost,
            inventoryQuantity: variant.inventoryQuantity,
            isDefault: variant.isDefault || false,
            attributes: variant.attributes ? {
              create: variant.attributes.map((attr: any) => ({
                tenantId,
                attributeId: attr.attributeId,
                attributeValueId: attr.attributeValueId,
              })),
            } : undefined,
          })),
        } : undefined,
        images: images ? {
          create: images.map((image: any, index: number) => ({
            tenantId,
            url: image.url,
            alt: image.alt,
            sortOrder: image.sortOrder || index,
          })),
        } : undefined,
      },
      include: {
        category: true,
        brand: true,
        variants: {
          include: {
            attributes: {
              include: {
                attribute: true,
                attributeValue: true,
              },
            },
          },
        },
        images: true,
      },
    });
  }

  async update(id: string, tenantId: string, data: any) {
    const { variants, images, ...productData } = data;

    return this.prisma.product.update({
      where: { id },
      data: {
        ...productData,
        variants: variants ? {
          deleteMany: { productId: id },
          create: variants.map((variant: any) => ({
            tenantId,
            sku: variant.sku,
            price: variant.price,
            compareAtPrice: variant.compareAtPrice,
            cost: variant.cost,
            inventoryQuantity: variant.inventoryQuantity,
            isDefault: variant.isDefault || false,
            attributes: variant.attributes ? {
              create: variant.attributes.map((attr: any) => ({
                tenantId,
                attributeId: attr.attributeId,
                attributeValueId: attr.attributeValueId,
              })),
            } : undefined,
          })),
        } : undefined,
        images: images ? {
          deleteMany: { productId: id },
          create: images.map((image: any, index: number) => ({
            tenantId,
            url: image.url,
            alt: image.alt,
            sortOrder: image.sortOrder || index,
          })),
        } : undefined,
      },
      include: {
        category: true,
        brand: true,
        variants: {
          include: {
            attributes: {
              include: {
                attribute: true,
                attributeValue: true,
              },
            },
          },
        },
        images: true,
      },
    });
  }

  async softDelete(id: string, _tenantId: string) {
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async updateInventory(id: string, _tenantId: string, quantity: number) {
    return this.prisma.product.update({
      where: { id },
      data: { inventoryQuantity: quantity },
    });
  }

  async findVariantById(id: string, tenantId: string) {
    return this.prisma.productVariant.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        product: true,
        attributes: {
          include: {
            attribute: true,
            attributeValue: true,
          },
        },
      },
    });
  }

  async updateVariantInventory(id: string, _tenantId: string, quantity: number) {
    return this.prisma.productVariant.update({
      where: { id },
      data: { inventoryQuantity: quantity },
    });
  }

  async createImage(productId: string, tenantId: string, data: any) {
    const maxSortOrder = await this.prisma.productImage.findFirst({
      where: { productId },
      orderBy: { sortOrder: 'desc' },
    });

    return this.prisma.productImage.create({
      data: {
        tenantId,
        productId,
        url: data.url,
        alt: data.alt,
        sortOrder: data.sortOrder || (maxSortOrder ? maxSortOrder.sortOrder + 1 : 0),
      },
    });
  }

  async updateImageSortOrder(id: string, _tenantId: string, sortOrder: number) {
    return this.prisma.productImage.update({
      where: { id },
      data: { sortOrder },
    });
  }

  async deleteImage(id: string, _tenantId: string) {
    return this.prisma.productImage.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}