// src/modules/dashboard/dashboard.controller.ts
import { Controller, Get, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @RequirePermissions('view_reports')
  getStats(@CurrentUser() user: JwtPayload) {
    return this.dashboardService.getStats(user.tenantId);
  }

  @Get('recent-sales')
  @RequirePermissions('view_reports')
  getRecentSales(
    @CurrentUser() user: JwtPayload,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
  ) {
    return this.dashboardService.getRecentSales(user.tenantId, limit);
  }

  @Get('stock-alerts')
  @RequirePermissions('view_reports')
  getStockAlerts(
    @CurrentUser() user: JwtPayload,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
  ) {
    return this.dashboardService.getStockAlerts(user.tenantId, limit);
  }
}