import { ApiProperty } from "@nestjs/swagger";

export class ActionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ["IRRIGATION", "VENTILATION", "LIGHTING"] })
  type: string;

  @ApiProperty({ required: false })
  durationSeconds?: number;

  @ApiProperty({ enum: ["AUTO", "MANUAL"] })
  origin: string;

  @ApiProperty({ enum: ["PENDING", "EXECUTED", "FAILED"] })
  status: string;

  @ApiProperty()
  timestamp: Date;

  @ApiProperty({ required: false })
  executedAt?: Date;

  @ApiProperty()
  deviceId: string;
}
