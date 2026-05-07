import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('stores')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class StoresController {
  constructor(private readonly service: StoresService) {}

  @Get()
  @RequirePermissions('view_stores')
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
  ) {
    return this.service.findAll(tenantId, Number(page), Number(limit), search);
  }

  @Get(':id')
  @RequirePermissions('view_stores')
  async findOne(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.service.findById(id, tenantId);
  }

  @Post()
  @RequirePermissions('create_stores')
  async create(@CurrentUser('tenantId') tenantId: string, @Body() data: CreateStoreDto) {
    return this.service.create(tenantId, data);
  }

  @Patch(':id')
  @RequirePermissions('edit_stores')
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() data: UpdateStoreDto,
  ) {
    return this.service.update(id, tenantId, data);
  }

  @Delete(':id')
  @RequirePermissions('delete_stores')
  async remove(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.service.remove(id, tenantId);
  }
}