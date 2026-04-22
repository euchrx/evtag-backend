import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { CurrentUser } from 'src/common/interfaces/current-user.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        company: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuário inativo');
    }

    if (user.companyId && user.company && !user.company.isActive) {
      throw new UnauthorizedException('Empresa inativa');
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const token = this.jwt.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        company: user.company
          ? {
              id: user.company.id,
              name: user.company.name,
              isActive: user.company.isActive,
            }
          : null,
      },
    };
  }

  async registerCompany(data: {
    name: string;
    email: string;
    password: string;
    userName: string;
  }) {
    const companyName = data.name?.trim();
    const userName = data.userName?.trim();
    const email = data.email?.trim().toLowerCase();
    const password = data.password;

    if (!companyName) {
      throw new UnauthorizedException('Nome da empresa é obrigatório');
    }

    if (!userName) {
      throw new UnauthorizedException('Nome do usuário é obrigatório');
    }

    if (!email) {
      throw new UnauthorizedException('E-mail é obrigatório');
    }

    if (!password) {
      throw new UnauthorizedException('Senha é obrigatória');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Já existe usuário com este e-mail');
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: companyName,
        },
      });

      const user = await tx.user.create({
        data: {
          name: userName,
          email,
          password: hashed,
          role: 'COMPANY_ADMIN',
          companyId: company.id,
        },
        include: {
          company: true,
        },
      });

      return { company, user };
    });

    const token = this.jwt.sign({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
      companyId: result.user.companyId,
    });

    return {
      access_token: token,
      company: result.company,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        companyId: result.user.companyId,
        company: result.user.company
          ? {
              id: result.user.company.id,
              name: result.user.company.name,
              isActive: result.user.company.isActive,
            }
          : null,
      },
    };
  }

  async me(currentUser: CurrentUser) {
    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.userId },
      include: {
        company: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuário inativo');
    }

    if (user.companyId && user.company && !user.company.isActive) {
      throw new UnauthorizedException('Empresa inativa');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
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