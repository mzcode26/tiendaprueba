import { IsEnum, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class PosSearchDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  q!: string;

  @IsString()
  @IsNotEmpty()
  storeId!: string;

  @IsOptional()
  @IsIn(['barcode', 'sku', 'name'])
  type?: 'barcode' | 'sku' | 'name';
}