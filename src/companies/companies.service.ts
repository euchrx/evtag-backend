import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import type { CurrentUser } from 'src/common/interfaces/current-user.interface';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  private ensureSuperAdmin(user: CurrentUser) {
    if (user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Acesso permitido apenas para SUPER_ADMIN');
    }
  }

  async create(dto: CreateCompanyDto, user: CurrentUser) {
    this.ensureSuperAdmin(user);

    const name = dto.name.trim();

    const existing = await this.prisma.company.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      throw new ConflictException('Já existe uma empresa com esse nome.');
    }

    return this.prisma.company.create({
      data: {
        name,
      },
    });
  }

  async findAll(user: CurrentUser) {
    this.ensureSuperAdmin(user);

    return this.prisma.company.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findById(id: string, user: CurrentUser) {
    this.ensureSuperAdmin(user);

    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada.');
    }

    return company;
  }

  async update(id: string, dto: UpdateCompanyDto, user: CurrentUser) {
    this.ensureSuperAdmin(user);

    await this.findById(id, user);

    const name = dto.name?.trim();

    if (name) {
      const existing = await this.prisma.company.findFirst({
        where: {
          id: { not: id },
          name: {
            equals: name,
            mode: 'insensitive',
          },
        },
      });

      if (existing) {
        throw new ConflictException('Já existe uma empresa com esse nome.');
      }
    }

    return this.prisma.company.update({
      where: { id },
      data: {
        name,
        isActive: dto.isActive,
      },
    });
  }
}