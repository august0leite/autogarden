import { ApiProperty } from '@nestjs/swagger';

export class DeviceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ enum: ['ONLINE', 'OFFLINE', 'ERROR'] })
  status: string;

  @ApiProperty({ required: false })
  lastPingAt?: Date;

  @ApiProperty()
  cultivationId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
