import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { ReadingsService } from "./readings.service";
import { PrismaService } from "../database/prisma.service";
import { DevicesService } from "../devices/devices.service";
import { ActionsService } from "../actions/actions.service";
import { DecisionEngineService } from "./decision-engine.service";
import { CreateReadingDto } from "./dto";

describe("ReadingsService", () => {
  let service: ReadingsService;
  let prismaService: jest.Mocked<PrismaService>;
  let devicesService: jest.Mocked<DevicesService>;
  let actionsService: jest.Mocked<ActionsService>;
  let decisionEngine: jest.Mocked<DecisionEngineService>;

  const mockDevice = {
    id: "device-123",
    cultivationId: "cult-123",
    name: "Arduino Uno",
    model: "Arduino Uno R3",
    token: "device-token",
    status: "ONLINE" as const,
    lastPingAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockReading = {
    id: "reading-123",
    deviceId: "device-123",
    soilMoisture: 45,
    temperature: 25,
    light: 75,
    timestamp: new Date(),
  };

  const mockDecision = {
    id: "decision-123",
    deviceId: "device-123",
    readingId: "reading-123",
    decision: "NO_ACTION" as const,
    reason: "within_optimal_range",
    timestamp: new Date(),
  };

  const mockAction = {
    id: "action-123",
    deviceId: "device-123",
    type: "IRRIGATION" as const,
    durationSeconds: 10,
    status: "PENDING" as const,
    origin: "AUTO" as const,
    timestamp: new Date(),
    executedAt: null,
    decisionId: "decision-123",
  };

  beforeEach(async () => {
    const mockPrismaService = {
      device: {
        findUnique: jest.fn(),
      },
      reading: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      decision: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const mockDevicesService = {
      updatePing: jest.fn(),
    };

    const mockActionsService = {
      createAutoAction: jest.fn(),
    };

    const mockDecisionEngine = {
      analyzeReading: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReadingsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: DevicesService,
          useValue: mockDevicesService,
        },
        {
          provide: ActionsService,
          useValue: mockActionsService,
        },
        {
          provide: DecisionEngineService,
          useValue: mockDecisionEngine,
        },
      ],
    }).compile();

    service = module.get<ReadingsService>(ReadingsService);
    prismaService = module.get(PrismaService);
    devicesService = module.get(DevicesService);
    actionsService = module.get(ActionsService);
    decisionEngine = module.get(DecisionEngineService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createReading", () => {
    it("should successfully create reading without action", async () => {
      const createDto: CreateReadingDto = {
        soil_moisture: 55,
        temperature: 24,
        light: 80,
      };

      prismaService.device.findUnique.mockResolvedValue(mockDevice);
      devicesService.updatePing.mockResolvedValue(mockDevice);
      prismaService.reading.create.mockResolvedValue(mockReading);

      decisionEngine.analyzeReading.mockResolvedValue({
        decision: "NO_ACTION",
        reason: "within_optimal_range",
      });

      prismaService.decision.create.mockResolvedValue(mockDecision);

      const result = await service.createReading("device-123", createDto);

      expect(prismaService.device.findUnique).toHaveBeenCalledWith({
        where: { id: "device-123" },
      });
      expect(devicesService.updatePing).toHaveBeenCalledWith("device-123");
      expect(prismaService.reading.create).toHaveBeenCalledWith({
        data: {
          deviceId: "device-123",
          soilMoisture: 55,
          temperature: 24,
          light: 80,
        },
      });
      expect(result).toEqual({
        decision: "NO_ACTION",
        reason: "within_optimal_range",
        action: undefined,
      });
    });

    it("should create reading with irrigation action", async () => {
      const createDto: CreateReadingDto = {
        soil_moisture: 30,
        temperature: 24,
        light: 80,
      };

      prismaService.device.findUnique.mockResolvedValue(mockDevice);
      devicesService.updatePing.mockResolvedValue(mockDevice);
      prismaService.reading.create.mockResolvedValue(mockReading);

      decisionEngine.analyzeReading.mockResolvedValue({
        decision: "IRRIGATE",
        reason: "soil_moisture_below_threshold",
        action: {
          type: "IRRIGATION",
          durationSeconds: 10,
        },
      });

      const irrigationDecision = {
        ...mockDecision,
        decision: "IRRIGATE" as const,
        reason: "soil_moisture_below_threshold",
      };

      prismaService.decision.create.mockResolvedValue(irrigationDecision);
      actionsService.createAutoAction.mockResolvedValue(mockAction);

      const result = await service.createReading("device-123", createDto);

      expect(actionsService.createAutoAction).toHaveBeenCalledWith(
        "device-123",
        irrigationDecision.id,
        "IRRIGATION",
        10,
      );
      expect(result).toEqual({
        decision: "IRRIGATE",
        reason: "soil_moisture_below_threshold",
        action: {
          type: "irrigation",
          duration_seconds: 10,
        },
      });
    });

    it("should throw NotFoundException when device not found", async () => {
      const createDto: CreateReadingDto = {
        soil_moisture: 55,
        temperature: 24,
        light: 80,
      };

      prismaService.device.findUnique.mockResolvedValue(null);

      await expect(
        service.createReading("device-999", createDto),
      ).rejects.toThrow(NotFoundException);
    });

    it("should call decision engine with correct parameters", async () => {
      const createDto: CreateReadingDto = {
        soil_moisture: 55,
        temperature: 24,
        light: 80,
      };

      prismaService.device.findUnique.mockResolvedValue(mockDevice);
      devicesService.updatePing.mockResolvedValue(mockDevice);
      prismaService.reading.create.mockResolvedValue(mockReading);

      decisionEngine.analyzeReading.mockResolvedValue({
        decision: "NO_ACTION",
        reason: "within_optimal_range",
      });

      prismaService.decision.create.mockResolvedValue(mockDecision);

      await service.createReading("device-123", createDto);

      expect(decisionEngine.analyzeReading).toHaveBeenCalledWith(
        "device-123",
        "cult-123",
        {
          soilMoisture: 55,
          temperature: 24,
          light: 80,
        },
      );
    });
  });

  describe("findAllByDevice", () => {
    it("should return readings with default options", async () => {
      const readings = [mockReading];
      prismaService.reading.findMany.mockResolvedValue(readings);

      const result = await service.findAllByDevice("device-123");

      expect(prismaService.reading.findMany).toHaveBeenCalledWith({
        where: { deviceId: "device-123" },
        orderBy: { timestamp: "desc" },
        take: 100,
      });
      expect(result).toEqual(readings);
    });

    it("should return readings with custom limit", async () => {
      const readings = [mockReading];
      prismaService.reading.findMany.mockResolvedValue(readings);

      const result = await service.findAllByDevice("device-123", { limit: 50 });

      expect(prismaService.reading.findMany).toHaveBeenCalledWith({
        where: { deviceId: "device-123" },
        orderBy: { timestamp: "desc" },
        take: 50,
      });
      expect(result).toEqual(readings);
    });

    it("should filter readings by date range", async () => {
      const from = new Date("2024-01-01");
      const to = new Date("2024-01-31");
      const readings = [mockReading];

      prismaService.reading.findMany.mockResolvedValue(readings);

      const result = await service.findAllByDevice("device-123", { from, to });

      expect(prismaService.reading.findMany).toHaveBeenCalledWith({
        where: {
          deviceId: "device-123",
          timestamp: {
            gte: from,
            lte: to,
          },
        },
        orderBy: { timestamp: "desc" },
        take: 100,
      });
      expect(result).toEqual(readings);
    });

    it("should filter readings from specific date", async () => {
      const from = new Date("2024-01-01");
      const readings = [mockReading];

      prismaService.reading.findMany.mockResolvedValue(readings);

      const result = await service.findAllByDevice("device-123", { from });

      expect(prismaService.reading.findMany).toHaveBeenCalledWith({
        where: {
          deviceId: "device-123",
          timestamp: {
            gte: from,
          },
        },
        orderBy: { timestamp: "desc" },
        take: 100,
      });
      expect(result).toEqual(readings);
    });
  });

  describe("findDecisionsByDevice", () => {
    it("should return decisions with default limit", async () => {
      const decisions = [mockDecision];
      prismaService.decision.findMany.mockResolvedValue(decisions);

      const result = await service.findDecisionsByDevice("device-123");

      expect(prismaService.decision.findMany).toHaveBeenCalledWith({
        where: { deviceId: "device-123" },
        orderBy: { timestamp: "desc" },
        take: 100,
      });
      expect(result).toEqual(decisions);
    });

    it("should return decisions with custom limit", async () => {
      const decisions = [mockDecision];
      prismaService.decision.findMany.mockResolvedValue(decisions);

      const result = await service.findDecisionsByDevice("device-123", 50);

      expect(prismaService.decision.findMany).toHaveBeenCalledWith({
        where: { deviceId: "device-123" },
        orderBy: { timestamp: "desc" },
        take: 50,
      });
      expect(result).toEqual(decisions);
    });
  });
});
