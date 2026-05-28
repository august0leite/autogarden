import { Module } from "@nestjs/common";
import { CultivationsService } from "./cultivations.service";
import { CultivationsController } from "./cultivations.controller";
import { PrismaModule } from "../database/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [CultivationsController],
  providers: [CultivationsService],
  exports: [CultivationsService],
})
export class CultivationsModule {}
