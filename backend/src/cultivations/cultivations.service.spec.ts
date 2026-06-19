import { Test, TestingModule } from "@nestjs/testing";
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { CultivationsService } from "./cultivations.service";
import { PrismaService } from "../database/prisma.service";
import { CreateCultivationDto, UpdateCultivationDto } from "./dto";

describe("CultivationsService", () => {
  let service: CultivationsService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockCultivation = {
    id: "cult-123",
    userId: "user-123",
    name: "Tomato Garden",
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
      $transaction: jest.fn(),
      cultivation: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      grow: {
        createMany: jest.fn(),
        deleteMany: jest.fn(),
      },
      strain: {
        count: jest.fn(),
      },
    };

    mockPrismaService.$transaction.mockImplementation(async (callback: any) =>
      callback(mockPrismaService),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CultivationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CultivationsService>(CultivationsService);
    prismaService = module.get(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should successfully create a cultivation", async () => {
      const userId = "user-123";
      const createDto: CreateCultivationDto = {
        name: "Tomato Garden",
        strainIds: ["3f1fbf8a-d6f7-4d04-b9b7-1b8b3b8d0f3a"],
        soilMoistureMin: 40,
        soilMoistureMax: 70,
        temperatureMin: 18,
        temperatureMax: 30,
        lightMin: 60,
        cooldownMinutes: 30,
      };

      prismaService.strain.count.mockResolvedValue(1);
      prismaService.cultivation.create.mockResolvedValue(mockCultivation as any);
      prismaService.cultivation.findUnique.mockResolvedValue(mockCultivation as any);

      const result = await service.create(userId, createDto);

      expect(prismaService.strain.count).toHaveBeenCalledWith({
        where: { id: { in: ["3f1fbf8a-d6f7-4d04-b9b7-1b8b3b8d0f3a"] } },
      });
      expect(prismaService.cultivation.create).toHaveBeenCalledWith({
        data: {
          name: "Tomato Garden",
          soilMoistureMin: 40,
          soilMoistureMax: 70,
          temperatureMin: 18,
          temperatureMax: 30,
          lightMin: 60,
          cooldownMinutes: 30,
          userId,
        },
      });
      expect(prismaService.grow.createMany).toHaveBeenCalledWith({
        data: [
          {
            cultivationId: "cult-123",
            strainId: "3f1fbf8a-d6f7-4d04-b9b7-1b8b3b8d0f3a",
            startDate: mockCultivation.createdAt,
          },
        ],
      });
      expect(result).toEqual({
        ...mockCultivation,
        strainIds: [],
      });
    });

    it("should throw when one or more strain ids are invalid", async () => {
      prismaService.strain.count.mockResolvedValue(0);

      await expect(
        service.create("user-123", {
          name: "Tomato Garden",
          strainIds: ["3f1fbf8a-d6f7-4d04-b9b7-1b8b3b8d0f3a"],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("findAllByUser", () => {
    it("should return all cultivations for a user", async () => {
      const userId = "user-123";
      const cultivations = [
        {
          ...mockCultivation,
          grows: [{ strainId: "s-1" }, { strainId: "s-2" }],
          device: {
            id: "device-1",
            name: "Arduino 1",
            status: "ONLINE",
          },
        },
      ];

      prismaService.cultivation.findMany.mockResolvedValue(cultivations as any);

      const result = await service.findAllByUser(userId);

      expect(prismaService.cultivation.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: {
          device: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
          grows: {
            select: {
              strainId: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      expect(result).toEqual([
        {
          ...mockCultivation,
          device: {
            id: "device-1",
            name: "Arduino 1",
            status: "ONLINE",
          },
          strainIds: ["s-1", "s-2"],
        },
      ]);
    });

    it("should return empty array when user has no cultivations", async () => {
      prismaService.cultivation.findMany.mockResolvedValue([]);

      const result = await service.findAllByUser("user-123");

      expect(result).toEqual([]);
    });
  });

  describe("findOne", () => {
    it("should return cultivation when found and user is owner", async () => {
      const cultivationWithDevice = {
        ...mockCultivation,
        grows: [{ strainId: "s-1" }],
        device: null,
      };

      prismaService.cultivation.findUnique.mockResolvedValue(
        cultivationWithDevice,
      );

      const result = await service.findOne("cult-123", "user-123");

      expect(prismaService.cultivation.findUnique).toHaveBeenCalledWith({
        where: { id: "cult-123" },
        include: {
          device: {
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
            },
          },
          grows: {
            select: {
              strainId: true,
            },
          },
        },
      });
      expect(result).toEqual({
        ...mockCultivation,
        device: null,
        strainIds: ["s-1"],
      });
    });

    it("should throw NotFoundException when cultivation not found", async () => {
      prismaService.cultivation.findUnique.mockResolvedValue(null);

      await expect(service.findOne("cult-999", "user-123")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ForbiddenException when user is not owner", async () => {
      prismaService.cultivation.findUnique.mockResolvedValue(mockCultivation);

      await expect(service.findOne("cult-123", "other-user")).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe("update", () => {
    it("should successfully update cultivation", async () => {
      const updateDto: UpdateCultivationDto = {
        name: "Updated Tomato Garden",
        soilMoistureMin: 45,
        strainIds: ["3f1fbf8a-d6f7-4d04-b9b7-1b8b3b8d0f3a"],
      };

      const updatedCultivation = { ...mockCultivation, ...updateDto };

      prismaService.strain.count.mockResolvedValue(1);
      prismaService.cultivation.findUnique
        .mockResolvedValueOnce(mockCultivation as any)
        .mockResolvedValueOnce({ ...updatedCultivation, grows: [] } as any);
      prismaService.cultivation.update.mockResolvedValue(updatedCultivation as any);

      const result = await service.update("cult-123", "user-123", updateDto);

      expect(prismaService.grow.deleteMany).toHaveBeenCalledWith({
        where: { cultivationId: "cult-123" },
      });
      expect(prismaService.grow.createMany).toHaveBeenCalledWith({
        data: [
          {
            cultivationId: "cult-123",
            strainId: "3f1fbf8a-d6f7-4d04-b9b7-1b8b3b8d0f3a",
            startDate: expect.any(Date),
          },
        ],
      });
      expect(prismaService.cultivation.update).toHaveBeenCalledWith({
        where: { id: "cult-123" },
        data: {
          name: "Updated Tomato Garden",
          soilMoistureMin: 45,
        },
      });
      expect(result).toEqual({
        ...updatedCultivation,
        strainIds: [],
      });
    });

    it("should throw NotFoundException when cultivation not found", async () => {
      prismaService.cultivation.findUnique.mockResolvedValue(null);

      await expect(service.update("cult-999", "user-123", {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ForbiddenException when user is not owner", async () => {
      prismaService.cultivation.findUnique.mockResolvedValue(mockCultivation);

      await expect(
        service.update("cult-123", "other-user", {}),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("delete", () => {
    it("should successfully delete cultivation", async () => {
      prismaService.cultivation.findUnique.mockResolvedValue(mockCultivation);
      prismaService.cultivation.delete.mockResolvedValue(mockCultivation);

      const result = await service.delete("cult-123", "user-123");

      expect(prismaService.cultivation.delete).toHaveBeenCalledWith({
        where: { id: "cult-123" },
      });
      expect(result).toEqual(mockCultivation);
    });

    it("should throw NotFoundException when cultivation not found", async () => {
      prismaService.cultivation.findUnique.mockResolvedValue(null);

      await expect(service.delete("cult-999", "user-123")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ForbiddenException when user is not owner", async () => {
      prismaService.cultivation.findUnique.mockResolvedValue(mockCultivation);

      await expect(service.delete("cult-123", "other-user")).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe("findByCultivationId", () => {
    it("should return cultivation by id", async () => {
      prismaService.cultivation.findUnique.mockResolvedValue(mockCultivation);

      const result = await service.findByCultivationId("cult-123");

      expect(prismaService.cultivation.findUnique).toHaveBeenCalledWith({
        where: { id: "cult-123" },
      });
      expect(result).toEqual(mockCultivation);
    });

    it("should return null when cultivation not found", async () => {
      prismaService.cultivation.findUnique.mockResolvedValue(null);

      const result = await service.findByCultivationId("cult-999");

      expect(result).toBeNull();
    });
  });
});
