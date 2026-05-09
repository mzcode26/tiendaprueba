import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { BrandsRepository } from './brands.repository';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(private brandsRepository: BrandsRepository) {}

  findAll(tenantId: string) {
    return this.brandsRepository.findAll(tenantId);
  }

  async findById(id: string, tenantId: string) {
    const brand = await this.brandsRepository.findById(id, tenantId);
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async create(tenantId: string, dto: CreateBrandDto) {
    const slug = dto.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const existing = await this.brandsRepository.findBySlug(slug, tenantId);
    if (existing) throw new ConflictException('Brand with this name already exists');

    return this.brandsRepository.create(tenantId, dto);
  }

  async update(id: string, tenantId: string, dto: UpdateBrandDto) {
    await this.findById(id, tenantId);
    return this.brandsRepository.update(id, dto);
  }

  async remove(id: string, tenantId: string) {
    await this.findById(id, tenantId);
    await this.brandsRepository.softDelete(id);
    return { message: 'Brand deleted successfully' };
  }
}