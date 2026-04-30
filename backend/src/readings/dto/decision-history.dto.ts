import { ApiProperty } from '@nestjs/swagger';

export class DecisionHistoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ 
    enum: ['NO_ACTION', 'IRRIGATE', 'ALERT_TEMP_HIGH', 'ALERT_TEMP_LOW', 'ALERT_LIGHT_LOW'] 
  })
  decision: string;

  @ApiProperty()
  reason: string;

  @ApiProperty()
  timestamp: Date;
}
