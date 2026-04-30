import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DevicesService } from '../devices.service';

@Injectable()
export class DeviceAuthGuard implements CanActivate {
  constructor(
    private readonly devicesService: DevicesService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('NO_AUTHORIZATION_HEADER');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('INVALID_AUTHORIZATION_FORMAT');
    }

    try {
      const device = await this.devicesService.findByToken(token);
      request.device = device;
      return true;
    } catch (error) {
      throw new UnauthorizedException('INVALID_DEVICE_TOKEN');
    }
  }
}
