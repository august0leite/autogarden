import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { IndexerService } from "./indexer.service";
import { PrismaModule } from "../database/prisma.module";

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule],
  providers: [IndexerService],
  exports: [IndexerService],
})
export class IndexerModule {}
