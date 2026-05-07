import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SaleFiltersDto, CreateSaleDto, AddPaymentDto, CancelSaleDto, RefundSaleDto } from './dto/index';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('sales')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SalesController {
  constructor(private readonly service: SalesService) {}

  @Get()
  @RequirePermissions('view_sales')
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query() filters: SaleFiltersDto,
  ) {
    return this.service.getSales(tenantId, filters);
  }

  @Get('summary')
  @RequirePermissions('view_reports')
  async getSummary(
    @CurrentUser('tenantId') tenantId: string,
    @Query('storeId') storeId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.getSalesSummary(tenantId, storeId, startDate, endDate);
  }

  @Get(':id')
  @RequirePermissions('view_sales')
  async findOne(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.service.getSaleById(tenantId, id);
  }

  @Post()
  @RequirePermissions('create_sales')
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() data: CreateSaleDto,
  ) {
    return this.service.createSale(tenantId, userId, data);
  }

  @Post(':id/payments')
  @RequirePermissions('create_sales')
  async addPayment(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') saleId: string,
    @Body() data: AddPaymentDto,
  ) {
    return this.service.addPayment(tenantId, saleId, data);
  }

  @Post(':id/cancel')
  @RequirePermissions('cancel_sales')
  async cancel(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() data: CancelSaleDto,
  ) {
    return this.service.cancelSale(tenantId, userId, id, data);
  }

  @Post(':id/refund')
  @RequirePermissions('refund_sales')
  async refund(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') saleId: string,
    @Body() data: RefundSaleDto,
  ) {
    return this.service.refundSale(tenantId, userId, saleId, data);
  }
}