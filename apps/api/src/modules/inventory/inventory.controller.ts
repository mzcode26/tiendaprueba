import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { TransferStockDto } from './dto/transfer-stock.dto';
import { UpdateInventorySettingsDto } from './dto/update-inventory-settings.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { InventoryMovementType } from '@prisma/client';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('store/:storeId')
  @RequirePermissions('view_inventory')
  getByStore(
    @Param('storeId') storeId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.inventoryService.getByStore(storeId, user.tenantId);
  }

  @Get('store/:storeId/variant/:variantId')
  @RequirePermissions('view_inventory')
  getByVariantAndStore(
    @Param('storeId') storeId: string,
    @Param('variantId') variantId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.inventoryService.getByVariantAndStore(
      variantId,
      storeId,
      user.tenantId,
    );
  }

  @Get('low-stock')
  @RequirePermissions('view_inventory')
  getLowStock(@CurrentUser() user: JwtPayload) {
    return this.inventoryService.getLowStock(user.tenantId);
  }

  @Get('movements')
  @RequirePermissions('view_inventory')
  getMovements(
    @CurrentUser() user: JwtPayload,
    @Query('variantId') variantId?: string,
    @Query('storeId') storeId?: string,
    @Query('type') type?: InventoryMovementType,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.inventoryService.getMovements(user.tenantId, {
      variantId,
      storeId,
      type,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Post('adjust')
  @RequirePermissions('manage_inventory')
  adjustStock(
    @Body() dto: AdjustStockDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.inventoryService.adjustStock(user.tenantId, user.sub, dto);
  }

  @Post('transfer')
  @RequirePermissions('manage_inventory')
  transferStock(
    @Body() dto: TransferStockDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.inventoryService.transferStock(user.tenantId, user.sub, dto);
  }

  @Patch('settings/:storeId/:variantId')
  @RequirePermissions('manage_inventory')
  updateSettings(
    @Param('storeId') storeId: string,
    @Param('variantId') variantId: string,
    @Body() dto: UpdateInventorySettingsDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.inventoryService.updateSettings(
      variantId,
      storeId,
      user.tenantId,
      dto,
    );
  }
}