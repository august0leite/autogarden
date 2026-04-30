import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateDeviceDto } from './dto';
import * as crypto from 'crypto';

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createDto: CreateDeviceDto) {
    // Verificar se cultivo existe e pertence ao usuário
    const cultivation = await this.prisma.cultivation.findUnique({
      where: { id: createDto.cultivationId },
    });

    if (!cultivation) {
      throw new NotFoundException('CULTIVATION_NOT_FOUND');
    }

    if (cultivation.userId !== userId) {
      throw new ConflictException('NOT_OWNER_OF_CULTIVATION');
    }

    // Verificar se cultivo já tem dispositivo
    const existingDevice = await this.prisma.device.findUnique({
      where: { cultivationId: createDto.cultivationId },
    });

    if (existingDevice) {
      throw new ConflictException('CULTIVATION_ALREADY_HAS_DEVICE');
    }

    // Gerar token único para o dispositivo
    const token = this.generateDeviceToken();

    const device = await this.prisma.device.create({
      data: {
        ...createDto,
        token,
      },
    });

    return device;
  }

  async findAllByUser(userId: string) {
    return this.prisma.device.findMany({
      where: {
        cultivation: {
          userId,
        },
      },
      include: {
        cultivation: {
          select: {
            id: true,
            name: true,
            plantType: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(deviceId: string, userId: string) {
    const device = await this.prisma.device.findUnique({
      where: { id: deviceId },
      include: {
        cultivation: true,
      },
    });

    if (!device) {
      throw new NotFoundException('DEVICE_NOT_FOUND');
    }

    if (device.cultivation.userId !== userId) {
      throw new NotFoundException('DEVICE_NOT_FOUND');
    }

    return device;
  }

  async findByToken(token: string) {
    const device = await this.prisma.device.findUnique({
      where: { token },
      include: {
        cultivation: true,
      },
    });

    if (!device) {
      throw new NotFoundException('INVALID_DEVICE_TOKEN');
    }

    return device;
  }

  async updatePing(deviceId: string) {
    return this.prisma.device.update({
      where: { id: deviceId },
      data: {
        status: 'ONLINE',
        lastPingAt: new Date(),
      },
    });
  }

  async updateStatus(deviceId: string, status: 'ONLINE' | 'OFFLINE' | 'ERROR') {
    return this.prisma.device.update({
      where: { id: deviceId },
      data: { status },
    });
  }

  async getStatus(deviceId: string, userId: string) {
    const device = await this.findOne(deviceId, userId);

    // Buscar última leitura
    const lastReading = await this.prisma.reading.findFirst({
      where: { deviceId },
      orderBy: { timestamp: 'desc' },
    });

    // Buscar última irrigação
    const lastIrrigation = await this.prisma.action.findFirst({
      where: {
        deviceId,
        type: 'IRRIGATION',
        status: 'EXECUTED',
      },
      orderBy: { executedAt: 'desc' },
    });

    return {
      lastReading: lastReading
        ? {
            soilMoisture: lastReading.soilMoisture,
            temperature: lastReading.temperature,
            light: lastReading.light,
            timestamp: lastReading.timestamp,
          }
        : undefined,
      lastIrrigation: lastIrrigation
        ? {
            timestamp: lastIrrigation.executedAt!,
            durationSeconds: lastIrrigation.durationSeconds!,
          }
        : undefined,
      status: device.status,
    };
  }

  private generateDeviceToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
