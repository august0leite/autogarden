import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, ConflictException } from "@nestjs/common";
import { DevicesService } from "./devices.service";
import { PrismaService } from "../database/prisma.service";
import { CreateDeviceDto } from "./dto";

describe("DevicesService", () => {
  let service: DevicesService;
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

  const mockDevice = {
    id: "device-123",
    cultivationId: "cult-123",
    name: "Arduino Uno",
    model: "Arduino Uno R3",
    token: "device-token-123",
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

  const mockAction = {
    id: "action-123",
    deviceId: "device-123",
    type: "IRRIGATION" as const,
    durationSeconds: 10,
    status: "EXECUTED" as const,
    origin: "AUTO" as const,
    timestamp: new Date(),
    executedAt: new Date(),
    decisionId: "decision-123",
  };

  beforeEach(async () => {
    const mockPrismaService = {
      cultivation: {
        findUnique: jest.fn(),
      },
      device: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      reading: {
        findFirst: jest.fn(),
      },
      action: {
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DevicesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DevicesService>(DevicesService);
    prismaService = module.get(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should successfully create a device", async () => {
      const userId = "user-123";
      const createDto: CreateDeviceDto = {
        cultivationId: "cult-123",
        name: "Arduino Uno",
        model: "Arduino Uno R3",
      };

      prismaService.cultivation.findUnique.mockResolvedValue(mockCultivation);
      prismaService.device.findUnique.mockResolvedValue(null);
      prismaService.device.create.mockResolvedValue(mockDevice);

      const result = await service.create(userId, createDto);

      expect(prismaService.cultivation.findUnique).toHaveBeenCalledWith({
        where: { id: createDto.cultivationId },
      });
      expect(prismaService.device.create).toHaveBeenCalled();
      expect(result).toHaveProperty("token");
      expect(result).toEqual(mockDevice);
    });

    it("should throw NotFoundException when cultivation not found", async () => {
      const createDto: CreateDeviceDto = {
        cultivationId: "cult-999",
        name: "Arduino Uno",
        model: "Arduino Uno R3",
      };

      prismaService.cultivation.findUnique.mockResolvedValue(null);

      await expect(service.create("user-123", createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ConflictException when user is not owner of cultivation", async () => {
      const createDto: CreateDeviceDto = {
        cultivationId: "cult-123",
        name: "Arduino Uno",
        model: "Arduino Uno R3",
      };

      prismaService.cultivation.findUnique.mockResolvedValue(mockCultivation);

      await expect(service.create("other-user", createDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it("should throw ConflictException when cultivation already has device", async () => {
      const createDto: CreateDeviceDto = {
        cultivationId: "cult-123",
        name: "Arduino Uno",
        model: "Arduino Uno R3",
      };

      prismaService.cultivation.findUnique.mockResolvedValue(mockCultivation);
      prismaService.device.findUnique.mockResolvedValue(mockDevice);

      await expect(service.create("user-123", createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe("findAllByUser", () => {
    it("should return all devices for a user", async () => {
      const devices = [
        {
          ...mockDevice,
          cultivation: {
            id: "cult-123",
            name: "Tomato Garden",
            plantType: "Tomato",
          },
        },
      ];

      prismaService.device.findMany.mockResolvedValue(devices as any);

      const result = await service.findAllByUser("user-123");

      expect(prismaService.device.findMany).toHaveBeenCalledWith({
        where: {
          cultivation: {
            userId: "user-123",
          },
        },
        select: {
          id: true,
          name: true,
          model: true,
          description: true,
          status: true,
          lastPingAt: true,
          cultivationId: true,
          createdAt: true,
          updatedAt: true,
          cultivation: {
            select: {
              id: true,
              name: true,
              plantType: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      expect(result).toEqual(devices);
    });
  });

  describe("findOne", () => {
    it("should return device when found and user is owner", async () => {
      const deviceWithCultivation = {
        ...mockDevice,
        cultivation: mockCultivation,
      };

      prismaService.device.findUnique.mockResolvedValue(
        deviceWithCultivation as any,
      );

      const result = await service.findOne("device-123", "user-123");

      expect(result).toEqual({
        ...deviceWithCultivation,
        cultivation: {
          id: mockCultivation.id,
          name: mockCultivation.name,
          plantType: mockCultivation.plantType,
        },
      });
    });

    it("should throw NotFoundException when device not found", async () => {
      prismaService.device.findUnique.mockResolvedValue(null);

      await expect(service.findOne("device-999", "user-123")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw NotFoundException when user is not owner", async () => {
      const deviceWithCultivation = {
        ...mockDevice,
        cultivation: mockCultivation,
      };

      prismaService.device.findUnique.mockResolvedValue(
        deviceWithCultivation as any,
      );

      await expect(service.findOne("device-123", "other-user")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("findByToken", () => {
    it("should return device when valid token provided", async () => {
      const deviceWithCultivation = {
        ...mockDevice,
        cultivation: mockCultivation,
      };

      prismaService.device.findUnique.mockResolvedValue(
        deviceWithCultivation as any,
      );

      const result = await service.findByToken("device-token-123");

      expect(prismaService.device.findUnique).toHaveBeenCalledWith({
        where: { token: "device-token-123" },
        include: { cultivation: true },
      });
      expect(result).toEqual(deviceWithCultivation);
    });

    it("should throw NotFoundException when invalid token", async () => {
      prismaService.device.findUnique.mockResolvedValue(null);

      await expect(service.findByToken("invalid-token")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("updatePing", () => {
    it("should update device ping and set status to ONLINE", async () => {
      const updatedDevice = { ...mockDevice, lastPingAt: new Date() };
      prismaService.device.update.mockResolvedValue(updatedDevice);

      const result = await service.updatePing("device-123");

      expect(prismaService.device.update).toHaveBeenCalledWith({
        where: { id: "device-123" },
        data: {
          status: "ONLINE",
          lastPingAt: expect.any(Date),
        },
      });
      expect(result).toEqual(updatedDevice);
    });
  });

  describe("updateStatus", () => {
    it("should update device status", async () => {
      const updatedDevice = { ...mockDevice, status: "OFFLINE" as const };
      prismaService.device.update.mockResolvedValue(updatedDevice);

      const result = await service.updateStatus("device-123", "OFFLINE");

      expect(prismaService.device.update).toHaveBeenCalledWith({
        where: { id: "device-123" },
        data: { status: "OFFLINE" },
      });
      expect(result).toEqual(updatedDevice);
    });
  });

  describe("getStatus", () => {
    it("should return device status with last reading and irrigation", async () => {
      const deviceWithCultivation = {
        ...mockDevice,
        cultivation: mockCultivation,
      };

      prismaService.device.findUnique.mockResolvedValue(
        deviceWithCultivation as any,
      );
      prismaService.reading.findFirst.mockResolvedValue(mockReading);
      prismaService.action.findFirst.mockResolvedValue(mockAction);

      const result = await service.getStatus("device-123", "user-123");

      expect(result).toHaveProperty("lastReading");
      expect(result).toHaveProperty("lastIrrigation");
      expect(result.lastReading).toEqual({
        soilMoisture: mockReading.soilMoisture,
        temperature: mockReading.temperature,
        light: mockReading.light,
        timestamp: mockReading.timestamp,
      });
    });

    it("should return status with undefined readings when no data available", async () => {
      const deviceWithCultivation = {
        ...mockDevice,
        cultivation: mockCultivation,
      };

      prismaService.device.findUnique.mockResolvedValue(
        deviceWithCultivation as any,
      );
      prismaService.reading.findFirst.mockResolvedValue(null);
      prismaService.action.findFirst.mockResolvedValue(null);

      const result = await service.getStatus("device-123", "user-123");

      expect(result.lastReading).toBeUndefined();
      expect(result.lastIrrigation).toBeUndefined();
    });
  });
});
