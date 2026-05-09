import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StoresRepository } from './stores.repository';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoresService {
  constructor(private storesRepository: StoresRepository) {}

  async findAll(tenantId: string, includeInactive = false) {
    return this.storesRepository.findAll(tenantId, includeInactive);
  }

  async findById(id: string, tenantId: string) {
    const store = await this.storesRepository.findById(id, tenantId);
    if (!store) throw new NotFoundException('Store not found');
    return store;
  }

  async create(tenantId: string, dto: CreateStoreDto) {
    return this.storesRepository.create(tenantId, dto);
  }

  async update(id: string, tenantId: string, dto: UpdateStoreDto) {
    await this.findById(id, tenantId);
    return this.storesRepository.update(id, dto);
  }

  async remove(id: string, tenantId: string) {
    await this.findById(id, tenantId);
    await this.storesRepository.softDelete(id);
    return { message: 'Store deleted successfully' };
  }
}