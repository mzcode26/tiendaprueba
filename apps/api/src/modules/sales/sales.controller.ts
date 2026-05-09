import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { CancelSaleDto } from './dto/cancel-sale.dto';
import { CreateRefundDto } from './dto/create-refund.dto';
import { QuerySalesDto } from './dto/query-sales.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  @RequirePermissions('view_sales')
  findAll(@CurrentUser() user: JwtPayload, @Query() query: QuerySalesDto) {
    return this.salesService.findAll(user.tenantId, query);
  }

  @Get('summary')
  @RequirePermissions('view_reports')
  getSummary(
    @CurrentUser() user: JwtPayload,
    @Query('storeId') storeId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.salesService.getSummary(user.tenantId, storeId, dateFrom, dateTo);
  }

  @Get(':id')
  @RequirePermissions('view_sales')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.salesService.findById(id, user.tenantId);
  }

  @Post()
  @RequirePermissions('create_sales')
  create(@Body() dto: CreateSaleDto, @CurrentUser() user: JwtPayload) {
    return this.salesService.create(user.tenantId, user.sub, dto);
  }

  @Post(':id/cancel')
  @RequirePermissions('cancel_sales')
  cancel(
    @Param('id') id: string,
    @Body() dto: CancelSaleDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.salesService.cancel(id, user.tenantId, user.sub, dto);
  }

  @Post(':id/refund')
  @RequirePermissions('cancel_sales')
  refund(
    @Param('id') id: string,
    @Body() dto: CreateRefundDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.salesService.refund(id, user.tenantId, user.sub, dto);
  }
}