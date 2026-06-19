import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class StrainsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.strain.findMany({
      select: {
        id: true,
        name: true,
        imageUrl: true,
        type: true,
        thcPercentage: true,
        difficulty: true,
        vegetativeDays: true,
        floweringDays: true,
      },
      orderBy: { name: "asc" },
    });
  }

  async findOne(id: string) {
    const strain = await this.prisma.strain.findUnique({
      where: { id },
    });

    if (!strain) {
      throw new NotFoundException("STRAIN_NOT_FOUND");
    }

    return strain;
  }
}
