import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions('view_users')
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll(tenantId, Number(page), Number(limit), search);
  }

  @Get(':id')
  @RequirePermissions('view_users')
  async findOne(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.usersService.findById(id, tenantId);
  }

  @Post()
  @RequirePermissions('create_users')
  async create(@CurrentUser('tenantId') tenantId: string, @Body() data: CreateUserDto) {
    return this.usersService.create(tenantId, data);
  }

  @Patch(':id')
  @RequirePermissions('edit_users')
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() data: UpdateUserDto,
  ) {
    return this.usersService.update(id, tenantId, data);
  }

  @Delete(':id')
  @RequirePermissions('delete_users')
  async remove(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.usersService.softDelete(id, tenantId);
  }
}
