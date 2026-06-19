import { Module } from "@nestjs/common";
import { PrismaModule } from "../database/prisma.module";
import { StrainsController } from "./strains.controller";
import { StrainsService } from "./strains.service";

@Module({
  imports: [PrismaModule],
  controllers: [StrainsController],
  providers: [StrainsService],
})
export class StrainsModule {}
