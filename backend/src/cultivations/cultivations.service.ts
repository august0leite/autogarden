import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCultivationDto, UpdateCultivationDto } from './dto';

@Injectable()
export class CultivationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createDto: CreateCultivationDto) {
    return this.prisma.cultivation.create({
      data: {
        ...createDto,
        userId,
      },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.cultivation.findMany({
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
  }

  async findOne(id: string, userId: string) {
    const cultivation = await this.prisma.cultivation.findUnique({
      where: { id },
      include: {
        device: true,
      },
    });

    if (!cultivation) {
      throw new NotFoundException('CULTIVATION_NOT_FOUND');
    }

    if (cultivation.userId !== userId) {
      throw new ForbiddenException('NOT_OWNER');
    }

    return cultivation;
  }

  async update(id: string, userId: string, updateDto: UpdateCultivationDto) {
    // Verifica se usuário é dono
    await this.findOne(id, userId);

    return this.prisma.cultivation.update({
      where: { id },
      data: updateDto,
    });
  }

  async delete(id: string, userId: string) {
    // Verifica se usuário é dono
    await this.findOne(id, userId);

    return this.prisma.cultivation.delete({
      where: { id },
    });
  }

  // Método interno para obter configuração (usado pelo motor de decisão)
  async findByCultivationId(cultivationId: string) {
    return this.prisma.cultivation.findUnique({
      where: { id: cultivationId },
    });
  }
}
