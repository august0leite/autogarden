import { ApiProperty } from "@nestjs/swagger";

export class CultivationResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false })
  plantType?: string;

  @ApiProperty({ required: false, type: [String], format: "uuid" })
  strainIds?: string[];

  @ApiProperty()
  startDate!: Date;

  @ApiProperty()
  soilMoistureMin!: number;

  @ApiProperty()
  soilMoistureMax!: number;

  @ApiProperty()
  temperatureMin!: number;

  @ApiProperty()
  temperatureMax!: number;

  @ApiProperty()
  lightMin!: number;

  @ApiProperty()
  lightMax!: number;

  @ApiProperty()
  cooldownMinutes!: number;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
