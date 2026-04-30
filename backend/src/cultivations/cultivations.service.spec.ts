import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CultivationsService } from './cultivations.service';
import { PrismaService } from '../database/prisma.service';
import { CreateCultivationDto, UpdateCultivationDto } from './dto';

describe('CultivationsService', () => {
  let service: CultivationsService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockCultivation = {
    id: 'cult-123',
    userId: 'user-123',
    name: 'Tomato Garden',
    plantType: 'Tomato',
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
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a cultivation', async () => {
      const userId = 'user-123';
      const createDto: CreateCultivationDto = {
        name: 'Tomato Garden',
        plantType: 'Tomato',
        soilMoistureMin: 40,
        soilMoistureMax: 70,
        temperatureMin: 18,
        temperatureMax: 30,
        lightMin: 60,
        cooldownMinutes: 30,
      };

      prismaService.cultivation.create.mockResolvedValue(mockCultivation);

      const result = await service.create(userId, createDto);

      expect(prismaService.cultivation.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          userId,
        },
      });
      expect(result).toEqual(mockCultivation);
    });
  });

  describe('findAllByUser', () => {
    it('should return all cultivations for a user', async () => {
      const userId = 'user-123';
      const cultivations = [
        {
          ...mockCultivation,
          device: {
            id: 'device-1',
            name: 'Arduino 1',
            status: 'ONLINE',
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
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(cultivations);
    });

    it('should return empty array when user has no cultivations', async () => {
      prismaService.cultivation.findMany.mockResolvedValue([]);

      const result = await service.findAllByUser('user-123');

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return cultivation when found and user is owner', async () => {
      const cultivationWithDevice = {
        ...mockCultivation,
        device: null,
      };

      prismaService.cultivation.findUnique.mockResolvedValue(cultivationWithDevice);

      const result = await service.findOne('cult-123', 'user-123');

      expect(prismaService.cultivation.findUnique).toHaveBeenCalledWith({
        where: { id: 'cult-123' },
        include: { device: true },
      });
      expect(result).toEqual(cultivationWithDevice);
    });

    it('should throw NotFoundException when cultivation not found', async () => {
      prismaService.cultivation.findUnique.mockResolvedValue(null);

      await expect(service.findOne('cult-999', 'user-123')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not owner', async () => {
      prismaService.cultivation.findUnique.mockResolvedValue(mockCultivation);

      await expect(service.findOne('cult-123', 'other-user')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should successfully update cultivation', async () => {
      const updateDto: UpdateCultivationDto = {
        name: 'Updated Tomato Garden',
        soilMoistureMin: 45,
      };

      const updatedCultivation = { ...mockCultivation, ...updateDto };

      prismaService.cultivation.findUnique.mockResolvedValue(mockCultivation);
      prismaService.cultivation.update.mockResolvedValue(updatedCultivation);

      const result = await service.update('cult-123', 'user-123', updateDto);

      expect(prismaService.cultivation.update).toHaveBeenCalledWith({
        where: { id: 'cult-123' },
        data: updateDto,
      });
      expect(result).toEqual(updatedCultivation);
    });

    it('should throw NotFoundException when cultivation not found', async () => {
      prismaService.cultivation.findUnique.mockResolvedValue(null);

      await expect(
        service.update('cult-999', 'user-123', {}),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not owner', async () => {
      prismaService.cultivation.findUnique.mockResolvedValue(mockCultivation);

      await expect(
        service.update('cult-123', 'other-user', {}),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('should successfully delete cultivation', async () => {
      prismaService.cultivation.findUnique.mockResolvedValue(mockCultivation);
      prismaService.cultivation.delete.mockResolvedValue(mockCultivation);

      const result = await service.delete('cult-123', 'user-123');

      expect(prismaService.cultivation.delete).toHaveBeenCalledWith({
        where: { id: 'cult-123' },
      });
      expect(result).toEqual(mockCultivation);
    });

    it('should throw NotFoundException when cultivation not found', async () => {
      prismaService.cultivation.findUnique.mockResolvedValue(null);

      await expect(service.delete('cult-999', 'user-123')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not owner', async () => {
      prismaService.cultivation.findUnique.mockResolvedValue(mockCultivation);

      await expect(service.delete('cult-123', 'other-user')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findByCultivationId', () => {
    it('should return cultivation by id', async () => {
      prismaService.cultivation.findUnique.mockResolvedValue(mockCultivation);

      const result = await service.findByCultivationId('cult-123');

      expect(prismaService.cultivation.findUnique).toHaveBeenCalledWith({
        where: { id: 'cult-123' },
      });
      expect(result).toEqual(mockCultivation);
    });

    it('should return null when cultivation not found', async () => {
      prismaService.cultivation.findUnique.mockResolvedValue(null);

      const result = await service.findByCultivationId('cult-999');

      expect(result).toBeNull();
    });
  });
});
