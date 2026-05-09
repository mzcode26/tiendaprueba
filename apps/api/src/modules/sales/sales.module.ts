import { Module } from '@nestjs/common';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { SalesRepository } from './sales.repository';
import { InventoryModule } from '../inventory/inventory.module';
import { InventoryRepository } from '../inventory/inventory.repository';

@Module({
  imports: [InventoryModule],
  controllers: [SalesController],
  providers: [SalesService, SalesRepository, InventoryRepository],
  exports: [SalesService],
})
export class SalesModule {}