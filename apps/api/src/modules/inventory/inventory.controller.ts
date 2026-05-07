import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { AdjustStockDto, TransferStockDto, InventoryFiltersDto, MovementFiltersDto } from './dto/adjust-stock.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('inventory')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @Get()
  @RequirePermissions('view_inventory')
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query() filters: InventoryFiltersDto,
  ) {
    return this.service.getInventory(tenantId, filters);
  }

  @Get('low-stock')
  @RequirePermissions('view_inventory')
  async getLowStockAlerts(
    @CurrentUser('tenantId') tenantId: string,
    @Query('storeId') storeId?: string,
  ) {
    return this.service.getLowStockAlerts(tenantId, storeId);
  }

  @Get('movements')
  @RequirePermissions('view_inventory')
  async getMovements(
    @CurrentUser('tenantId') tenantId: string,
    @Query() filters: MovementFiltersDto,
  ) {
    return this.service.getMovements(tenantId, filters);
  }

  @Get(':variantId/stores/:storeId')
  @RequirePermissions('view_inventory')
  async getStockByVariantAndStore(
    @CurrentUser('tenantId') tenantId: string,
    @Param('variantId') variantId: string,
    @Param('storeId') storeId: string,
  ) {
    return this.service.getStockByVariantAndStore(variantId, storeId, tenantId);
  }

  @Post('adjust')
  @RequirePermissions('edit_inventory')
  async adjustStock(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() data: AdjustStockDto,
  ) {
    return this.service.adjustStock(tenantId, userId, data);
  }

  @Post('transfer')
  @RequirePermissions('edit_inventory')
  async transferStock(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() data: TransferStockDto,
  ) {
    return this.service.transferStock(tenantId, userId, data);
  }

  @Post('initial')
  @RequirePermissions('create_inventory')
  async setInitialStock(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() data: { variantId: string; storeId: string; quantity: number },
  ) {
    return this.service.setInitialStock(tenantId, userId, data);
  }

  @Patch(':inventoryId/limits')
  @RequirePermissions('edit_inventory')
  async updateStockLimits(
    @CurrentUser('tenantId') tenantId: string,
    @Param('inventoryId') inventoryId: string,
    @Body() data: { minStock: number; maxStock?: number },
  ) {
    return this.service.updateStockLimits(tenantId, inventoryId, data);
  }
}