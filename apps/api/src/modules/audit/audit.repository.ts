import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditFiltersDto } from './dto/audit-filters.dto';

@Injectable()
export class AuditRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, filters: AuditFiltersDto) {
    const { page = 1, limit = 20, entity, entityId, userId, action, startDate, endDate } = filters;
    const skip = (page - 1) * limit;

    const where = {
      tenantId,
      ...(entity && { entity }),
      ...(entityId && { entityId }),
      ...(userId && { userId }),
      ...(action && { action }),
      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data, total };
  }

  async create(tenantId: string, data: {
    userId?: string;
    action: string;
    entity: string;
    entityId: string;
    before?: any;
    after?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.prisma.auditLog.create({
      data: { ...data, tenantId },
    });
  }

  async getEntityHistory(tenantId: string, entity: string, entityId: string) {
    return this.prisma.auditLog.findMany({
      where: { tenantId, entity, entityId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }
}