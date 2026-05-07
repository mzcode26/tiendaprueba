import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StoresRepository {
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
      this.prisma.store.count({ where }),
      this.prisma.store.findMany({
        where,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { data, total };
  }

  async findById(id: string, tenantId: string) {
    return this.prisma.store.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
  }

  async create(tenantId: string, data: any) {
    return this.prisma.store.create({
      data: {
        tenantId,
        name: data.name,
        address: data.address,
        phone: data.phone,
        email: data.email,
        isActive: data.isActive ?? true,
      },
    });
  }

  async update(id: string, _tenantId: string, data: any) {
    return this.prisma.store.update({
      where: { id },
      data: {
        name: data.name,
        address: data.address,
        phone: data.phone,
        email: data.email,
        isActive: data.isActive,
      },
    });
  }

  async softDelete(id: string, _tenantId: string) {
    return this.prisma.store.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}