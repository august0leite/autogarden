import { Test, TestingModule } from "@nestjs/testing";
import { DecisionEngineService } from "./decision-engine.service";
import { PrismaService } from "../database/prisma.service";

describe("DecisionEngineService", () => {
  let service: DecisionEngineService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockCultivation = {
    id: "cult-123",
    userId: "user-123",
    name: "Tomato Garden",
    plantType: "Tomato",
    soilMoistureMin: 40,
    soilMoistureMax: 70,
    temperatureMin: 18,
    temperatureMax: 30,
    lightMin: 60,
    cooldownMinutes: 30,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockPrismaService = {
      cultivation: {
        findUnique: jest.fn(),
      },
      action: {
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DecisionEngineService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DecisionEngineService>(DecisionEngineService);
    prismaService = module.get(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("analyzeReading", () => {
    beforeEach(() => {
      prismaService.cultivation.findUnique.mockResolvedValue(mockCultivation);
      prismaService.action.findFirst.mockResolvedValue(null);
    });

    it("should return NO_ACTION when all parameters are within optimal range", async () => {
      const reading = {
        soilMoisture: 55,
        temperature: 24,
        light: 80,
      };

      const result = await service.analyzeReading(
        "device-123",
        "cult-123",
        reading,
      );

      expect(result).toEqual({
        decision: "NO_ACTION",
        reason: "within_optimal_range",
      });
    });

    it("should return IRRIGATE when soil moisture is below minimum", async () => {
      const reading = {
        soilMoisture: 35,
        temperature: 24,
        light: 80,
      };

      const result = await service.analyzeReading(
        "device-123",
        "cult-123",
        reading,
      );

      expect(result).toEqual({
        decision: "IRRIGATE",
        reason: "soil_moisture_below_threshold",
        action: {
          type: "IRRIGATION",
          durationSeconds: 10,
        },
      });
    });

    it("should return NO_ACTION when soil moisture is low but in cooldown", async () => {
      const reading = {
        soilMoisture: 35,
        temperature: 24,
        light: 80,
      };

      const recentIrrigation = {
        id: "action-123",
        deviceId: "device-123",
        type: "IRRIGATION" as const,
        status: "EXECUTED" as const,
        executedAt: new Date(), // Just executed
        durationSeconds: 10,
        origin: "AUTO" as const,
        timestamp: new Date(),
        decisionId: "decision-123",
      };

      prismaService.action.findFirst.mockResolvedValue(recentIrrigation);

      const result = await service.analyzeReading(
        "device-123",
        "cult-123",
        reading,
      );

      expect(result).toEqual({
        decision: "NO_ACTION",
        reason: "soil_moisture_low_but_in_cooldown",
      });
    });

    it("should allow irrigation after cooldown period", async () => {
      const reading = {
        soilMoisture: 35,
        temperature: 24,
        light: 80,
      };

      const oldIrrigation = {
        id: "action-123",
        deviceId: "device-123",
        type: "IRRIGATION" as const,
        status: "EXECUTED" as const,
        executedAt: new Date(Date.now() - 31 * 60 * 1000), // 31 minutes ago
        durationSeconds: 10,
        origin: "AUTO" as const,
        timestamp: new Date(),
        decisionId: "decision-123",
      };

      prismaService.action.findFirst.mockResolvedValue(oldIrrigation);

      const result = await service.analyzeReading(
        "device-123",
        "cult-123",
        reading,
      );

      expect(result.decision).toBe("IRRIGATE");
      expect(result.action).toBeDefined();
    });

    it("should return ALERT_TEMP_HIGH when temperature exceeds maximum", async () => {
      const reading = {
        soilMoisture: 55,
        temperature: 35,
        light: 80,
      };

      const result = await service.analyzeReading(
        "device-123",
        "cult-123",
        reading,
      );

      expect(result).toEqual({
        decision: "ALERT_TEMP_HIGH",
        reason: "temperature_above_threshold",
      });
    });

    it("should return ALERT_TEMP_LOW when temperature is below minimum", async () => {
      const reading = {
        soilMoisture: 55,
        temperature: 10,
        light: 80,
      };

      const result = await service.analyzeReading(
        "device-123",
        "cult-123",
        reading,
      );

      expect(result).toEqual({
        decision: "ALERT_TEMP_LOW",
        reason: "temperature_below_threshold",
      });
    });

    it("should return ALERT_LIGHT_LOW when light is below minimum", async () => {
      const reading = {
        soilMoisture: 55,
        temperature: 24,
        light: 40,
      };

      const result = await service.analyzeReading(
        "device-123",
        "cult-123",
        reading,
      );

      expect(result).toEqual({
        decision: "ALERT_LIGHT_LOW",
        reason: "light_below_threshold",
      });
    });

    it("should prioritize soil moisture over temperature alerts", async () => {
      const reading = {
        soilMoisture: 30,
        temperature: 35,
        light: 80,
      };

      const result = await service.analyzeReading(
        "device-123",
        "cult-123",
        reading,
      );

      expect(result.decision).toBe("IRRIGATE");
    });

    it("should prioritize temperature over light alerts", async () => {
      const reading = {
        soilMoisture: 55,
        temperature: 35,
        light: 40,
      };

      const result = await service.analyzeReading(
        "device-123",
        "cult-123",
        reading,
      );

      expect(result.decision).toBe("ALERT_TEMP_HIGH");
    });

    it("should return NO_ACTION when cultivation not found", async () => {
      prismaService.cultivation.findUnique.mockResolvedValue(null);

      const reading = {
        soilMoisture: 30,
        temperature: 24,
        light: 80,
      };

      const result = await service.analyzeReading(
        "device-123",
        "cult-999",
        reading,
      );

      expect(result).toEqual({
        decision: "NO_ACTION",
        reason: "cultivation_not_found",
      });
    });

    it("should handle edge case at exact threshold values", async () => {
      const reading = {
        soilMoisture: 40, // exactly at minimum
        temperature: 24,
        light: 80,
      };

      const result = await service.analyzeReading(
        "device-123",
        "cult-123",
        reading,
      );

      expect(result.decision).toBe("NO_ACTION");
    });
  });
});
