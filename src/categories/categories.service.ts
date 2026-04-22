import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCategoryDto, companyId: string) {
    const name = data.name.trim();

    const existing = await this.prisma.labelCategory.findFirst({
      where: {
        companyId,
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      throw new ConflictException('Já existe uma categoria com esse nome.');
    }

    return this.prisma.labelCategory.create({
      data: {
        name,
        companyId,
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.labelCategory.findMany({
      where: {
        companyId,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string, companyId: string) {
    const category = await this.prisma.labelCategory.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada.');
    }

    return category;
  }

  async update(id: string, data: UpdateCategoryDto, companyId: string) {
    await this.findById(id, companyId);

    const name = data.name?.trim();

    if (name) {
      const existing = await this.prisma.labelCategory.findFirst({
        where: {
          id: { not: id },
          companyId,
          name: {
            equals: name,
            mode: 'insensitive',
          },
        },
      });

      if (existing) {
        throw new ConflictException('Já existe uma categoria com esse nome.');
      }
    }

    return this.prisma.labelCategory.update({
      where: { id },
      data: {
        name,
        isActive: data.isActive,
      },
    });
  }

  async remove(id: string, companyId: string) {
    await this.findById(id, companyId);

    return this.prisma.labelCategory.update({
      where: { id },
      data: { isActive: false },
    });
  }
}