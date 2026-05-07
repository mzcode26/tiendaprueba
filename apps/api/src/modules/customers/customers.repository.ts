import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto, CustomerFiltersDto } from './dto';

@Injectable()
export class CustomersRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, filters: CustomerFiltersDto) {
    const { page = 1, limit = 20, search } = filters;
    const skip = (page - 1) * limit;

    const where = {
      tenantId,
      deletedAt: null,
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { documentNumber: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { sales: true } },
        },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string, tenantId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        sales: {
          select: { id: true, total: true, status: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: { select: { sales: true } },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async findByEmail(email: string, tenantId: string) {
    return this.prisma.customer.findFirst({
      where: { email, tenantId, deletedAt: null },
    });
  }

  async findByDocument(documentNumber: string, tenantId: string) {
    return this.prisma.customer.findFirst({
      where: { documentNumber, tenantId, deletedAt: null },
    });
  }

  async create(tenantId: string, data: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: { ...data, tenantId },
    });
  }

  async update(id: string, tenantId: string, data: UpdateCustomerDto) {
    return this.prisma.customer.update({
      where: { id, tenantId },
      data,
    });
  }

  async softDelete(id: string, tenantId: string) {
    return this.prisma.customer.update({
      where: { id, tenantId },
      data: { deletedAt: new Date() },
    });
  }

  async getTopCustomers(tenantId: string, limit = 10) {
    return this.prisma.customer.findMany({
      where: { tenantId, deletedAt: null },
      include: {
        _count: { select: { sales: true } },
        sales: {
          select: { total: true },
          where: { status: 'COMPLETED' },
        },
      },
      orderBy: {
        sales: {
          _count: 'desc',
        },
      },
      take: limit,
    });
  }
}