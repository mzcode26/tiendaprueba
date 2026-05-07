import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { generateSlug } from '@tienda/shared-utils';
import { BrandsRepository } from './brands.repository';

@Injectable()
export class BrandsService {
  constructor(private readonly repository: BrandsRepository) {}

  async findAll(tenantId: string, page: number = 1, limit: number = 20, search?: string) {
    return this.repository.findAll(tenantId, { page, limit, search });
  }

  async findById(id: string, tenantId: string) {
    const brand = await this.repository.findById(id, tenantId);
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
    return brand;
  }

  async create(tenantId: string, data: any) {
    const slug = data.slug || generateSlug(data.name);
    const existing = await this.repository.findBySlug(slug, tenantId);
    if (existing) {
      throw new BadRequestException('Brand slug already exists');
    }

    return this.repository.create(tenantId, { ...data, slug });
  }

  async update(id: string, tenantId: string, data: any) {
    const brand = await this.findById(id, tenantId);

    if (data.name && !data.slug) {
      data.slug = generateSlug(data.name);
    }

    if (data.slug && data.slug !== brand.slug) {
      const existing = await this.repository.findBySlug(data.slug, tenantId);
      if (existing && existing.id !== id) {
        throw new BadRequestException('Brand slug already exists');
      }
    }

    return this.repository.update(id, tenantId, data);
  }

  async remove(id: string, tenantId: string) {
    await this.findById(id, tenantId);
    const activeProducts = await this.repository.countActiveProducts(id, tenantId);
    if (activeProducts > 0) {
      throw new BadRequestException('Cannot delete brand with active products');
    }
    await this.repository.softDelete(id, tenantId);
    return { success: true, message: 'Brand deleted successfully' };
  }
}