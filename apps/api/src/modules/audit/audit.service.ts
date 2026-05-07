import { Injectable } from '@nestjs/common';
import { AuditRepository } from './audit.repository';
import { AuditFiltersDto } from './dto/audit-filters.dto';

@Injectable()
export class AuditService {
  constructor(private repository: AuditRepository) {}

  async findAll(tenantId: string, filters: AuditFiltersDto) {
    return this.repository.findAll(tenantId, filters);
  }

  async logAction(tenantId: string, data: {
    userId?: string;
    action: string;
    entity: string;
    entityId: string;
    before?: any;
    after?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.repository.create(tenantId, data);
  }

  async getEntityHistory(tenantId: string, entity: string, entityId: string) {
    return this.repository.getEntityHistory(tenantId, entity, entityId);
  }
}