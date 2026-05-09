import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

@Injectable()
export class BrandsRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.brand.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { name: 'asc' },
    });
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

  async create(tenantId: string, dto: CreateBrandDto) {
    const slug = toSlug(dto.name);
    return this.prisma.brand.create({
      data: {
        tenantId,
        name: dto.name,
        slug,
        description: dto.description,
        logoUrl: dto.logoUrl,
      },
    });
  }

  async update(id: string, dto: UpdateBrandDto) {
    const data: Record<string, unknown> = { ...dto };
    if (dto.name) data.slug = toSlug(dto.name);
    return this.prisma.brand.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return this.prisma.brand.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}