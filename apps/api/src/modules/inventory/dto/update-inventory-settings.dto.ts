import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateInventorySettingsDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  minStock?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxStock?: number;
}