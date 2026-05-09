import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoresRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, includeInactive = false) {
    return this.prisma.store.findMany({
      where: {
        tenantId,
        deletedAt: null,
        ...(!includeInactive && { isActive: true }),
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string, tenantId: string) {
    return this.prisma.store.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
  }

  async create(tenantId: string, dto: CreateStoreDto) {
    return this.prisma.store.create({
      data: {
        tenantId,
        name: dto.name,
        address: dto.address,
        phone: dto.phone,
        email: dto.email,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateStoreDto) {
    return this.prisma.store.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async softDelete(id: string) {
    return this.prisma.store.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}