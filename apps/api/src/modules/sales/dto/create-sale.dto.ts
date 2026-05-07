import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min, ValidateNested, ArrayMinSize } from 'class-validator';

export class CreateSaleItemDto {
  @IsString()
  @IsNotEmpty()
  variantId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number = 0;
}

export class AddPaymentDto {
  @IsString()
  @IsNotEmpty()
  method: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  installments?: number = 1;

  @IsOptional()
  @IsNumber()
  installmentAmount?: number;
}

export class CreateSaleDto {
  @IsString()
  @IsNotEmpty()
  storeId: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddPaymentDto)
  payments?: AddPaymentDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number = 0;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}