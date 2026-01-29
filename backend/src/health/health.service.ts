import { Injectable } from "@nestjs/common";

@Injectable()
export class HealthService {
  getHealth() {
    return {
      data: {
        status: "ok",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      },
    };
  }
}
