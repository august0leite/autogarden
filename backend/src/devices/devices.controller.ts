import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { DevicesService } from "./devices.service";
import { CreateDeviceDto, DeviceResponseDto, DeviceStatusDto } from "./dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@ApiTags("devices")
@ApiBearerAuth()
@Controller("v1/devices")
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  @ApiOperation({ summary: "Criar novo dispositivo" })
  @ApiResponse({ status: 201, type: DeviceResponseDto })
  async create(
    @CurrentUser("userId") userId: string,
    @Body() createDto: CreateDeviceDto,
  ) {
    return this.devicesService.create(userId, createDto);
  }

  @Get()
  @ApiOperation({ summary: "Listar dispositivos do usuário" })
  @ApiResponse({ status: 200, type: [DeviceResponseDto] })
  async findAll(@CurrentUser("userId") userId: string) {
    return this.devicesService.findAllByUser(userId);
  }

  @Get(":deviceId")
  @ApiOperation({ summary: "Obter dispositivo específico" })
  @ApiResponse({ status: 200, type: DeviceResponseDto })
  async findOne(
    @Param("deviceId") deviceId: string,
    @CurrentUser("userId") userId: string,
  ) {
    return this.devicesService.findOne(deviceId, userId);
  }

  @Get(":deviceId/status")
  @ApiOperation({ summary: "Obter estado atual do cultivo" })
  @ApiResponse({ status: 200, type: DeviceStatusDto })
  async getStatus(
    @Param("deviceId") deviceId: string,
    @CurrentUser("userId") userId: string,
  ) {
    return this.devicesService.getStatus(deviceId, userId);
  }
}
