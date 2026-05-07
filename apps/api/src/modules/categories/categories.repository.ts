import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    filters: { page: number; limit: number; search?: string; parentId?: string | null },
  ) {
    const where: any = {
      tenantId,
      deletedAt: null,
    };

    if (filters.search) {
      where.name = { contains: filters.search, mode: 'insensitive' };
    }

    if (filters.parentId !== undefined) {
      where.parentId = filters.parentId;
    }

    const [total, data] = await Promise.all([
      this.prisma.category.count({ where }),
      this.prisma.category.findMany({
        where,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        include: {
          _count: { select: { products: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { data, total };
  }

  async findById(id: string, tenantId: string) {
    return this.prisma.category.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        children: { where: { deletedAt: null } },
        parent: true,
      },
    });
  }

  async findBySlug(slug: string, tenantId: string) {
    return this.prisma.category.findFirst({
      where: { slug, tenantId, deletedAt: null },
    });
  }

  async create(tenantId: string, data: any) {
    return this.prisma.category.create({
      data: {
        tenantId,
        name: data.name,
        slug: data.slug,
        description: data.description,
        parentId: data.parentId,
        imageUrl: data.imageUrl,
      },
    });
  }

  async update(id: string, _tenantId: string, data: any) {
    return this.prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        parentId: data.parentId,
        imageUrl: data.imageUrl,
      },
    });
  }

  async softDelete(id: string, _tenantId: string) {
    return this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async countActiveProducts(id: string, tenantId: string) {
    return this.prisma.product.count({
      where: { categoryId: id, tenantId, deletedAt: null, isActive: true },
    });
  }
}
