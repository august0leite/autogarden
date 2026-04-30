import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CultivationsService } from './cultivations.service';
import { CreateCultivationDto, UpdateCultivationDto, CultivationResponseDto } from './dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('cultivations')
@ApiBearerAuth()
@Controller('cultivations')
export class CultivationsController {
  constructor(private readonly cultivationsService: CultivationsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo cultivo' })
  @ApiResponse({ status: 201, type: CultivationResponseDto })
  async create(
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateCultivationDto,
  ) {
    return this.cultivationsService.create(userId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar cultivos do usuário' })
  @ApiResponse({ status: 200, type: [CultivationResponseDto] })
  async findAll(@CurrentUser('id') userId: string) {
    return this.cultivationsService.findAllByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter cultivo específico' })
  @ApiResponse({ status: 200, type: CultivationResponseDto })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.cultivationsService.findOne(id, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar configurações do cultivo' })
  @ApiResponse({ status: 200, type: CultivationResponseDto })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateCultivationDto,
  ) {
    return this.cultivationsService.update(id, userId, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar cultivo' })
  @ApiResponse({ status: 200 })
  async delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.cultivationsService.delete(id, userId);
  }
}
