import { IsObject, IsOptional } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsObject()
  general?: Record<string, any>;

  @IsOptional()
  @IsObject()
  sales?: Record<string, any>;

  @IsOptional()
  @IsObject()
  inventory?: Record<string, any>;
}