import { ApiProperty } from "@nestjs/swagger";
import { StrainSummaryDto } from "./strain-summary.dto";

export class StrainResponseDto extends StrainSummaryDto {
  @ApiProperty({ required: false })
  description?: string;
}
