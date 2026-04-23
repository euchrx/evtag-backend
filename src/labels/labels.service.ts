import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { LabelPrintStatus } from 'src/generated/prisma/enums';
import {
  CreateLabelItemDto,
  CreateLabelPrintDto,
  UpdateLabelItemDto,
} from './dto';

@Injectable()
export class LabelsService {
  constructor(private readonly prisma: PrismaService) { }

  async createItem(data: CreateLabelItemDto, companyId: string) {
    const name = data.name.trim();

    const category = await this.prisma.labelCategory.findFirst({
      where: {
        id: data.categoryId,
        companyId,
        isActive: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada.');
    }

    const existing = await this.prisma.labelItem.findFirst({
      where: {
        companyId,
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      throw new ConflictException('Já existe um item com esse nome.');
    }

    return this.prisma.labelItem.create({
      data: {
        name,
        categoryId: data.categoryId,
        companyId,
        itemType: data.itemType,
        defaultShelfLifeHours: data.defaultShelfLifeHours,
        isActive: data.isActive ?? true,
      },
      include: {
        category: true,
      },
    });
  }

  async findItems(companyId: string) {
    return this.prisma.labelItem.findMany({
      where: {
        companyId,
        isActive: true,
      },
      include: {
        category: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findItemById(id: string, companyId: string) {
    const item = await this.prisma.labelItem.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        category: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Item não encontrado.');
    }

    return item;
  }

  async updateItem(id: string, data: UpdateLabelItemDto, companyId: string) {
    await this.findItemById(id, companyId);

    if (data.categoryId) {
      const category = await this.prisma.labelCategory.findFirst({
        where: {
          id: data.categoryId,
          companyId,
          isActive: true,
        },
      });

      if (!category) {
        throw new NotFoundException('Categoria não encontrada.');
      }
    }

    if (data.name?.trim()) {
      const existing = await this.prisma.labelItem.findFirst({
        where: {
          id: { not: id },
          companyId,
          name: {
            equals: data.name.trim(),
            mode: 'insensitive',
          },
        },
      });

      if (existing) {
        throw new ConflictException('Já existe um item com esse nome.');
      }
    }

    return this.prisma.labelItem.update({
      where: { id },
      data: {
        ...data,
        name: data.name?.trim(),
      },
      include: {
        category: true,
      },
    });
  }

  async deleteItem(id: string, companyId: string) {
    await this.findItemById(id, companyId);

    return this.prisma.labelItem.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }

  async createPrint(data: CreateLabelPrintDto, companyId: string) {
    const item = await this.prisma.labelItem.findFirst({
      where: {
        id: data.labelItemId,
        companyId,
        isActive: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Item não encontrado.');
    }

    const preparedAt = new Date();
    const expiresAt = new Date(
      preparedAt.getTime() + item.defaultShelfLifeHours * 60 * 60 * 1000,
    );

    return this.prisma.labelPrint.create({
      data: {
        labelItemId: item.id,
        companyId,
        preparedAt,
        expiresAt,
        quantity: data.quantity,
        weight: data.weight,
        lot: data.lot,
        qrCode: randomUUID(),
        status: LabelPrintStatus.ACTIVE,
      },
      include: {
        labelItem: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  async findPrints(companyId: string) {
    return this.prisma.labelPrint.findMany({
      where: {
        companyId,
      },
      include: {
        labelItem: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPrintByQrCode(qrCode: string, companyId: string) {
    const print = await this.prisma.labelPrint.findFirst({
      where: {
        qrCode,
        companyId,
      },
      include: {
        labelItem: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!print) {
      throw new NotFoundException('Etiqueta não encontrada ou não pertence a essa empresa.');
    }

    return print;
  }

  async findPrintByQrCodeForMobile(qrCode: string, companyId: string) {
    const print = await this.prisma.labelPrint.findFirst({
      where: {
        qrCode,
        companyId,
      },
      include: {
        labelItem: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!print) {
      throw new NotFoundException('Etiqueta não encontrada ou não pertence a essa empresa.');
    }

    const now = new Date();
    const isExpired = new Date(print.expiresAt) < now;

    const normalizedStatus =
      print.status === LabelPrintStatus.ACTIVE && isExpired
        ? LabelPrintStatus.EXPIRED
        : print.status;

    const canConsume =
      print.status === LabelPrintStatus.ACTIVE && !isExpired;

    let message = 'Etiqueta encontrada.';

    if (canConsume) {
      message = 'Etiqueta válida para consumo.';
    } else if (isExpired) {
      message = 'Etiqueta vencida.';
    } else if (print.status === LabelPrintStatus.CONSUMED) {
      message = 'Etiqueta já consumida.';
    } else if (print.status === LabelPrintStatus.DISCARDED) {
      message = 'Etiqueta descartada.';
    }

    return {
      id: print.id,
      qrCode: print.qrCode,
      status: normalizedStatus,
      isExpired,
      canConsume,
      preparedAt: print.preparedAt,
      expiresAt: print.expiresAt,
      message,
      labelItem: {
        id: print.labelItem.id,
        name: print.labelItem.name,
        category: {
          id: print.labelItem.category.id,
          name: print.labelItem.category.name,
        },
      },
    };
  }

  async updatePrint(
    id: string,
    data: {
      lot?: string | null;
      weight?: number | null;
      expiresAt?: Date;
    },
    companyId: string,
  ) {
    const existing = await this.prisma.labelPrint.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!existing) {
      throw new NotFoundException('Etiqueta não encontrada ou não pertence a essa empresa.');
    }

    return this.prisma.labelPrint.update({
      where: { id },
      data: {
        lot: data.lot,
        weight: data.weight,
        expiresAt: data.expiresAt,
      },
      include: {
        labelItem: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  async updatePrintStatus(
    id: string,
    status: LabelPrintStatus,
    companyId: string,
  ) {
    const existing = await this.prisma.labelPrint.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!existing) {
      throw new NotFoundException('Etiqueta não encontrada ou não pertence a essa empresa.');
    }

    return this.prisma.labelPrint.update({
      where: { id },
      data: { status },
      include: {
        labelItem: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  async consumePrint(
    id: string,
    companyId: string,
    device: any,
    userId: string,
  ) {
    const existing = await this.prisma.labelPrint.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!existing) {
      throw new NotFoundException('Etiqueta não encontrada ou não pertence a essa empresa.');
    }

    if (existing.status !== LabelPrintStatus.ACTIVE) {
      throw new BadRequestException('Etiqueta já finalizada.');
    }

    if (new Date(existing.expiresAt) < new Date()) {
      throw new BadRequestException('Etiqueta vencida.');
    }

    const now = new Date();

    const updated = await this.prisma.labelPrint.update({
      where: { id },
      data: {
        status: LabelPrintStatus.CONSUMED,

        // 🔥 AUDITORIA
        consumedAt: now,
        consumedByUserId: userId,
        consumedByDeviceId: device.deviceId,
      },
    });

    return {
      success: true,
      message: 'Etiqueta consumida com sucesso.',
      status: updated.status,
      consumedAt: now,
    };
  }
}