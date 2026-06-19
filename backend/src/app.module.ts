import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { validate } from "./config/env.validation";
import { PrismaModule } from "./database/prisma.module";
import { HealthModule } from "./health/health.module";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { CultivationsModule } from "./cultivations/cultivations.module";
import { DevicesModule } from "./devices/devices.module";
import { ReadingsModule } from "./readings/readings.module";
import { ActionsModule } from "./actions/actions.module";
import { StrainsModule } from "./strains/strains.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    CultivationsModule,
    DevicesModule,
    ReadingsModule,
    ActionsModule,
    StrainsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
