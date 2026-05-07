import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

@Controller('reports')
export class ReportsController {
  constructor(private service: ReportsService) {}

  @Get('sales')
  @RequirePermissions('view_reports')
  getSalesReport(
    @CurrentUser() user: JwtPayload,
    @Query('storeId') storeId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.getSalesReport(user.tenantId, { storeId, startDate, endDate });
  }

  @Get('inventory')
  @RequirePermissions('view_reports')
  getInventoryReport(
    @CurrentUser() user: JwtPayload,
    @Query('storeId') storeId?: string,
  ) {
    return this.service.getInventoryReport(user.tenantId, storeId);
  }

  @Get('customers')
  @RequirePermissions('view_reports')
  getCustomerReport(@CurrentUser() user: JwtPayload) {
    return this.service.getCustomerReport(user.tenantId);
  }
}