import { Injectable } from '@nestjs/common';
import { SettingsRepository } from './settings.repository';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private repository: SettingsRepository) {}

  async findAll(tenantId: string) {
    return this.repository.findAll(tenantId);
  }

  async update(tenantId: string, data: UpdateSettingsDto) {
    return this.repository.update(tenantId, data);
  }
}