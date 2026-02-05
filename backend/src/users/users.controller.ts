import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TracksService } from '../tracks/tracks.service';
import { TrackResponseDto } from '../tracks/dto';

@ApiTags('Users')
@Controller('v1/users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly tracksService: TracksService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Obter informações do usuário autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Informações do usuário retornadas com sucesso',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async getMe(@CurrentUser('sub') userId: string): Promise<UserResponseDto> {
    return this.usersService.findById(userId);
  }

  @Get('me/tracks')
  @ApiOperation({ summary: 'Listar tracks do usuário autenticado' })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Número de registros a pular' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Número de registros a retornar' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tracks do usuário retornada com sucesso',
    type: [TrackResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getMyTracks(
    @CurrentUser('sub') userId: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const skipNum = skip ? parseInt(skip, 10) : 0;
    const takeNum = take ? parseInt(take, 10) : 20;
    
    return this.tracksService.findByUserId(userId, skipNum, takeNum);
  }
}
