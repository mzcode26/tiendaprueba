import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  //Min,
} from 'class-validator';

export enum AdjustmentType {
  ADD = 'ADD',
  REMOVE = 'REMOVE',
  SET = 'SET',
}

export class AdjustStockDto {
  @IsString()
  variantId: string;

  @IsString()
  storeId: string;

  @IsNumber()
  quantity: number;

  @IsEnum(AdjustmentType)
  type: AdjustmentType;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  reference?: string;
}