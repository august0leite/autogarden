import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { DevicesService } from "../devices/devices.service";
import { ActionsService } from "../actions/actions.service";
import { DecisionEngineService } from "./decision-engine.service";
import { CreateReadingDto } from "./dto";

@Injectable()
export class ReadingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly devicesService: DevicesService,
    private readonly actionsService: ActionsService,
    private readonly decisionEngine: DecisionEngineService,
  ) {}

  async createReading(deviceId: string, createDto: CreateReadingDto) {
    // Validar dispositivo
    const device = await this.prisma.device.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      throw new NotFoundException("DEVICE_NOT_FOUND");
    }

    // Atualizar ping do dispositivo
    await this.devicesService.updatePing(deviceId);

    // Salvar leitura
    const reading = await this.prisma.reading.create({
      data: {
        deviceId,
        soilMoisture: createDto.soil_moisture,
        temperature: createDto.temperature,
        light: createDto.light,
      },
    });

    // Executar motor de decisão
    const decisionResult = await this.decisionEngine.analyzeReading(
      deviceId,
      device.cultivationId,
      {
        soilMoisture: createDto.soil_moisture,
        temperature: createDto.temperature,
        light: createDto.light,
      },
    );

    // Salvar decisão
    const decision = await this.prisma.decision.create({
      data: {
        deviceId,
        readingId: reading.id,
        decision: decisionResult.decision,
        reason: decisionResult.reason,
      },
    });

    // Se há ação a ser tomada, criar
    let action = null;
    if (decisionResult.action) {
      action = await this.actionsService.createAutoAction(
        deviceId,
        decision.id,
        decisionResult.action.type,
        decisionResult.action.durationSeconds,
      );
    }

    // Retornar resposta para o dispositivo
    return {
      decision: decisionResult.decision,
      reason: decisionResult.reason,
      action: action
        ? {
            type: action.type.toLowerCase(),
            duration_seconds: action.durationSeconds,
          }
        : undefined,
    };
  }

  async findAllByDevice(
    deviceId: string,
    options?: { from?: Date; to?: Date; limit?: number },
  ) {
    const limit = options?.limit || 100;

    const where: any = { deviceId };

    if (options?.from || options?.to) {
      where.timestamp = {};
      if (options.from) where.timestamp.gte = options.from;
      if (options.to) where.timestamp.lte = options.to;
    }

    return this.prisma.reading.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: limit,
    });
  }

  async findDecisionsByDevice(deviceId: string, limit = 100) {
    return this.prisma.decision.findMany({
      where: { deviceId },
      orderBy: { timestamp: "desc" },
      take: limit,
    });
  }
}
