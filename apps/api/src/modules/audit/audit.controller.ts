import { Controller, Get, Query, Param } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditFiltersDto } from './dto/audit-filters.dto';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
@Controller('audit')
export class AuditController {
  constructor(private service: AuditService) {}

  @Get()
  @RequirePermissions('view_audit')
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query() filters: AuditFiltersDto,
  ) {
    return this.service.findAll(user.tenantId, filters);
  }

  @Get('entity/:entity/:entityId')
  @RequirePermissions('view_audit')
  getEntityHistory(
    @CurrentUser() user: JwtPayload,
    @Param('entity') entity: string,
    @Param('entityId') entityId: string,
  ) {
    return this.service.getEntityHistory(user.tenantId, entity, entityId);
  }
}