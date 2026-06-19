import { ApiProperty } from "@nestjs/swagger";
import {
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsString,
  IsDateString,
  IsArray,
  ArrayUnique,
  IsUUID,
} from "class-validator";

export class UpdateCultivationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  plantType?: string;

  @ApiProperty({ required: false, type: [String], format: "uuid" })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID("4", { each: true })
  strainIds?: string[];

  @ApiProperty({ required: false, type: String, format: "date-time" })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  soilMoistureMin?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  soilMoistureMax?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  temperatureMin?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  temperatureMax?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  lightMin?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  lightMax?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cooldownMinutes?: number;
}
