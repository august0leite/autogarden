import { Injectable } from "@nestjs/common";
import { HealthResponseDto } from "./dto";

@Injectable()
export class HealthService {
  check(): HealthResponseDto {
    return new HealthResponseDto();
  }
}
