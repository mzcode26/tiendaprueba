import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, tenantId: string) {
    return this.prisma.user.findFirst({
      where: {
        id,
        tenantId,
        deletedAt: null,
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async findByEmail(email: string, tenantId: string) {
    return this.prisma.user.findFirst({
      where: {
        email,
        tenantId,
        deletedAt: null,
      },
    });
  }

  async findAll(tenantId: string, params: { page: number; limit: number; search?: string }) {
    const where: any = {
      tenantId,
      deletedAt: null,
    };

    if (params.search) {
      where.OR = [
        { email: { contains: params.search, mode: 'insensitive' } },
        { firstName: { contains: params.search, mode: 'insensitive' } },
        { lastName: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      }),
    ]);

    return {
      items: users,
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  async create(tenantId: string, data: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        tenantId,
        email: data.email,
        passwordHash: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        isActive: data.isActive ?? true,
      },
    });
  }

  async update(id: string, tenantId: string, data: Record<string, unknown>) {
    return this.prisma.user.updateMany({
      where: {
        id,
        tenantId,
        deletedAt: null,
      },
      data,
    });
  }

  async softDelete(id: string, tenantId: string) {
    return this.prisma.user.updateMany({
      where: {
        id,
        tenantId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
