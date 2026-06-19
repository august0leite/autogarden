import { Controller, Get, Param, ParseUUIDPipe } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Public } from "../auth/decorators/public.decorator";
import { StrainsService } from "./strains.service";
import { StrainSummaryDto, StrainResponseDto } from "./dto";

@ApiTags("strains")
@Public()
@Controller("v1/strains")
export class StrainsController {
  constructor(private readonly strainsService: StrainsService) {}

  @Get()
  @ApiOperation({ summary: "Listar strains (sem descrição)" })
  @ApiResponse({ status: 200, type: [StrainSummaryDto] })
  async findAll() {
    return this.strainsService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Obter strain por ID (completa)" })
  @ApiResponse({ status: 200, type: StrainResponseDto })
  async findOne(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.strainsService.findOne(id);
  }
}
