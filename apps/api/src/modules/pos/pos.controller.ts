import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { PosService } from './pos.service';
import { PosSearchDto, QuickSaleDto } from './dto/index';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('pos')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PosController {
  constructor(private readonly service: PosService) {}

  @Get('data')
  @RequirePermissions('view_pos')
  async getPosData(
    @CurrentUser('tenantId') tenantId: string,
    @Query('storeId') storeId: string,
  ) {
    return this.service.getPosData(tenantId, storeId);
  }

  @Get('search')
  @RequirePermissions('view_pos')
  async searchProducts(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: PosSearchDto,
  ) {
    return this.service.searchProducts(tenantId, query);
  }

  @Post('quick-sale')
  @RequirePermissions('create_sales')
  async quickSale(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() data: QuickSaleDto,
  ) {
    return this.service.quickSale(tenantId, userId, data);
  }
}