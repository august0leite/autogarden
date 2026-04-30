import { ApiProperty } from '@nestjs/swagger';

class ActionInstructionDto {
  @ApiProperty({ enum: ['irrigation', 'ventilation', 'lighting'] })
  type: string;

  @ApiProperty({ required: false })
  duration_seconds?: number;
}

export class DecisionResponseDto {
  @ApiProperty({ 
    enum: ['NO_ACTION', 'IRRIGATE', 'ALERT_TEMP_HIGH', 'ALERT_TEMP_LOW', 'ALERT_LIGHT_LOW'] 
  })
  decision: string;

  @ApiProperty()
  reason: string;

  @ApiProperty({ type: ActionInstructionDto, required: false })
  action?: ActionInstructionDto;
}
