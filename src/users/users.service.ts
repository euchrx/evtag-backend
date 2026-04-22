import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import type { CurrentUser } from 'src/common/interfaces/current-user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private ensureAdmin(user: CurrentUser) {
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'COMPANY_ADMIN') {
      throw new ForbiddenException('Sem permissão para gerenciar usuários');
    }
  }

  private async ensureCompanyExists(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada.');
    }

    return company;
  }

  private async findManagedUserOrThrow(id: string, currentUser: CurrentUser) {
    const where =
      currentUser.role === 'SUPER_ADMIN'
        ? { id }
        : { id, companyId: currentUser.companyId ?? undefined };

    const user = await this.prisma.user.findFirst({
      where,
      include: {
        company: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return user;
  }

  async create(dto: CreateUserDto, currentUser: CurrentUser) {
    this.ensureAdmin(currentUser);

    const email = dto.email.trim().toLowerCase();
    const name = dto.name.trim();

    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new ConflictException('Já existe usuário com este e-mail.');
    }

    let role = dto.role;
    let companyId = dto.companyId ?? null;

    if (currentUser.role === 'COMPANY_ADMIN') {
      if (!currentUser.companyId) {
        throw new ForbiddenException('Administrador sem empresa vinculada.');
      }

      if (role === 'SUPER_ADMIN') {
        throw new ForbiddenException('COMPANY_ADMIN não pode criar SUPER_ADMIN.');
      }

      companyId = currentUser.companyId;
    }

    if (role !== 'SUPER_ADMIN' && !companyId) {
      throw new ForbiddenException('Usuários não SUPER_ADMIN precisam de empresa.');
    }

    if (role === 'SUPER_ADMIN') {
      companyId = null;
    }

    if (companyId) {
      await this.ensureCompanyExists(companyId);
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        role,
        companyId,
      },
      include: {
        company: true,
      },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      isActive: user.isActive,
      company: user.company
        ? {
            id: user.company.id,
            name: user.company.name,
            isActive: user.company.isActive,
          }
        : null,
    };
  }

  async findAll(currentUser: CurrentUser) {
    this.ensureAdmin(currentUser);

    const where =
      currentUser.role === 'SUPER_ADMIN'
        ? {}
        : { companyId: currentUser.companyId ?? undefined };

    const users = await this.prisma.user.findMany({
      where,
      include: {
        company: true,
      },
      orderBy: [{ name: 'asc' }],
    });

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      isActive: user.isActive,
      company: user.company
        ? {
            id: user.company.id,
            name: user.company.name,
            isActive: user.company.isActive,
          }
        : null,
    }));
  }

  async findById(id: string, currentUser: CurrentUser) {
    this.ensureAdmin(currentUser);

    const user = await this.findManagedUserOrThrow(id, currentUser);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      isActive: user.isActive,
      company: user.company
        ? {
            id: user.company.id,
            name: user.company.name,
            isActive: user.company.isActive,
          }
        : null,
    };
  }

  async update(id: string, dto: UpdateUserDto, currentUser: CurrentUser) {
    this.ensureAdmin(currentUser);

    const managedUser = await this.findManagedUserOrThrow(id, currentUser);

    const email = dto.email?.trim().toLowerCase();
    const name = dto.name?.trim();

    if (email && email !== managedUser.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Já existe usuário com este e-mail.');
      }
    }

    let companyId = dto.companyId;

    if (currentUser.role === 'COMPANY_ADMIN') {
      companyId = currentUser.companyId ?? undefined;
    }

    if (companyId) {
      await this.ensureCompanyExists(companyId);
    }

    const data: {
      name?: string;
      email?: string;
      password?: string;
      isActive?: boolean;
      companyId?: string | null;
    } = {};

    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (companyId !== undefined) data.companyId = companyId;

    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data,
      include: {
        company: true,
      },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      isActive: user.isActive,
      company: user.company
        ? {
            id: user.company.id,
            name: user.company.name,
            isActive: user.company.isActive,
          }
        : null,
    };
  }
}