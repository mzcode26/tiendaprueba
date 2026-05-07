import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { InventoryMovementType } from '../types/inventory.type';

export class AdjustStockDto {
  @IsString()
  @IsNotEmpty()
  variantId!: string;

  @IsString()
  @IsNotEmpty()
  storeId!: string;

  @IsInt()
  @Min(-1000000)
  quantity!: number; // Can be negative for decrements

  @IsEnum(InventoryMovementType)
  type!: InventoryMovementType;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class TransferStockDto {
  @IsString()
  @IsNotEmpty()
  variantId!: string;

  @IsString()
  @IsNotEmpty()
  sourceStoreId!: string;

  @IsString()
  @IsNotEmpty()
  destinationStoreId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class InventoryFiltersDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  storeId?: string;

  @IsOptional()
  @IsString()
  variantId?: string;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  lowStock?: boolean;
}

export class MovementFiltersDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  inventoryId?: string;

  @IsOptional()
  @IsString()
  variantId?: string;

  @IsOptional()
  @IsString()
  storeId?: string;

  @IsOptional()
  @IsEnum(InventoryMovementType)
  type?: InventoryMovementType;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}