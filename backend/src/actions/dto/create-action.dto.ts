import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateActionDto {
  @ApiProperty({ enum: ['irrigation', 'ventilation', 'lighting'] })
  @IsEnum(['irrigation', 'ventilation', 'lighting'])
  type: 'irrigation' | 'ventilation' | 'lighting';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  duration_seconds?: number;
}
