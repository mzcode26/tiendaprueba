import { Injectable, NotFoundException } from '@nestjs/common';
import { StoresRepository } from './stores.repository';

@Injectable()
export class StoresService {
  constructor(private readonly repository: StoresRepository) {}

  async findAll(tenantId: string, page: number = 1, limit: number = 20, search?: string) {
    return this.repository.findAll(tenantId, { page, limit, search });
  }

  async findById(id: string, tenantId: string) {
    const store = await this.repository.findById(id, tenantId);
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    return store;
  }

  async create(tenantId: string, data: any) {
    return this.repository.create(tenantId, data);
  }

  async update(id: string, tenantId: string, data: any) {
    await this.findById(id, tenantId);
    return this.repository.update(id, tenantId, data);
  }

  async remove(id: string, tenantId: string) {
    await this.findById(id, tenantId);
    await this.repository.softDelete(id, tenantId);
    return { success: true, message: 'Store deleted successfully' };
  }
}