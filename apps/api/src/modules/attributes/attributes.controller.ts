import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { CreateAttributeDto, CreateAttributeValueDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

@Controller('attributes')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  @Get()
  @RequirePermissions('view_products')
  findAll(@CurrentUser() user: JwtPayload) {
    return this.attributesService.findAll(user.tenantId);
  }

  @Get(':id')
  @RequirePermissions('view_products')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.attributesService.findById(id, user.tenantId);
  }

  @Post()
  @RequirePermissions('create_products')
  create(@Body() dto: CreateAttributeDto, @CurrentUser() user: JwtPayload) {
    return this.attributesService.create(user.tenantId, dto);
  }

  @Patch(':id')
  @RequirePermissions('edit_products')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAttributeDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.attributesService.update(id, user.tenantId, dto);
  }

  @Post(':id/values')
  @RequirePermissions('edit_products')
  addValue(
    @Param('id') id: string,
    @Body() dto: CreateAttributeValueDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.attributesService.addValue(id, user.tenantId, dto);
  }

  @Delete(':id/values/:valueId')
  @RequirePermissions('edit_products')
  removeValue(
    @Param('id') id: string,
    @Param('valueId') valueId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.attributesService.removeValue(id, user.tenantId, valueId);
  }

  @Delete(':id')
  @RequirePermissions('delete_products')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.attributesService.remove(id, user.tenantId);
  }
}