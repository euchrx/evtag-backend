import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DeviceService } from 'src/device/device.service';

@Injectable()
export class DeviceGuard implements CanActivate {
  constructor(private readonly deviceService: DeviceService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const deviceId = request.headers['x-device-id'];
    const user = request.user;

    if (!deviceId) {
      throw new UnauthorizedException('X-Device-Id não informado');
    }

    if (!user?.companyId) {
      throw new UnauthorizedException('Usuário sem empresa');
    }

    const device = await this.deviceService.findOrCreateDevice(
      deviceId,
      user.companyId,
    );

    request.device = device;

    return true;
  }
}