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
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  @RequirePermissions('view_stores')
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.storesService.findAll(
      user.tenantId,
      includeInactive === 'true',
    );
  }

  @Get(':id')
  @RequirePermissions('view_stores')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.storesService.findById(id, user.tenantId);
  }

  @Post()
  @RequirePermissions('create_stores')
  create(@Body() dto: CreateStoreDto, @CurrentUser() user: JwtPayload) {
    return this.storesService.create(user.tenantId, dto);
  }

  @Patch(':id')
  @RequirePermissions('edit_stores')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateStoreDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.storesService.update(id, user.tenantId, dto);
  }

  @Delete(':id')
  @RequirePermissions('delete_stores')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.storesService.remove(id, user.tenantId);
  }
}