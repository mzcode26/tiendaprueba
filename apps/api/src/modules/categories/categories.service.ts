import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private categoriesRepository: CategoriesRepository) {}

  findAll(tenantId: string) {
    return this.categoriesRepository.findAll(tenantId);
  }

  async findById(id: string, tenantId: string) {
    const category = await this.categoriesRepository.findById(id, tenantId);
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(tenantId: string, dto: CreateCategoryDto) {
    const slug = dto.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const existing = await this.categoriesRepository.findBySlug(slug, tenantId);
    if (existing) throw new ConflictException('Category with this name already exists');

    return this.categoriesRepository.create(tenantId, dto);
  }

  async update(id: string, tenantId: string, dto: UpdateCategoryDto) {
    await this.findById(id, tenantId);
    return this.categoriesRepository.update(id, dto);
  }

  async remove(id: string, tenantId: string) {
    await this.findById(id, tenantId);
    await this.categoriesRepository.softDelete(id);
    return { message: 'Category deleted successfully' };
  }
}