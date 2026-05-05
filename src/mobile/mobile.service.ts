import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LabelPrintStatus } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MobileService {
  constructor(private readonly prisma: PrismaService) {}

  private async getActiveDevice(deviceId?: string) {
    const cleanDeviceId = String(deviceId || '').trim();

    if (!cleanDeviceId) {
      throw new ForbiddenException('Device ID não informado.');
    }

    const device = await this.prisma.device.findUnique({
      where: {
        deviceId: cleanDeviceId,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            tradeName: true,
            isActive: true,
          },
        },
      },
    });

    if (!device) {
      throw new ForbiddenException('Dispositivo não cadastrado.');
    }

    if (!device.isActive) {
      throw new ForbiddenException('Dispositivo desativado.');
    }

    if (!device.company?.isActive) {
      throw new ForbiddenException('Empresa do dispositivo está inativa.');
    }

    await this.prisma.device.update({
      where: { id: device.id },
      data: { lastSeenAt: new Date() },
    });

    return device;
  }

  async lookupLabelByQrCode(qrCode: string, deviceId?: string) {
    const device = await this.getActiveDevice(deviceId);

    const cleanQrCode = String(qrCode || '').trim();

    if (!cleanQrCode) {
      throw new BadRequestException('Código da etiqueta não informado.');
    }

    const labelPrint = await this.prisma.labelPrint.findFirst({
      where: {
        qrCode: cleanQrCode,
        companyId: device.companyId,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            tradeName: true,
          },
        },
        labelItem: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!labelPrint) {
      return {
        found: false,
        status: 'NOT_FOUND',
        canConsume: false,
        isExpired: false,
        message: 'Etiqueta não encontrada para esta empresa.',
      };
    }

    const now = new Date();
    const isExpired = labelPrint.expiresAt.getTime() < now.getTime();

    const effectiveStatus = isExpired
      ? LabelPrintStatus.EXPIRED
      : labelPrint.status;

    const canConsume = effectiveStatus === LabelPrintStatus.ACTIVE;

    return {
      found: true,
      id: labelPrint.id,
      qrCode: labelPrint.qrCode,
      status: effectiveStatus,
      canConsume,
      isExpired,

      labelItem: {
        id: labelPrint.labelItem.id,
        name: labelPrint.labelItem.name,
        type: labelPrint.labelItem.itemType,
        category: {
          id: labelPrint.labelItem.category.id,
          name: labelPrint.labelItem.category.name,
        },
      },

      company: {
        id: labelPrint.company.id,
        name: labelPrint.company.tradeName || labelPrint.company.name,
      },

      preparedAt: labelPrint.preparedAt,
      expiresAt: labelPrint.expiresAt,
      quantity: labelPrint.quantity,
      weight: labelPrint.weight ? Number(labelPrint.weight) : null,
      weightUnit: labelPrint.weightUnit,
      lot: labelPrint.lot,
      brandOrSupplier: labelPrint.brandOrSupplier,
      sif: labelPrint.sif,
      responsible: labelPrint.responsible,

      message: this.getLookupMessage(effectiveStatus),
    };
  }

  async consumeLabel(id: string, deviceId?: string, responsible?: string) {
    const device = await this.getActiveDevice(deviceId);

    const labelPrint = await this.prisma.labelPrint.findFirst({
      where: {
        id,
        companyId: device.companyId,
      },
    });

    if (!labelPrint) {
      throw new NotFoundException('Etiqueta não encontrada para esta empresa.');
    }

    const now = new Date();
    const isExpired = labelPrint.expiresAt.getTime() < now.getTime();

    if (isExpired) {
      throw new BadRequestException('Etiqueta vencida. Não é possível consumir.');
    }

    if (labelPrint.status !== LabelPrintStatus.ACTIVE) {
      throw new BadRequestException('Etiqueta não está ativa para consumo.');
    }

    const updated = await this.prisma.labelPrint.update({
      where: {
        id: labelPrint.id,
      },
      data: {
        status: LabelPrintStatus.CONSUMED,
        consumedAt: now,
        consumedByDeviceId: device.id,
        responsible: responsible?.trim() || labelPrint.responsible,
      },
      include: {
        labelItem: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      success: true,
      id: updated.id,
      status: updated.status,
      consumedAt: updated.consumedAt,
      itemName: updated.labelItem.name,
      message: 'Etiqueta consumida com sucesso.',
    };
  }

  private getLookupMessage(status: LabelPrintStatus) {
    switch (status) {
      case LabelPrintStatus.ACTIVE:
        return 'Produto dentro da validade. Liberado para consumo.';

      case LabelPrintStatus.EXPIRED:
        return 'Produto vencido. Não utilizar.';

      case LabelPrintStatus.DISCARDED:
        return 'Produto descartado. Não utilizar.';

      case LabelPrintStatus.CONSUMED:
        return 'Produto já consumido. Não utilizar novamente.';

      default:
        return 'Status da etiqueta não identificado.';
    }
  }
}