import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DeviceService {
  constructor(private readonly prisma: PrismaService) { }

  async findOrCreateDevice(deviceId: string, companyId: string) {
    let device = await this.prisma.device.findUnique({
      where: { deviceId },
    });

    if (!device) {
      return this.prisma.device.create({
        data: {
          deviceId,
          companyId,
          lastSeenAt: new Date(),
        },
      });
    }

    if (device.companyId !== companyId) {
      throw new ForbiddenException('Device pertence a outra empresa');
    }

    if (!device.isActive) {
      throw new ForbiddenException('Device desativado');
    }

    // 🔥 HEARTBEAT AUTOMÁTICO
    await this.prisma.device.update({
      where: { id: device.id },
      data: {
        lastSeenAt: new Date(),
      },
    });

    return device;
  }

  async listByCompany(companyId: string) {
    return this.prisma.device.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async activate(id: string, companyId: string) {
    const device = await this.ensureOwnership(id, companyId);

    return this.prisma.device.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async deactivate(id: string, companyId: string) {
    const device = await this.ensureOwnership(id, companyId);

    return this.prisma.device.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async rename(id: string, name: string, companyId: string) {
    const device = await this.ensureOwnership(id, companyId);

    return this.prisma.device.update({
      where: { id },
      data: { name },
    });
  }

  private async ensureOwnership(id: string, companyId: string) {
    const device = await this.prisma.device.findUnique({
      where: { id },
    });

    if (!device) {
      throw new NotFoundException('Device não encontrado');
    }

    if (device.companyId !== companyId) {
      throw new ForbiddenException('Acesso negado');
    }

    return device;
  }
}