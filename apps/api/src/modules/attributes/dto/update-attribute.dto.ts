import { IsString, IsOptional } from 'class-validator';

export class UpdateAttributeDto {
  @IsOptional()
  @IsString()
  name?: string;
}

export class CreateAttributeValueDto {
  @IsString()
  value?: string;
}