import { Test, TestingModule } from "@nestjs/testing";
import { ActionsService } from "./actions.service";
import { PrismaService } from "../database/prisma.service";
import { CreateActionDto } from "./dto";

describe("ActionsService", () => {
  let service: ActionsService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockAction = {
    id: "action-123",
    deviceId: "device-123",
    type: "IRRIGATION" as const,
    durationSeconds: 10,
    status: "PENDING" as const,
    origin: "MANUAL" as const,
    timestamp: new Date(),
    executedAt: null,
    decisionId: null,
  };

  beforeEach(async () => {
    const mockPrismaService = {
      action: {
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ActionsService>(ActionsService);
    prismaService = module.get(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createManualAction", () => {
    it("should successfully create a manual irrigation action", async () => {
      const createDto: CreateActionDto = {
        type: "irrigation",
        duration_seconds: 10,
      };

      prismaService.action.create.mockResolvedValue(mockAction);

      const result = await service.createManualAction("device-123", createDto);

      expect(prismaService.action.create).toHaveBeenCalledWith({
        data: {
          deviceId: "device-123",
          type: "IRRIGATION",
          durationSeconds: 10,
          origin: "MANUAL",
          status: "PENDING",
        },
      });
      expect(result).toEqual({
        status: "scheduled",
        origin: "MANUAL",
        actionId: mockAction.id,
      });
    });

    it("should convert action type to uppercase", async () => {
      const createDto: CreateActionDto = {
        type: "ventilation",
        duration_seconds: 15,
      };

      const ventilationAction = {
        ...mockAction,
        type: "VENTILATION" as const,
        durationSeconds: 15,
      };

      prismaService.action.create.mockResolvedValue(ventilationAction);

      await service.createManualAction("device-123", createDto);

      expect(prismaService.action.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: "VENTILATION",
        }),
      });
    });

    it("should handle lighting action type", async () => {
      const createDto: CreateActionDto = {
        type: "lighting",
        duration_seconds: 20,
      };

      const lightingAction = {
        ...mockAction,
        type: "LIGHTING" as const,
        durationSeconds: 20,
      };

      prismaService.action.create.mockResolvedValue(lightingAction);

      await service.createManualAction("device-123", createDto);

      expect(prismaService.action.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: "LIGHTING",
        }),
      });
    });
  });

  describe("createAutoAction", () => {
    it("should successfully create an automatic action", async () => {
      const autoAction = {
        ...mockAction,
        origin: "AUTO" as const,
        decisionId: "decision-123",
      };

      prismaService.action.create.mockResolvedValue(autoAction);

      const result = await service.createAutoAction(
        "device-123",
        "decision-123",
        "IRRIGATION",
        10,
      );

      expect(prismaService.action.create).toHaveBeenCalledWith({
        data: {
          deviceId: "device-123",
          decisionId: "decision-123",
          type: "IRRIGATION",
          durationSeconds: 10,
          origin: "AUTO",
          status: "PENDING",
        },
      });
      expect(result).toEqual(autoAction);
    });

    it("should create action without duration seconds when not provided", async () => {
      const autoAction = {
        ...mockAction,
        origin: "AUTO" as const,
        durationSeconds: undefined,
        decisionId: "decision-123",
      };

      prismaService.action.create.mockResolvedValue(autoAction as any);

      const result = await service.createAutoAction(
        "device-123",
        "decision-123",
        "VENTILATION",
      );

      expect(prismaService.action.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          durationSeconds: undefined,
        }),
      });
      expect(result).toEqual(autoAction);
    });
  });

  describe("findAllByDevice", () => {
    it("should return all actions for a device with default limit", async () => {
      const actions = [mockAction];

      prismaService.action.findMany.mockResolvedValue(actions);

      const result = await service.findAllByDevice("device-123");

      expect(prismaService.action.findMany).toHaveBeenCalledWith({
        where: { deviceId: "device-123" },
        orderBy: { timestamp: "desc" },
        take: 100,
      });
      expect(result).toEqual(actions);
    });

    it("should return actions with custom limit", async () => {
      const actions = [mockAction];

      prismaService.action.findMany.mockResolvedValue(actions);

      const result = await service.findAllByDevice("device-123", 50);

      expect(prismaService.action.findMany).toHaveBeenCalledWith({
        where: { deviceId: "device-123" },
        orderBy: { timestamp: "desc" },
        take: 50,
      });
      expect(result).toEqual(actions);
    });

    it("should return empty array when no actions found", async () => {
      prismaService.action.findMany.mockResolvedValue([]);

      const result = await service.findAllByDevice("device-123");

      expect(result).toEqual([]);
    });
  });

  describe("markAsExecuted", () => {
    it("should mark action as executed with timestamp", async () => {
      const executedAction = {
        ...mockAction,
        status: "EXECUTED" as const,
        executedAt: new Date(),
      };

      prismaService.action.update.mockResolvedValue(executedAction);

      const result = await service.markAsExecuted("action-123");

      expect(prismaService.action.update).toHaveBeenCalledWith({
        where: { id: "action-123" },
        data: {
          status: "EXECUTED",
          executedAt: expect.any(Date),
        },
      });
      expect(result.status).toBe("EXECUTED");
      expect(result.executedAt).toBeDefined();
    });
  });
});
