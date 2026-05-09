import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  @RequirePermissions('view_products')
  findAll(@CurrentUser() user: JwtPayload) {
    return this.brandsService.findAll(user.tenantId);
  }

  @Get(':id')
  @RequirePermissions('view_products')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.brandsService.findById(id, user.tenantId);
  }

  @Post()
  @RequirePermissions('create_products')
  create(@Body() dto: CreateBrandDto, @CurrentUser() user: JwtPayload) {
    return this.brandsService.create(user.tenantId, dto);
  }

  @Patch(':id')
  @RequirePermissions('edit_products')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBrandDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.brandsService.update(id, user.tenantId, dto);
  }

  @Delete(':id')
  @RequirePermissions('delete_products')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.brandsService.remove(id, user.tenantId);
  }
}