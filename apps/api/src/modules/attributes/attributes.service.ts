import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { generateSlug } from '@tienda/shared-utils';
import { AttributesRepository } from './attributes.repository';

@Injectable()
export class AttributesService {
  constructor(
    private readonly repository: AttributesRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(tenantId: string, page: number = 1, limit: number = 20, search?: string) {
    return this.repository.findAll(tenantId, { page, limit, search });
  }

  async findById(id: string, tenantId: string) {
    const attribute = await this.repository.findById(id, tenantId);
    if (!attribute) {
      throw new NotFoundException('Attribute not found');
    }
    return attribute;
  }

  async create(tenantId: string, data: any) {
    const slug = data.slug || generateSlug(data.name);
    const existing = await this.repository.findBySlug(slug, tenantId);
    if (existing) {
      throw new BadRequestException('Attribute slug already exists');
    }

    return this.repository.create(tenantId, { ...data, slug });
  }

  async update(id: string, tenantId: string, data: any) {
    const attribute = await this.findById(id, tenantId);

    if (data.name && !data.slug) {
      data.slug = generateSlug(data.name);
    }

    if (data.slug && data.slug !== attribute.slug) {
      const existing = await this.repository.findBySlug(data.slug, tenantId);
      if (existing && existing.id !== id) {
        throw new BadRequestException('Attribute slug already exists');
      }
    }

    return this.repository.update(id, tenantId, data);
  }

  async remove(id: string, tenantId: string) {
    await this.findById(id, tenantId);
    const activeVariants = await this.repository.countActiveVariants(id, tenantId);
    if (activeVariants > 0) {
      throw new BadRequestException('Cannot delete attribute with active variants');
    }
    await this.repository.softDelete(id, tenantId);
    return { success: true, message: 'Attribute deleted successfully' };
  }

  async createValue(attributeId: string, tenantId: string, data: any) {
    // Validate attribute exists
    await this.findById(attributeId, tenantId);
    const slug = data.slug || generateSlug(data.value);

    // Check if value already exists for this attribute
    const existing = await this.prisma.attributeValue.findFirst({
      where: {
        attributeId,
        slug,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new BadRequestException('Attribute value slug already exists');
    }

    return this.repository.createValue(attributeId, tenantId, { ...data, slug });
  }

  async updateValue(id: string, attributeId: string, tenantId: string, data: any) {
    const value = await this.repository.findValueById(id, tenantId);
    if (!value || value.attributeId !== attributeId) {
      throw new NotFoundException('Attribute value not found');
    }

    if (data.value && !data.slug) {
      data.slug = generateSlug(data.value);
    }

    if (data.slug && data.slug !== value.slug) {
      // Check if slug already exists for this attribute
      const existing = await this.prisma.attributeValue.findFirst({
        where: {
          attributeId,
          slug: data.slug,
          deletedAt: null,
          id: { not: id },
        },
      });
      if (existing) {
        throw new BadRequestException('Attribute value slug already exists');
      }
    }

    return this.repository.updateValue(id, attributeId, tenantId, data);
  }

  async removeValue(id: string, attributeId: string, tenantId: string) {
    const value = await this.repository.findValueById(id, tenantId);
    if (!value || value.attributeId !== attributeId) {
      throw new NotFoundException('Attribute value not found');
    }

    await this.repository.softDeleteValue(id, attributeId, tenantId);
    return { success: true, message: 'Attribute value deleted successfully' };
  }
}