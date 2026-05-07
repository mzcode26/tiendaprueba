import { Module } from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { AttributesController } from './attributes.controller';
import { AttributesRepository } from './attributes.repository';

@Module({
  controllers: [AttributesController],
  providers: [AttributesService, AttributesRepository],
  exports: [AttributesService],
})
export class AttributesModule {}