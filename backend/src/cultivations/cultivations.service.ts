import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { CreateCultivationDto, UpdateCultivationDto } from "./dto";

@Injectable()
export class CultivationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createDto: CreateCultivationDto) {
    const { strainIds, ...cultivationData } = createDto;
    const uniqueStrainIds = this.uniqueIds(strainIds);

    return this.prisma.$transaction(async (tx) => {
      await this.ensureStrainsExist(uniqueStrainIds);

      const cultivation = await tx.cultivation.create({
        data: {
          ...cultivationData,
          userId,
        },
      });

      if (uniqueStrainIds.length > 0) {
        await tx.cultivationStrain.createMany({
          data: uniqueStrainIds.map((strainId) => ({
            cultivationId: cultivation.id,
            strainId,
          })),
        });
      }

      return this.findOne(cultivation.id, userId);
    });
  }

  async findAllByUser(userId: string) {
    const cultivations = await this.prisma.cultivation.findMany({
      where: { userId },
      include: {
        device: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        strains: {
          select: {
            strainId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return cultivations.map((cultivation) => {
      const { strains = [], ...rest } = cultivation;
      return {
        ...rest,
        strainIds: strains.map((item) => item.strainId),
      };
    });
  }

  async findOne(id: string, userId: string) {
    const cultivation = await this.prisma.cultivation.findUnique({
      where: { id },
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
        strains: {
          select: {
            strainId: true,
          },
        },
      },
    });

    if (!cultivation) {
      throw new NotFoundException("CULTIVATION_NOT_FOUND");
    }

    if (cultivation.userId !== userId) {
      throw new ForbiddenException("NOT_OWNER");
    }

    const { strains = [], ...rest } = cultivation;
    return {
      ...rest,
      strainIds: strains.map((item) => item.strainId),
    };
  }

  async update(id: string, userId: string, updateDto: UpdateCultivationDto) {
    // Verifica se usuário é dono
    await this.findOne(id, userId);

    const { strainIds, ...cultivationData } = updateDto;
    const uniqueStrainIds = this.uniqueIds(strainIds);

    return this.prisma.$transaction(async (tx) => {
      if (strainIds !== undefined) {
        await this.ensureStrainsExist(uniqueStrainIds);

        await tx.cultivationStrain.deleteMany({
          where: { cultivationId: id },
        });

        if (uniqueStrainIds.length > 0) {
          await tx.cultivationStrain.createMany({
            data: uniqueStrainIds.map((strainId) => ({
              cultivationId: id,
              strainId,
            })),
          });
        }
      }

      await tx.cultivation.update({
        where: { id },
        data: cultivationData,
      });

      return this.findOne(id, userId);
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

  private uniqueIds(ids?: string[]) {
    return Array.from(new Set(ids ?? []));
  }

  private async ensureStrainsExist(strainIds: string[]) {
    if (strainIds.length === 0) {
      return;
    }

    const existingCount = await this.prisma.strain.count({
      where: { id: { in: strainIds } },
    });

    if (existingCount !== strainIds.length) {
      throw new BadRequestException("INVALID_STRAIN_IDS");
    }
  }
}
