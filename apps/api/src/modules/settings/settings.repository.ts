import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    // Asumimos que hay una tabla settings o usamos un JSON field en tenant
    // Por simplicidad, usamos tenant.settings (agrega un field settings: Json? a Tenant en schema)
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });
    return tenant?.settings || {};
  }

  async update(tenantId: string, settings: Record<string, any>) {
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: { settings },
    });
  }
}