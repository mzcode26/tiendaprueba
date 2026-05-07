import { Controller, Get, Patch, Body } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

@Controller('settings')
export class SettingsController {
  constructor(private service: SettingsService) {}

  @Get()
  @RequirePermissions('view_settings')
  findAll(@CurrentUser() user: JwtPayload) {
    return this.service.findAll(user.tenantId);
  }

  @Patch()
  @RequirePermissions('edit_settings')
  update(
    @CurrentUser() user: JwtPayload,
    @Body() data: UpdateSettingsDto,
  ) {
    return this.service.update(user.tenantId, data);
  }
}