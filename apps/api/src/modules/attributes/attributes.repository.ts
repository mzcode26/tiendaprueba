import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AttributesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, filters: { page: number; limit: number; search?: string }) {
    const where: any = {
      tenantId,
      deletedAt: null,
    };

    if (filters.search) {
      where.name = { contains: filters.search, mode: 'insensitive' };
    }

    const [total, data] = await Promise.all([
      this.prisma.attribute.count({ where }),
      this.prisma.attribute.findMany({
        where,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        include: {
          values: {
            where: { deletedAt: null },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { data, total };
  }

  async findById(id: string, tenantId: string) {
    return this.prisma.attribute.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        values: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async findBySlug(slug: string, tenantId: string) {
    return this.prisma.attribute.findFirst({
      where: { slug, tenantId, deletedAt: null },
    });
  }

  async create(tenantId: string, data: any) {
    return this.prisma.attribute.create({
      data: {
        tenantId,
        name: data.name,
        slug: data.slug,
      },
    });
  }

  async update(id: string, _tenantId: string, data: any) {
    return this.prisma.attribute.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
      },
    });
  }

  async softDelete(id: string, _tenantId: string) {
    return this.prisma.attribute.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findValueById(id: string, tenantId: string) {
    return this.prisma.attributeValue.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { attribute: true },
    });
  }

  async createValue(attributeId: string, tenantId: string, data: any) {
    return this.prisma.attributeValue.create({
      data: {
        tenantId,
        attributeId,
        value: data.value,
        slug: data.slug,
      },
    });
  }

  async updateValue(id: string, _attributeId: string, _tenantId: string, data: any) {
    return this.prisma.attributeValue.update({
      where: { id },
      data: {
        value: data.value,
        slug: data.slug,
      },
    });
  }

  async softDeleteValue(id: string, _attributeId: string, _tenantId: string) {
    return this.prisma.attributeValue.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async countActiveVariants(id: string, tenantId: string) {
    return this.prisma.productVariantAttribute.count({
      where: {
        OR: [
          { attributeId: id },
          { attributeValue: { attributeId: id } },
        ],
        variant: {
          tenantId,
          deletedAt: null,
        },
      },
    });
  }
}