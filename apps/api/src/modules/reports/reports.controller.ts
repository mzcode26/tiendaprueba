import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { QueryReportDto } from './dto/query-report.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @RequirePermissions('view_reports')
  getDashboard(
    @CurrentUser() user: JwtPayload,
    @Query('storeId') storeId?: string,
  ) {
    return this.reportsService.getDashboardSummary(user.tenantId, storeId);
  }

  @Get('sales-over-time')
  @RequirePermissions('view_reports')
  getSalesOverTime(
    @CurrentUser() user: JwtPayload,
    @Query() query: QueryReportDto,
  ) {
    return this.reportsService.getSalesOverTime(user.tenantId, query);
  }

  @Get('top-products')
  @RequirePermissions('view_reports')
  getTopProducts(
    @CurrentUser() user: JwtPayload,
    @Query() query: QueryReportDto,
  ) {
    return this.reportsService.getTopProducts(user.tenantId, query);
  }

  @Get('top-customers')
  @RequirePermissions('view_reports')
  getTopCustomers(
    @CurrentUser() user: JwtPayload,
    @Query() query: QueryReportDto,
  ) {
    return this.reportsService.getTopCustomers(user.tenantId, query);
  }

  @Get('revenue-by-category')
  @RequirePermissions('view_reports')
  getRevenueByCategory(
    @CurrentUser() user: JwtPayload,
    @Query() query: QueryReportDto,
  ) {
    return this.reportsService.getRevenueByCategory(user.tenantId, query);
  }

  @Get('revenue-by-payment-method')
  @RequirePermissions('view_reports')
  getRevenueByPaymentMethod(
    @CurrentUser() user: JwtPayload,
    @Query() query: QueryReportDto,
  ) {
    return this.reportsService.getRevenueByPaymentMethod(user.tenantId, query);
  }

  @Get('inventory-valuation')
  @RequirePermissions('view_reports')
  getInventoryValuation(
    @CurrentUser() user: JwtPayload,
    @Query('storeId') storeId?: string,
  ) {
    return this.reportsService.getInventoryValuation(user.tenantId, storeId);
  }
}