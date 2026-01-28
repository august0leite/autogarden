export class HealthResponseDto {
  status: string;
  timestamp: string;

  constructor() {
    this.status = "ok";
    this.timestamp = new Date().toISOString();
  }
}
