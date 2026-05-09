import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { AttributesRepository } from './attributes.repository';
import { CreateAttributeDto, CreateAttributeValueDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';

@Injectable()
export class AttributesService {
  constructor(private attributesRepository: AttributesRepository) {}

  findAll(tenantId: string) {
    return this.attributesRepository.findAll(tenantId);
  }

  async findById(id: string, tenantId: string) {
    const attribute = await this.attributesRepository.findById(id, tenantId);
    if (!attribute) throw new NotFoundException('Attribute not found');
    return attribute;
  }

  async create(tenantId: string, dto: CreateAttributeDto) {
    const slug = dto.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const existing = await this.attributesRepository.findBySlug(slug, tenantId);
    if (existing) throw new ConflictException('Attribute with this name already exists');

    return this.attributesRepository.create(tenantId, dto);
  }

  async update(id: string, tenantId: string, dto: UpdateAttributeDto) {
    await this.findById(id, tenantId);
    return this.attributesRepository.update(id, dto);
  }

  async addValue(id: string, tenantId: string, dto: CreateAttributeValueDto) {
    await this.findById(id, tenantId);
    return this.attributesRepository.addValue(id, tenantId, dto.value);
  }

  async removeValue(id: string, tenantId: string, valueId: string) {
    await this.findById(id, tenantId);
    return this.attributesRepository.removeValue(valueId);
  }

  async remove(id: string, tenantId: string) {
    await this.findById(id, tenantId);
    await this.attributesRepository.softDelete(id);
    return { message: 'Attribute deleted successfully' };
  }
}