import { Controller, Get, Post, Patch, Delete, Query, Param, Body } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto, CustomerFiltersDto } from './dto/index';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

@Controller('customers')
export class CustomersController {
  constructor(private service: CustomersService) {}

  @Get()
  @RequirePermissions('view_customers')
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query() filters: CustomerFiltersDto,
  ) {
    return this.service.findAll(user.tenantId, filters);
  }

  @Get('top')
  @RequirePermissions('view_reports')
  getTopCustomers(
    @CurrentUser() user: JwtPayload,
    @Query('limit') limit?: number,
  ) {
    return this.service.getTopCustomers(user.tenantId, limit);
  }

  @Get(':id')
  @RequirePermissions('view_customers')
  findById(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.service.findById(user.tenantId, id);
  }

  @Post()
  @RequirePermissions('create_customers')
  create(
    @CurrentUser() user: JwtPayload,
    @Body() data: CreateCustomerDto,
  ) {
    return this.service.create(user.tenantId, data);
  }

  @Patch(':id')
  @RequirePermissions('edit_customers')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() data: UpdateCustomerDto,
  ) {
    return this.service.update(user.tenantId, id, data);
  }

  @Delete(':id')
  @RequirePermissions('delete_customers')
  remove(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.service.remove(user.tenantId, id);
  }
}