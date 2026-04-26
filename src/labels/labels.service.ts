import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  LabelPrintStatus,
  LabelWeightUnit,
} from 'src/generated/prisma/enums';
import {
  CreateLabelItemDto,
  CreateLabelPrintDto,
  UpdateLabelItemDto,
  UpdateLabelPrintDto,
} from './dto';

@Injectable()
export class LabelsService {
  constructor(private readonly prisma: PrismaService) {}

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

    const expiresAt = data.originalExpiresAt
      ? new Date(data.originalExpiresAt)
      : new Date(
          preparedAt.getTime() + item.defaultShelfLifeHours * 60 * 60 * 1000,
        );

    if (Number.isNaN(expiresAt.getTime())) {
      throw new BadRequestException('Data de validade inválida.');
    }

    return this.prisma.labelPrint.create({
      data: {
        labelItemId: item.id,
        companyId,
        preparedAt,
        expiresAt,
        originalExpiresAt: data.originalExpiresAt
          ? new Date(data.originalExpiresAt)
          : null,
        quantity: data.quantity,
        weight: data.weight,
        weightUnit: data.weightUnit ?? LabelWeightUnit.KG,
        lot: data.lot?.trim() || null,
        brandOrSupplier: data.brandOrSupplier?.trim() || null,
        sif: data.sif?.trim() || null,
        responsible: data.responsible?.trim() || null,
        showQr: data.showQr ?? true,
        qrCode: randomUUID(),
        status: LabelPrintStatus.ACTIVE,
      },
      include: {
        labelItem: {
          include: {
            category: true,
          },
        },
        company: true,
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
        company: true,
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
        company: true,
      },
    });

    if (!print) {
      throw new NotFoundException(
        'Etiqueta não encontrada ou não pertence a essa empresa.',
      );
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
        company: true,
      },
    });

    if (!print) {
      throw new NotFoundException(
        'Etiqueta não encontrada ou não pertence a essa empresa.',
      );
    }

    const now = new Date();
    const isExpired = new Date(print.expiresAt) < now;

    const normalizedStatus =
      print.status === LabelPrintStatus.ACTIVE && isExpired
        ? LabelPrintStatus.EXPIRED
        : print.status;

    const canConsume = print.status === LabelPrintStatus.ACTIVE && !isExpired;

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
      originalExpiresAt: print.originalExpiresAt,
      quantity: print.quantity,
      weight: print.weight,
      weightUnit: print.weightUnit,
      lot: print.lot,
      brandOrSupplier: print.brandOrSupplier,
      sif: print.sif,
      responsible: print.responsible,
      showQr: print.showQr,
      consumedAt: print.consumedAt,
      consumedByUserId: print.consumedByUserId,
      consumedByDeviceId: print.consumedByDeviceId,
      message,
      company: {
        id: print.company.id,
        name: print.company.name,
        tradeName: print.company.tradeName,
        document: print.company.document,
        cnpj: print.company.cnpj,
        cep: print.company.cep,
        street: print.company.street,
        number: print.company.number,
        district: print.company.district,
        city: print.company.city,
        state: print.company.state,
      },
      labelItem: {
        id: print.labelItem.id,
        name: print.labelItem.name,
        itemType: print.labelItem.itemType,
        defaultShelfLifeHours: print.labelItem.defaultShelfLifeHours,
        category: {
          id: print.labelItem.category.id,
          name: print.labelItem.category.name,
        },
      },
    };
  }

  async updatePrint(
    id: string,
    data: UpdateLabelPrintDto,
    companyId: string,
  ) {
    const existing = await this.prisma.labelPrint.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        'Etiqueta não encontrada ou não pertence a essa empresa.',
      );
    }

    const expiresAt =
      data.expiresAt !== undefined ? new Date(data.expiresAt) : undefined;

    const originalExpiresAt =
      data.originalExpiresAt !== undefined && data.originalExpiresAt !== null
        ? new Date(data.originalExpiresAt)
        : data.originalExpiresAt === null
          ? null
          : undefined;

    if (expiresAt && Number.isNaN(expiresAt.getTime())) {
      throw new BadRequestException('Data de validade inválida.');
    }

    if (originalExpiresAt instanceof Date && Number.isNaN(originalExpiresAt.getTime())) {
      throw new BadRequestException('Data de validade original inválida.');
    }

    return this.prisma.labelPrint.update({
      where: { id },
      data: {
        lot: data.lot !== undefined ? data.lot?.trim() || null : undefined,
        weight: data.weight !== undefined ? data.weight : undefined,
        weightUnit: data.weightUnit,
        expiresAt,
        originalExpiresAt,
        brandOrSupplier:
          data.brandOrSupplier !== undefined
            ? data.brandOrSupplier?.trim() || null
            : undefined,
        sif: data.sif !== undefined ? data.sif?.trim() || null : undefined,
        responsible:
          data.responsible !== undefined
            ? data.responsible?.trim() || null
            : undefined,
        showQr: data.showQr,
      },
      include: {
        labelItem: {
          include: {
            category: true,
          },
        },
        company: true,
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
      throw new NotFoundException(
        'Etiqueta não encontrada ou não pertence a essa empresa.',
      );
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
        company: true,
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
      throw new NotFoundException(
        'Etiqueta não encontrada ou não pertence a essa empresa.',
      );
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