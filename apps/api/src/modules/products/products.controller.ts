import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('products')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get()
  @RequirePermissions('view_products')
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('brandId') brandId?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.service.findAll(tenantId, {
      page: Number(page),
      limit: Number(limit),
      search,
      categoryId,
      brandId,
      isActive: isActive ? isActive === 'true' : undefined,
    });
  }

  @Get(':id')
  @RequirePermissions('view_products')
  async findOne(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.service.findById(id, tenantId);
  }

  @Post()
  @RequirePermissions('create_products')
  async create(@CurrentUser('tenantId') tenantId: string, @Body() data: CreateProductDto) {
    return this.service.create(tenantId, data);
  }

  @Patch(':id')
  @RequirePermissions('edit_products')
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() data: UpdateProductDto,
  ) {
    return this.service.update(id, tenantId, data);
  }

  @Delete(':id')
  @RequirePermissions('delete_products')
  async remove(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.service.remove(id, tenantId);
  }

  @Patch(':id/inventory')
  @RequirePermissions('edit_products')
  async updateInventory(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() data: UpdateInventoryDto,
  ) {
    return this.service.updateInventory(id, tenantId, data.quantity);
  }

  @Post(':id/images')
  @RequirePermissions('edit_products')
  async addImage(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') productId: string,
    @Body() data: CreateProductImageDto,
  ) {
    return this.service.addImage(productId, tenantId, data);
  }

  @Patch(':id/images/:imageId/sort')
  @RequirePermissions('edit_products')
  async updateImageSortOrder(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') productId: string,
    @Param('imageId') imageId: string,
    @Body('sortOrder') sortOrder: number,
  ) {
    return this.service.updateImageSortOrder(productId, imageId, tenantId, sortOrder);
  }

  @Delete(':id/images/:imageId')
  @RequirePermissions('edit_products')
  async removeImage(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') productId: string,
    @Param('imageId') imageId: string,
  ) {
    return this.service.removeImage(productId, imageId, tenantId);
  }

  @Get(':id/variants/:variantId')
  @RequirePermissions('view_products')
  async findVariant(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') _productId: string,
    @Param('variantId') variantId: string,
  ) {
    return this.service.findVariantById(variantId, tenantId);
  }

  @Patch(':id/variants/:variantId/inventory')
  @RequirePermissions('edit_products')
  async updateVariantInventory(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') _productId: string,
    @Param('variantId') variantId: string,
    @Body() data: UpdateInventoryDto,
  ) {
    return this.service.updateVariantInventory(variantId, tenantId, data.quantity);
  }
}