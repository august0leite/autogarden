import { Module } from "@nestjs/common";
import { HealthModule } from "./modules/health";

@Module({
  imports: [HealthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
