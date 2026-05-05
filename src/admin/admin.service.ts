import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
    const [
      totalCompanies,
      activeCompanies,
      inactiveCompanies,
      totalUsers,
      activeUsers,
      inactiveUsers,
      superAdmins,
      companyAdmins,
      operators,
      totalLabels,
      activeLabels,
      expiredLabels,
      consumedLabels,
      discardedLabels,
      totalDevices,
      activeDevices,
      inactiveDevices,
      recentCompanies,
      recentUsers,
      recentLabels,
    ] = await Promise.all([
      this.prisma.company.count(),
      this.prisma.company.count({ where: { isActive: true } }),
      this.prisma.company.count({ where: { isActive: false } }),

      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { isActive: false } }),
      this.prisma.user.count({ where: { role: 'SUPER_ADMIN' } }),
      this.prisma.user.count({ where: { role: 'COMPANY_ADMIN' } }),
      this.prisma.user.count({ where: { role: 'OPERATOR' } }),

      this.prisma.labelPrint.count(),
      this.prisma.labelPrint.count({ where: { status: 'ACTIVE' } }),
      this.prisma.labelPrint.count({ where: { status: 'EXPIRED' } }),
      this.prisma.labelPrint.count({ where: { status: 'CONSUMED' } }),
      this.prisma.labelPrint.count({ where: { status: 'DISCARDED' } }),

      this.prisma.device.count(),
      this.prisma.device.count({ where: { isActive: true } }),
      this.prisma.device.count({ where: { isActive: false } }),

      this.prisma.company.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          isActive: true,
          createdAt: true,
        },
      }),

      this.prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),

      this.prisma.labelPrint.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          createdAt: true,
          expiresAt: true,
          labelItem: {
            select: {
              name: true,
              company: {
                select: {
                  id: true,
                  name: true,
                },
              },
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const systemWarnings = [
      {
        type: 'INACTIVE_COMPANIES',
        title: 'Empresas inativas',
        value: inactiveCompanies,
        severity: inactiveCompanies > 0 ? 'warning' : 'success',
      },
      {
        type: 'INACTIVE_USERS',
        title: 'Usuários inativos',
        value: inactiveUsers,
        severity: inactiveUsers > 0 ? 'warning' : 'success',
      },
      {
        type: 'EXPIRED_LABELS',
        title: 'Etiquetas vencidas',
        value: expiredLabels,
        severity: expiredLabels > 0 ? 'danger' : 'success',
      },
      {
        type: 'INACTIVE_DEVICES',
        title: 'Dispositivos inativos',
        value: inactiveDevices,
        severity: inactiveDevices > 0 ? 'warning' : 'success',
      },
    ];

    return {
      companies: {
        total: totalCompanies,
        active: activeCompanies,
        inactive: inactiveCompanies,
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        superAdmins,
        companyAdmins,
        operators,
      },
      labels: {
        total: totalLabels,
        active: activeLabels,
        expired: expiredLabels,
        consumed: consumedLabels,
        discarded: discardedLabels,
      },
      devices: {
        total: totalDevices,
        active: activeDevices,
        inactive: inactiveDevices,
      },
      warnings: systemWarnings,
      recent: {
        companies: recentCompanies,
        users: recentUsers,
        labels: recentLabels,
      },
    };
  }
}