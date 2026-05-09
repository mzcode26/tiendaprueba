import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

@Injectable()
export class AttributesRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.attribute.findMany({
      where: { tenantId, deletedAt: null },
      include: {
        values: { where: { deletedAt: null }, orderBy: { value: 'asc' } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string, tenantId: string) {
    return this.prisma.attribute.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        values: { where: { deletedAt: null }, orderBy: { value: 'asc' } },
      },
    });
  }

  async findBySlug(slug: string, tenantId: string) {
    return this.prisma.attribute.findFirst({
      where: { slug, tenantId, deletedAt: null },
    });
  }

  async create(tenantId: string, dto: CreateAttributeDto) {
    const slug = toSlug(dto.name);
    return this.prisma.attribute.create({
      data: {
        tenantId,
        name: dto.name,
        slug,
        values: dto.values
          ? {
              create: dto.values.map((v) => ({
                tenantId,
                value: v.value,
                slug: toSlug(v.value),
              })),
            }
          : undefined,
      },
      include: {
        values: { where: { deletedAt: null } },
      },
    });
  }

  async update(id: string, dto: UpdateAttributeDto) {
    const data: Record<string, unknown> = { ...dto };
    if (dto.name) data.slug = toSlug(dto.name);
    return this.prisma.attribute.update({ where: { id }, data });
  }

  async addValue(attributeId: string, tenantId: string, value: string) {
    const slug = toSlug(value);
    return this.prisma.attributeValue.create({
      data: { attributeId, tenantId, value, slug },
    });
  }

  async removeValue(valueId: string) {
    return this.prisma.attributeValue.update({
      where: { id: valueId },
      data: { deletedAt: new Date() },
    });
  }

  async softDelete(id: string) {
    return this.prisma.attribute.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}