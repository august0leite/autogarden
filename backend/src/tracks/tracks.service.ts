import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateTrackDto, UpdateTrackDto, TrackState } from './dto';

@Injectable()
export class TracksService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria um novo track no banco (espelho do contrato on-chain)
   * Chamado quando um evento WorkCreated é detectado
   */
  async create(data: CreateTrackDto) {
    // Verifica se já existe um track com este workId
    const existingTrack = await this.prisma.track.findUnique({
      where: { workId: data.workId },
    });

    if (existingTrack) {
      throw new ConflictException('TRACK_ALREADY_EXISTS');
    }

    return this.prisma.track.create({
      data: {
        workId: data.workId,
        userId: data.userId,
        creatorWallet: data.creatorWallet,
        title: data.title,
        metadataHash: data.metadataHash,
        state: TrackState.Draft,
      },
    });
  }

  /**
   * Atualiza um track existente (chamado quando eventos on-chain são detectados)
   */
  async update(workId: bigint, data: UpdateTrackDto) {
    const track = await this.prisma.track.findUnique({
      where: { workId },
    });

    if (!track) {
      throw new NotFoundException('TRACK_NOT_FOUND');
    }

    return this.prisma.track.update({
      where: { workId },
      data,
    });
  }

  /**
   * Lista todos os tracks (com paginação opcional)
   */
  async findAll(skip = 0, take = 20) {
    const [tracks, total] = await Promise.all([
      this.prisma.track.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.track.count(),
    ]);

    return {
      data: tracks,
      meta: {
        total,
        skip,
        take,
      },
    };
  }

  /**
   * Busca um track por ID do backend
   */
  async findById(id: string) {
    const track = await this.prisma.track.findUnique({
      where: { id },
    });

    if (!track) {
      throw new NotFoundException('TRACK_NOT_FOUND');
    }

    return track;
  }

  /**
   * Busca um track pelo workId on-chain
   */
  async findByWorkId(workId: bigint) {
    const track = await this.prisma.track.findUnique({
      where: { workId },
    });

    if (!track) {
      throw new NotFoundException('TRACK_NOT_FOUND');
    }

    return track;
  }

  /**
   * Lista todos os tracks de um usuário específico
   */
  async findByUserId(userId: string, skip = 0, take = 20) {
    const [tracks, total] = await Promise.all([
      this.prisma.track.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.track.count({
        where: { userId },
      }),
    ]);

    return {
      data: tracks,
      meta: {
        total,
        skip,
        take,
      },
    };
  }

  /**
   * Lista todos os tracks de uma wallet específica (útil para indexação on-chain)
   */
  async findByCreatorWallet(creatorWallet: string, skip = 0, take = 20) {
    const [tracks, total] = await Promise.all([
      this.prisma.track.findMany({
        where: { creatorWallet },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.track.count({
        where: { creatorWallet },
      }),
    ]);

    return {
      data: tracks,
      meta: {
        total,
        skip,
        take,
      },
    };
  }

  /**
   * Atualiza o estado de um track (reflete mudanças do contrato)
   */
  async updateState(workId: bigint, state: TrackState) {
    return this.update(workId, { state });
  }
}
