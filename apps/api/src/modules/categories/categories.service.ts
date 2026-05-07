import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { generateSlug } from '@tienda/shared-utils';
import { CategoriesRepository } from './categories.repository';

@Injectable()
export class CategoriesService {
  constructor(private readonly repository: CategoriesRepository) {}

  async findAll(
    tenantId: string,
    page: number = 1,
    limit: number = 20,
    search?: string,
    parentId?: string | null,
  ) {
    return this.repository.findAll(tenantId, { page, limit, search, parentId });
  }

  async findById(id: string, tenantId: string) {
    const category = await this.repository.findById(id, tenantId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async create(tenantId: string, data: any) {
    const slug = data.slug || generateSlug(data.name);
    const existing = await this.repository.findBySlug(slug, tenantId);
    if (existing) {
      throw new BadRequestException('Category slug already exists');
    }

    if (data.parentId) {
      const parent = await this.repository.findById(data.parentId, tenantId);
      if (!parent) {
        throw new BadRequestException('Parent category not found');
      }
      if (data.parentId === data.id) {
        throw new BadRequestException('Category cannot be its own parent');
      }
    }

    return this.repository.create(tenantId, { ...data, slug });
  }

  async update(id: string, tenantId: string, data: any) {
    const category = await this.findById(id, tenantId);

    if (data.name && !data.slug) {
      data.slug = generateSlug(data.name);
    }

    if (data.slug && data.slug !== category.slug) {
      const existing = await this.repository.findBySlug(data.slug, tenantId);
      if (existing && existing.id !== id) {
        throw new BadRequestException('Category slug already exists');
      }
    }

    if (data.parentId) {
      if (data.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }
      const parent = await this.repository.findById(data.parentId, tenantId);
      if (!parent) {
        throw new BadRequestException('Parent category not found');
      }
    }

    return this.repository.update(id, tenantId, data);
  }

  async remove(id: string, tenantId: string) {
    await this.findById(id, tenantId);
    const activeProducts = await this.repository.countActiveProducts(id, tenantId);
    if (activeProducts > 0) {
      throw new BadRequestException('Cannot delete category with active products');
    }
    await this.repository.softDelete(id, tenantId);
    return { success: true, message: 'Category deleted successfully' };
  }
}
