import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

interface DecisionResult {
  decision:
    | "NO_ACTION"
    | "IRRIGATE"
    | "ALERT_TEMP_HIGH"
    | "ALERT_TEMP_LOW"
    | "ALERT_LIGHT_LOW";
  reason: string;
  action?: {
    type: "IRRIGATION" | "VENTILATION" | "LIGHTING";
    durationSeconds?: number;
  };
}

@Injectable()
export class DecisionEngineService {
  constructor(private readonly prisma: PrismaService) {}

  async analyzeReading(
    deviceId: string,
    cultivationId: string,
    reading: { soilMoisture: number; temperature: number; light: number },
  ): Promise<DecisionResult> {
    // Buscar configuração do cultivo
    const cultivation = await this.prisma.cultivation.findUnique({
      where: { id: cultivationId },
    });

    if (!cultivation) {
      return {
        decision: "NO_ACTION",
        reason: "cultivation_not_found",
      };
    }

    // Verificar cooldown de irrigação
    const lastIrrigation = await this.prisma.action.findFirst({
      where: {
        deviceId,
        type: "IRRIGATION",
        status: "EXECUTED",
      },
      orderBy: { executedAt: "desc" },
    });

    const now = new Date();
    const cooldownMs = cultivation.cooldownMinutes * 60 * 1000;
    const inCooldown =
      lastIrrigation &&
      lastIrrigation.executedAt &&
      now.getTime() - lastIrrigation.executedAt.getTime() < cooldownMs;

    // Prioridade 1: Umidade do solo (crítico para planta)
    if (reading.soilMoisture < cultivation.soilMoistureMin) {
      if (inCooldown) {
        return {
          decision: "NO_ACTION",
          reason: "soil_moisture_low_but_in_cooldown",
        };
      }

      return {
        decision: "IRRIGATE",
        reason: "soil_moisture_below_threshold",
        action: {
          type: "IRRIGATION",
          durationSeconds: 10, // Valor padrão, pode ser configurável
        },
      };
    }

    // Prioridade 2: Temperatura alta
    if (reading.temperature > cultivation.temperatureMax) {
      return {
        decision: "ALERT_TEMP_HIGH",
        reason: "temperature_above_threshold",
      };
    }

    // Prioridade 3: Temperatura baixa
    if (reading.temperature < cultivation.temperatureMin) {
      return {
        decision: "ALERT_TEMP_LOW",
        reason: "temperature_below_threshold",
      };
    }

    // Prioridade 4: Luz baixa
    if (reading.light < cultivation.lightMin) {
      return {
        decision: "ALERT_LIGHT_LOW",
        reason: "light_below_threshold",
      };
    }

    // Tudo dentro dos parâmetros
    return {
      decision: "NO_ACTION",
      reason: "within_optimal_range",
    };
  }
}
