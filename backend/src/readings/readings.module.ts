import { Module } from '@nestjs/common';
import { ReadingsService } from './readings.service';
import { ReadingsController } from './readings.controller';
import { DecisionEngineService } from './decision-engine.service';
import { PrismaModule } from '../database/prisma.module';
import { DevicesModule } from '../devices/devices.module';
import { ActionsModule } from '../actions/actions.module';

@Module({
  imports: [PrismaModule, DevicesModule, ActionsModule],
  controllers: [ReadingsController],
  providers: [ReadingsService, DecisionEngineService],
  exports: [ReadingsService],
})
export class ReadingsModule {}
