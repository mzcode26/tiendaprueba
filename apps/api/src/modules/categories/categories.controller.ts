import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('categories')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Get()
  @RequirePermissions('view_products')
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
    @Query('parentId') parentId?: string,
  ) {
    return this.service.findAll(
      tenantId,
      Number(page),
      Number(limit),
      search,
      parentId || null,
    );
  }

  @Get(':id')
  @RequirePermissions('view_products')
  async findOne(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.service.findById(id, tenantId);
  }

  @Post()
  @RequirePermissions('create_products')
  async create(@CurrentUser('tenantId') tenantId: string, @Body() data: CreateCategoryDto) {
    return this.service.create(tenantId, data);
  }

  @Patch(':id')
  @RequirePermissions('edit_products')
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() data: UpdateCategoryDto,
  ) {
    return this.service.update(id, tenantId, data);
  }

  @Delete(':id')
  @RequirePermissions('delete_products')
  async remove(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.service.remove(id, tenantId);
  }
}
