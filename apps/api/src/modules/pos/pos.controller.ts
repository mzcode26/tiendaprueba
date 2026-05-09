import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
} from '@nestjs/common';
import { PosService } from './pos.service';
import { CreateSaleDto } from '../sales/dto/create-sale.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

@Controller('pos')
export class PosController {
  constructor(private readonly posService: PosService) {}

  @Get('search')
  @RequirePermissions('create_sales')
  searchProducts(
    @CurrentUser() user: JwtPayload,
    @Query('q') query: string,
    @Query('storeId') storeId: string,
  ) {
    return this.posService.searchProducts(user.tenantId, { q: query, storeId });
  }

  @Get('store/:storeId/summary')
  @RequirePermissions('view_inventory')
  getStoreSummary(
    @Param('storeId') storeId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.posService.getStoreInventorySummary(user.tenantId, storeId);
  }

  @Get('store/:storeId/daily-summary')
  @RequirePermissions('view_reports')
  getDailySummary(
    @Param('storeId') storeId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.posService.getDailySummary(user.tenantId, storeId);
  }

  @Post('quick-sale')
  @RequirePermissions('create_sales')
  quickSale(@Body() dto: CreateSaleDto, @CurrentUser() user: JwtPayload) {
    return this.posService.quickSale(user.tenantId, user.sub, dto);
  }
}