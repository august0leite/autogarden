import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { CreateActionDto } from "./dto";

@Injectable()
export class ActionsService {
  constructor(private readonly prisma: PrismaService) {}

  async createManualAction(deviceId: string, createDto: CreateActionDto) {
    const actionType = createDto.type.toUpperCase() as
      | "IRRIGATION"
      | "VENTILATION"
      | "LIGHTING";

    const action = await this.prisma.action.create({
      data: {
        deviceId,
        type: actionType,
        durationSeconds: createDto.duration_seconds,
        origin: "MANUAL",
        status: "PENDING",
      },
    });

    return {
      status: "scheduled" as const,
      origin: "MANUAL",
      actionId: action.id,
    };
  }

  async createAutoAction(
    deviceId: string,
    decisionId: string,
    type: "IRRIGATION" | "VENTILATION" | "LIGHTING",
    durationSeconds?: number,
  ) {
    return this.prisma.action.create({
      data: {
        deviceId,
        decisionId,
        type,
        durationSeconds,
        origin: "AUTO",
        status: "PENDING",
      },
    });
  }

  async findAllByDevice(deviceId: string, limit = 100) {
    return this.prisma.action.findMany({
      where: { deviceId },
      orderBy: { timestamp: "desc" },
      take: limit,
    });
  }

  async markAsExecuted(actionId: string) {
    return this.prisma.action.update({
      where: { id: actionId },
      data: {
        status: "EXECUTED",
        executedAt: new Date(),
      },
    });
  }
}
