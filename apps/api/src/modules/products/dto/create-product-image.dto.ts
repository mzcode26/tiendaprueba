import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductImageDto {
  @IsString()
  @IsNotEmpty()
  url!: string;

  @IsOptional()
  @IsString()
  alt?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}