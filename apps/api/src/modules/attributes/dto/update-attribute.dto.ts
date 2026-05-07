import { PartialType } from '@nestjs/mapped-types';
import { CreateAttributeDto, CreateAttributeValueDto } from './create-attribute.dto';

export class UpdateAttributeDto extends PartialType(CreateAttributeDto) {}

export class UpdateAttributeValueDto extends PartialType(CreateAttributeValueDto) {}