import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAttributeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  slug?: string;
}

export class CreateAttributeValueDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  value!: string;

  @IsOptional()
  @IsString()
  slug?: string;
}