import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

@Injectable()
export class CategoriesRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.category.findMany({
      where: { tenantId, deletedAt: null },
      include: { children: { where: { deletedAt: null } } },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string, tenantId: string) {
    return this.prisma.category.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        parent: true,
        children: { where: { deletedAt: null } },
      },
    });
  }

  async findBySlug(slug: string, tenantId: string) {
    return this.prisma.category.findFirst({
      where: { slug, tenantId, deletedAt: null },
    });
  }

  async create(tenantId: string, dto: CreateCategoryDto) {
    const slug = toSlug(dto.name);
    return this.prisma.category.create({
      data: {
        tenantId,
        name: dto.name,
        slug,
        description: dto.description,
        parentId: dto.parentId,
        imageUrl: dto.imageUrl,
      },
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const data: Record<string, unknown> = { ...dto };
    if (dto.name) data.slug = toSlug(dto.name);
    return this.prisma.category.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}