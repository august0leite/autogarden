import { ApiProperty } from "@nestjs/swagger";
import { StrainDifficultyDto, StrainTypeDto } from "./strain.enums";

export class StrainSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  imageUrl?: string;

  @ApiProperty({ enum: StrainTypeDto })
  type: StrainTypeDto;

  @ApiProperty()
  thcPercentage: number;

  @ApiProperty({ enum: StrainDifficultyDto })
  difficulty: StrainDifficultyDto;

  @ApiProperty()
  vegetativeDays: number;

  @ApiProperty()
  floweringDays: number;
}
