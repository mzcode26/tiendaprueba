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
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomersDto } from './dto/query-customers.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @RequirePermissions('view_customers')
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query() query: QueryCustomersDto,
  ) {
    return this.customersService.findAll(user.tenantId, query);
  }

  @Get(':id')
  @RequirePermissions('view_customers')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.customersService.findById(id, user.tenantId);
  }

  @Get(':id/stats')
  @RequirePermissions('view_customers')
  getStats(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.customersService.getStats(id, user.tenantId);
  }

  @Post()
  @RequirePermissions('create_customers')
  create(@Body() dto: CreateCustomerDto, @CurrentUser() user: JwtPayload) {
    return this.customersService.create(user.tenantId, dto);
  }

  @Patch(':id')
  @RequirePermissions('edit_customers')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.customersService.update(id, user.tenantId, dto);
  }

  @Delete(':id')
  @RequirePermissions('delete_customers')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.customersService.remove(id, user.tenantId);
  }
}