import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { TracksService } from './tracks.service';
import { TrackResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Tracks')
@Controller('v1/tracks')
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Listar todos os tracks' })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Número de registros a pular' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Número de registros a retornar' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tracks retornada com sucesso',
    type: [TrackResponseDto],
  })
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const skipNum = skip ? parseInt(skip, 10) : 0;
    const takeNum = take ? parseInt(take, 10) : 20;
    
    return this.tracksService.findAll(skipNum, takeNum);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar tracks do usuário autenticado' })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Número de registros a pular' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Número de registros a retornar' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tracks do usuário retornada com sucesso',
    type: [TrackResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async findMyTracks(
    @CurrentUser('sub') userId: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const skipNum = skip ? parseInt(skip, 10) : 0;
    const takeNum = take ? parseInt(take, 10) : 20;
    
    return this.tracksService.findByUserId(userId, skipNum, takeNum);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Buscar track por ID' })
  @ApiResponse({
    status: 200,
    description: 'Track encontrado com sucesso',
    type: TrackResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Track não encontrado' })
  async findOne(@Param('id') id: string) {
    return this.tracksService.findById(id);
  }
}
