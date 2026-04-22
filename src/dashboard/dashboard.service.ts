import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(companyId: string) {
    const now = new Date();

    const [
      total,
      active,
      expired,
      warning,
      consumed,
      discarded,
      recent,
    ] = await Promise.all([
      this.prisma.labelPrint.count({
        where: { companyId },
      }),

      this.prisma.labelPrint.count({
        where: {
          companyId,
          status: 'ACTIVE',
          expiresAt: { gte: now },
        },
      }),

      this.prisma.labelPrint.count({
        where: {
          companyId,
          expiresAt: { lt: now },
        },
      }),

      this.prisma.labelPrint.count({
        where: {
          companyId,
          status: 'ACTIVE',
          expiresAt: {
            gte: now,
            lte: new Date(now.getTime() + 6 * 60 * 60 * 1000),
          },
        },
      }),

      this.prisma.labelPrint.count({
        where: {
          companyId,
          status: 'CONSUMED',
        },
      }),

      this.prisma.labelPrint.count({
        where: {
          companyId,
          status: 'DISCARDED',
        },
      }),

      this.prisma.labelPrint.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: {
          labelItem: {
            include: {
              category: true,
            },
          },
        },
      }),
    ]);

    return {
      metrics: {
        total,
        active,
        expired,
        warning,
        consumed,
        discarded,
      },
      recent,
    };
  }
}