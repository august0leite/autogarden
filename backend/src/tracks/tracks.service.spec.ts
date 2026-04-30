import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { PrismaService } from '../database/prisma.service';
import { CreateTrackDto, UpdateTrackDto, TrackState } from './dto';

describe('TracksService', () => {
  let service: TracksService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockTrack = {
    id: 'track-123',
    workId: BigInt(1),
    userId: 'user-123',
    creatorWallet: '0x1234567890abcdef',
    title: 'My Track',
    metadataHash: 'QmHash123',
    state: TrackState.Draft,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockPrismaService = {
      track: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TracksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TracksService>(TracksService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a track', async () => {
      const createDto: CreateTrackDto = {
        workId: BigInt(1),
        userId: 'user-123',
        creatorWallet: '0x1234567890abcdef',
        title: 'My Track',
        metadataHash: 'QmHash123',
      };

      prismaService.track.findUnique.mockResolvedValue(null);
      prismaService.track.create.mockResolvedValue(mockTrack);

      const result = await service.create(createDto);

      expect(prismaService.track.findUnique).toHaveBeenCalledWith({
        where: { workId: BigInt(1) },
      });
      expect(prismaService.track.create).toHaveBeenCalledWith({
        data: {
          workId: BigInt(1),
          userId: 'user-123',
          creatorWallet: '0x1234567890abcdef',
          title: 'My Track',
          metadataHash: 'QmHash123',
          state: TrackState.Draft,
        },
      });
      expect(result).toEqual(mockTrack);
    });

    it('should throw ConflictException when track with workId already exists', async () => {
      const createDto: CreateTrackDto = {
        workId: BigInt(1),
        userId: 'user-123',
        creatorWallet: '0x1234567890abcdef',
        title: 'My Track',
        metadataHash: 'QmHash123',
      };

      prismaService.track.findUnique.mockResolvedValue(mockTrack);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should successfully update a track', async () => {
      const updateDto: UpdateTrackDto = {
        state: TrackState.Published,
      };

      const updatedTrack = { ...mockTrack, state: TrackState.Published };

      prismaService.track.findUnique.mockResolvedValue(mockTrack);
      prismaService.track.update.mockResolvedValue(updatedTrack);

      const result = await service.update(BigInt(1), updateDto);

      expect(prismaService.track.findUnique).toHaveBeenCalledWith({
        where: { workId: BigInt(1) },
      });
      expect(prismaService.track.update).toHaveBeenCalledWith({
        where: { workId: BigInt(1) },
        data: updateDto,
      });
      expect(result).toEqual(updatedTrack);
    });

    it('should throw NotFoundException when track not found', async () => {
      const updateDto: UpdateTrackDto = {
        state: TrackState.Published,
      };

      prismaService.track.findUnique.mockResolvedValue(null);

      await expect(service.update(BigInt(999), updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return tracks with default pagination', async () => {
      const tracks = [mockTrack];
      prismaService.track.findMany.mockResolvedValue(tracks);
      prismaService.track.count.mockResolvedValue(1);

      const result = await service.findAll();

      expect(prismaService.track.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        orderBy: { createdAt: 'desc' },
      });
      expect(prismaService.track.count).toHaveBeenCalled();
      expect(result).toEqual({
        data: tracks,
        meta: {
          total: 1,
          skip: 0,
          take: 20,
        },
      });
    });

    it('should return tracks with custom pagination', async () => {
      const tracks = [mockTrack];
      prismaService.track.findMany.mockResolvedValue(tracks);
      prismaService.track.count.mockResolvedValue(50);

      const result = await service.findAll(10, 30);

      expect(prismaService.track.findMany).toHaveBeenCalledWith({
        skip: 10,
        take: 30,
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual({
        data: tracks,
        meta: {
          total: 50,
          skip: 10,
          take: 30,
        },
      });
    });

    it('should return empty array when no tracks found', async () => {
      prismaService.track.findMany.mockResolvedValue([]);
      prismaService.track.count.mockResolvedValue(0);

      const result = await service.findAll();

      expect(result).toEqual({
        data: [],
        meta: {
          total: 0,
          skip: 0,
          take: 20,
        },
      });
    });
  });

  describe('findById', () => {
    it('should return track when found', async () => {
      prismaService.track.findUnique.mockResolvedValue(mockTrack);

      const result = await service.findById('track-123');

      expect(prismaService.track.findUnique).toHaveBeenCalledWith({
        where: { id: 'track-123' },
      });
      expect(result).toEqual(mockTrack);
    });

    it('should throw NotFoundException when track not found', async () => {
      prismaService.track.findUnique.mockResolvedValue(null);

      await expect(service.findById('track-999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByWorkId', () => {
    it('should return track when found', async () => {
      prismaService.track.findUnique.mockResolvedValue(mockTrack);

      const result = await service.findByWorkId(BigInt(1));

      expect(prismaService.track.findUnique).toHaveBeenCalledWith({
        where: { workId: BigInt(1) },
      });
      expect(result).toEqual(mockTrack);
    });

    it('should throw NotFoundException when track not found', async () => {
      prismaService.track.findUnique.mockResolvedValue(null);

      await expect(service.findByWorkId(BigInt(999))).rejects.toThrow(NotFoundException);
    });
  });
});
