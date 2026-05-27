import { ApiProperty } from "@nestjs/swagger";

class LastReadingDto {
  @ApiProperty()
  soilMoisture: number;

  @ApiProperty()
  temperature: number;

  @ApiProperty()
  light: number;

  @ApiProperty()
  timestamp: Date;
}

class LastIrrigationDto {
  @ApiProperty()
  timestamp: Date;

  @ApiProperty()
  durationSeconds: number;
}

export class DeviceStatusDto {
  @ApiProperty({ type: LastReadingDto, required: false })
  lastReading?: LastReadingDto;

  @ApiProperty({ type: LastIrrigationDto, required: false })
  lastIrrigation?: LastIrrigationDto;

  @ApiProperty()
  status: string;
}
