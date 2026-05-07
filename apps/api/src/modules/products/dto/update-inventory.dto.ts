import { IsNumber, Min } from 'class-validator';

export class UpdateInventoryDto {
  @IsNumber()
  @Min(0)
  quantity!: number;
}
