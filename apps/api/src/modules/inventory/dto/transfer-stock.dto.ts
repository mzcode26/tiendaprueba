import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class TransferStockDto {
  @IsString()
  variantId: string;

  @IsString()
  fromStoreId: string;

  @IsString()
  toStoreId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  notes?: string;
}