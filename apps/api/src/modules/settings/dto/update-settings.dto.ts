import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class GeneralSettingsDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string | null;

  @IsOptional()
  @IsString()
  phone?: string | null;

  @IsOptional()
  @IsString()
  address?: string | null;

  @IsOptional()
  @IsString()
  city?: string | null;

  @IsOptional()
  @IsString()
  country?: string | null;

  @IsString()
  currency: string;

  @IsString()
  timezone: string;

  @IsOptional()
  @IsString()
  logoUrl?: string | null;
}

class SalesSettingsDto {
  @IsOptional()
  @IsBoolean()
  allowNegativeStock?: boolean;

  @IsOptional()
  @IsNumber()
  defaultTax?: number;

  @IsOptional()
  @IsString()
  invoicePrefix?: string;
}

class InventorySettingsDto {
  @IsOptional()
  @IsNumber()
  lowStockThreshold?: number;

  @IsOptional()
  @IsBoolean()
  trackMovements?: boolean;
}

export class UpdateSettingsDto {
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => GeneralSettingsDto)
  general?: GeneralSettingsDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SalesSettingsDto)
  sales?: SalesSettingsDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => InventorySettingsDto)
  inventory?: InventorySettingsDto;
}