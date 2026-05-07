import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { CreateAttributeDto, CreateAttributeValueDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto, UpdateAttributeValueDto } from './dto/update-attribute.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('attributes')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AttributesController {
  constructor(private readonly service: AttributesService) {}

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
  async create(@CurrentUser('tenantId') tenantId: string, @Body() data: CreateAttributeDto) {
    return this.service.create(tenantId, data);
  }

  @Patch(':id')
  @RequirePermissions('edit_products')
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() data: UpdateAttributeDto,
  ) {
    return this.service.update(id, tenantId, data);
  }

  @Delete(':id')
  @RequirePermissions('delete_products')
  async remove(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.service.remove(id, tenantId);
  }

  @Post(':id/values')
  @RequirePermissions('create_products')
  async createValue(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') attributeId: string,
    @Body() data: CreateAttributeValueDto,
  ) {
    return this.service.createValue(attributeId, tenantId, data);
  }

  @Patch(':id/values/:valueId')
  @RequirePermissions('edit_products')
  async updateValue(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') attributeId: string,
    @Param('valueId') valueId: string,
    @Body() data: UpdateAttributeValueDto,
  ) {
    return this.service.updateValue(valueId, attributeId, tenantId, data);
  }

  @Delete(':id/values/:valueId')
  @RequirePermissions('delete_products')
  async removeValue(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') attributeId: string,
    @Param('valueId') valueId: string,
  ) {
    return this.service.removeValue(valueId, attributeId, tenantId);
  }
}