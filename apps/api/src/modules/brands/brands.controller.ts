import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('brands')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BrandsController {
  constructor(private readonly service: BrandsService) {}

  @Get()
  @RequirePermissions('view_products')
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
  ) {
    return this.service.findAll(tenantId, Number(page), Number(limit), search);
  }

  @Get(':id')
  @RequirePermissions('view_products')
  async findOne(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.service.findById(id, tenantId);
  }

  @Post()
  @RequirePermissions('create_products')
  async create(@CurrentUser('tenantId') tenantId: string, @Body() data: CreateBrandDto) {
    return this.service.create(tenantId, data);
  }

  @Patch(':id')
  @RequirePermissions('edit_products')
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() data: UpdateBrandDto,
  ) {
    return this.service.update(id, tenantId, data);
  }

  @Delete(':id')
  @RequirePermissions('delete_products')
  async remove(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.service.remove(id, tenantId);
  }
}