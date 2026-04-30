import { ApiProperty } from '@nestjs/swagger';

export class ActionScheduledDto {
  @ApiProperty({ enum: ['scheduled'] })
  status: 'scheduled';

  @ApiProperty({ enum: ['MANUAL', 'AUTO'] })
  origin: string;

  @ApiProperty()
  actionId: string;
}
