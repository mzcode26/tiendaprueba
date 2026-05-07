import { Injectable, ConflictException } from '@nestjs/common';
import { CustomersRepository } from './customers.repository';
import { CreateCustomerDto, UpdateCustomerDto, CustomerFiltersDto } from './dto';

@Injectable()
export class CustomersService {
  constructor(private repository: CustomersRepository) {}

  async findAll(tenantId: string, filters: CustomerFiltersDto) {
    return this.repository.findAll(tenantId, filters);
  }

  async findById(tenantId: string, id: string) {
    return this.repository.findById(id, tenantId);
  }

  async create(tenantId: string, data: CreateCustomerDto) {
    // Check for duplicate email
    if (data.email) {
      const existing = await this.repository.findByEmail(data.email, tenantId);
      if (existing) {
        throw new ConflictException('Customer with this email already exists');
      }
    }

    // Check for duplicate document
    if (data.documentNumber) {
      const existing = await this.repository.findByDocument(data.documentNumber, tenantId);
      if (existing) {
        throw new ConflictException('Customer with this document number already exists');
      }
    }

    return this.repository.create(tenantId, data);
  }

  async update(tenantId: string, id: string, data: UpdateCustomerDto) {
    // Validate existence
    await this.findById(tenantId, id);

    // Check duplicates if updating email/document
    if (data.email) {
      const existing = await this.repository.findByEmail(data.email, tenantId);
      if (existing && existing.id !== id) {
        throw new ConflictException('Customer with this email already exists');
      }
    }

    if (data.documentNumber) {
      const existing = await this.repository.findByDocument(data.documentNumber, tenantId);
      if (existing && existing.id !== id) {
        throw new ConflictException('Customer with this document number already exists');
      }
    }

    return this.repository.update(id, tenantId, data);
  }

  async remove(tenantId: string, id: string) {
    // Validate existence
    await this.findById(tenantId, id);

    return this.repository.softDelete(id, tenantId);
  }

  async getTopCustomers(tenantId: string, limit?: number) {
    return this.repository.getTopCustomers(tenantId, limit);
  }
}