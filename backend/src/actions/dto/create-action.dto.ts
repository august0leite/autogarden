import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';

export enum ActionType {
  IRRIGATION = 'irrigation',
  VENTILATION = 'ventilation',
  LIGHTING = 'lighting',
}

export class CreateActionDto {
  @ApiProperty({ enum: ActionType })
  @IsEnum(ActionType)
  type: ActionType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  duration_seconds?: number;
}
