import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { IndexerService } from './indexer.service';
import { IndexerController } from './indexer.controller';
import { PrismaModule } from '../database/prisma.module';
import { TracksModule } from '../tracks/tracks.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    TracksModule,
  ],
  controllers: [IndexerController],
  providers: [IndexerService],
  exports: [IndexerService],
})
export class IndexerModule {}
