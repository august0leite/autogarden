import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReadingsService } from './readings.service';
import { ActionsService } from '../actions/actions.service';
import { DevicesService } from '../devices/devices.service';
import { 
  CreateReadingDto, 
  ReadingResponseDto, 
  DecisionResponseDto,
  DecisionHistoryDto,
} from './dto';
import { CreateActionDto, ActionScheduledDto, ActionResponseDto } from '../actions/dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentDevice } from '../devices/decorators/current-device.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { DeviceAuthGuard } from '../devices/guards/device-auth.guard';

@ApiTags('devices')
@Controller('devices')
export class ReadingsController {
  constructor(
    private readonly readingsService: ReadingsService,
    private readonly actionsService: ActionsService,
    private readonly devicesService: DevicesService,
  ) {}

  // ========== ENDPOINTS DE DISPOSITIVO (usa token) ==========

  @Post(':deviceId/readings')
  @Public()
  @UseGuards(DeviceAuthGuard)
  @ApiOperation({ summary: 'Enviar leitura do sensor (dispositivo)' })
  @ApiResponse({ status: 201, type: DecisionResponseDto })
  async createReading(
    @Param('deviceId') deviceId: string,
    @CurrentDevice('id') deviceIdFromToken: string,
    @Body() createDto: CreateReadingDto,
  ) {
    // Verificar se deviceId do parâmetro corresponde ao token
    if (deviceId !== deviceIdFromToken) {
      throw new Error('DEVICE_ID_MISMATCH');
    }
    return this.readingsService.createReading(deviceId, createDto);
  }

  @Get(':deviceId/ping')
  @Public()
  @UseGuards(DeviceAuthGuard)
  @ApiOperation({ summary: 'Healthcheck do dispositivo' })
  @ApiResponse({ status: 200, schema: { properties: { status: { type: 'string', enum: ['online'] } } } })
  async ping(
    @Param('deviceId') deviceId: string,
    @CurrentDevice('id') deviceIdFromToken: string,
  ) {
    if (deviceId !== deviceIdFromToken) {
      throw new Error('DEVICE_ID_MISMATCH');
    }
    await this.devicesService.updatePing(deviceId);
    return { status: 'online' };
  }

  // ========== ENDPOINTS DE USUÁRIO ==========

  @Get(':deviceId/readings')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Histórico de leituras' })
  @ApiQuery({ name: 'from', required: false, type: String })
  @ApiQuery({ name: 'to', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, type: [ReadingResponseDto] })
  async getReadings(
    @Param('deviceId') deviceId: string,
    @CurrentUser('id') userId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
  ) {
    // Validar que dispositivo pertence ao usuário
    await this.devicesService.findOne(deviceId, userId);

    return this.readingsService.findAllByDevice(deviceId, {
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':deviceId/decisions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Histórico de decisões' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, type: [DecisionHistoryDto] })
  async getDecisions(
    @Param('deviceId') deviceId: string,
    @CurrentUser('id') userId: string,
    @Query('limit') limit?: string,
  ) {
    // Validar que dispositivo pertence ao usuário
    await this.devicesService.findOne(deviceId, userId);

    return this.readingsService.findDecisionsByDevice(
      deviceId,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Get(':deviceId/actions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Histórico de ações' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, type: [ActionResponseDto] })
  async getActions(
    @Param('deviceId') deviceId: string,
    @CurrentUser('id') userId: string,
    @Query('limit') limit?: string,
  ) {
    // Validar que dispositivo pertence ao usuário
    await this.devicesService.findOne(deviceId, userId);

    return this.actionsService.findAllByDevice(
      deviceId,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Post(':deviceId/actions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar ação manual' })
  @ApiResponse({ status: 201, type: ActionScheduledDto })
  async createManualAction(
    @Param('deviceId') deviceId: string,
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateActionDto,
  ) {
    // Validar que dispositivo pertence ao usuário
    await this.devicesService.findOne(deviceId, userId);

    return this.actionsService.createManualAction(deviceId, createDto);
  }
}
