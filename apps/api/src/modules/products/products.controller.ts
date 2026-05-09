import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, CreateProductVariantDto } from './dto/create-product.dto';
import { UpdateProductDto, UpdateProductVariantDto } from './dto/update-product.dto';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @RequirePermissions('view_products')
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('brandId') brandId?: string,
    @Query('isActive') isActive?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.productsService.findAll(user.tenantId, {
      search,
      categoryId,
      brandId,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get(':id')
  @RequirePermissions('view_products')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.productsService.findById(id, user.tenantId);
  }

  @Post()
  @RequirePermissions('create_products')
  create(@Body() dto: CreateProductDto, @CurrentUser() user: JwtPayload) {
    return this.productsService.create(user.tenantId, dto);
  }

  @Patch(':id')
  @RequirePermissions('edit_products')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.productsService.update(id, user.tenantId, dto);
  }

  @Delete(':id')
  @RequirePermissions('delete_products')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.productsService.remove(id, user.tenantId);
  }

  @Post(':id/variants')
  @RequirePermissions('edit_products')
  addVariant(
    @Param('id') id: string,
    @Body() dto: CreateProductVariantDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.productsService.addVariant(id, user.tenantId, dto);
  }

  @Patch(':id/variants/:variantId')
  @RequirePermissions('edit_products')
  updateVariant(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @Body() dto: UpdateProductVariantDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.productsService.updateVariant(id, variantId, user.tenantId, dto);
  }

  @Delete(':id/variants/:variantId')
  @RequirePermissions('edit_products')
  removeVariant(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.productsService.removeVariant(id, variantId, user.tenantId);
  }

  @Post(':id/images')
  @RequirePermissions('edit_products')
  addImage(
    @Param('id') id: string,
    @Body() dto: CreateProductImageDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.productsService.addImage(id, user.tenantId, dto);
  }

  @Delete(':id/images/:imageId')
  @RequirePermissions('edit_products')
  removeImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.productsService.removeImage(id, imageId, user.tenantId);
  }
}