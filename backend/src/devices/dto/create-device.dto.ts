import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsUUID } from "class-validator";

export class CreateDeviceDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ description: "ID do cultivo associado" })
  @IsUUID()
  cultivationId: string;
}
