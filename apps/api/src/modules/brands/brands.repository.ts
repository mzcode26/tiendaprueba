import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BrandsRepository {
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
      this.prisma.brand.count({ where }),
      this.prisma.brand.findMany({
        where,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { data, total };
  }

  async findById(id: string, tenantId: string) {
    return this.prisma.brand.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
  }

  async findBySlug(slug: string, tenantId: string) {
    return this.prisma.brand.findFirst({
      where: { slug, tenantId, deletedAt: null },
    });
  }

  async create(tenantId: string, data: any) {
    return this.prisma.brand.create({
      data: {
        tenantId,
        name: data.name,
        slug: data.slug,
        description: data.description,
        logoUrl: data.logoUrl,
      },
    });
  }

  async update(id: string, _tenantId: string, data: any) {
    return this.prisma.brand.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        logoUrl: data.logoUrl,
      },
    });
  }

  async softDelete(id: string, _tenantId: string) {
    return this.prisma.brand.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async countActiveProducts(id: string, tenantId: string) {
    return this.prisma.product.count({
      where: { brandId: id, tenantId, deletedAt: null, isActive: true },
    });
  }
}