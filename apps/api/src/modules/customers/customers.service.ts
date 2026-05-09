import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CustomersRepository } from './customers.repository';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomersDto } from './dto/query-customers.dto';

@Injectable()
export class CustomersService {
  constructor(private customersRepository: CustomersRepository) {}

  findAll(tenantId: string, query: QueryCustomersDto) {
    return this.customersRepository.findAll(tenantId, query);
  }

  async findById(id: string, tenantId: string) {
    const customer = await this.customersRepository.findById(id, tenantId);
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async create(tenantId: string, dto: CreateCustomerDto) {
    if (dto.email) {
      const existing = await this.customersRepository.findByEmail(
        dto.email,
        tenantId,
      );
      if (existing) {
        throw new ConflictException('A customer with this email already exists');
      }
    }

    if (dto.taxId) {
      const existing = await this.customersRepository.findByTaxId(
        dto.taxId,
        tenantId,
      );
      if (existing) {
        throw new ConflictException('A customer with this tax ID already exists');
      }
    }

    return this.customersRepository.create(tenantId, dto);
  }

  async update(id: string, tenantId: string, dto: UpdateCustomerDto) {
    await this.findById(id, tenantId);

    if (dto.email) {
      const existing = await this.customersRepository.findByEmail(
        dto.email,
        tenantId,
      );
      if (existing && existing.id !== id) {
        throw new ConflictException('A customer with this email already exists');
      }
    }

    if (dto.taxId) {
      const existing = await this.customersRepository.findByTaxId(
        dto.taxId,
        tenantId,
      );
      if (existing && existing.id !== id) {
        throw new ConflictException('A customer with this tax ID already exists');
      }
    }

    return this.customersRepository.update(id, dto);
  }

  async getStats(id: string, tenantId: string) {
    await this.findById(id, tenantId);
    return this.customersRepository.getStats(id, tenantId);
  }

  async remove(id: string, tenantId: string) {
    await this.findById(id, tenantId);
    await this.customersRepository.softDelete(id);
    return { message: 'Customer deleted successfully' };
  }
}