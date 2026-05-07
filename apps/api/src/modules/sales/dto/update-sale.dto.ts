import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSaleDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}