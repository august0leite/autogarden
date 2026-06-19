import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsArray,
  ArrayUnique,
  IsUUID,
} from "class-validator";

export class CreateCultivationDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty({ required: false, type: [String], format: "uuid" })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID("4", { each: true })
  strainIds?: string[];

  @ApiProperty({ default: 40 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  soilMoistureMin?: number;

  @ApiProperty({ default: 70 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  soilMoistureMax?: number;

  @ApiProperty({ default: 15 })
  @IsOptional()
  @IsNumber()
  temperatureMin?: number;

  @ApiProperty({ default: 35 })
  @IsOptional()
  @IsNumber()
  temperatureMax?: number;

  @ApiProperty({ default: 30 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  lightMin?: number;

  @ApiProperty({ default: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  lightMax?: number;

  @ApiProperty({ default: 30 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cooldownMinutes?: number;
}
