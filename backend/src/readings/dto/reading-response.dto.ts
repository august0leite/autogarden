import { ApiProperty } from "@nestjs/swagger";

export class ReadingResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  soilMoisture: number;

  @ApiProperty()
  temperature: number;

  @ApiProperty()
  light: number;

  @ApiProperty()
  timestamp: Date;

  @ApiProperty()
  deviceId: string;
}
