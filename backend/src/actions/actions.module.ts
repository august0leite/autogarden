import { Module } from "@nestjs/common";
import { ActionsService } from "./actions.service";
import { PrismaModule } from "../database/prisma.module";

@Module({
  imports: [PrismaModule],
  providers: [ActionsService],
  exports: [ActionsService],
})
export class ActionsModule {}
