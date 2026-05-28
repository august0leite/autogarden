import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, Min, Max } from "class-validator";

export class CreateReadingDto {
  @ApiProperty({ description: "Umidade do solo (0-100%)" })
  @IsNumber()
  @Min(0)
  @Max(100)
  soil_moisture: number;

  @ApiProperty({ description: "Temperatura (°C)" })
  @IsNumber()
  @Min(-50)
  @Max(100)
  temperature: number;

  @ApiProperty({ description: "Luz (0-100%)" })
  @IsNumber()
  @Min(0)
  @Max(100)
  light: number;
}
