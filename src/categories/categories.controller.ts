import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CompanyScopeGuard } from 'src/common/guards/company-scope.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CompanyContext } from 'src/common/decorators/company-context.decorator';
import type { RequestCompanyContext } from 'src/common/interfaces/request-company-context.interface';

@UseGuards(JwtAuthGuard, RolesGuard, CompanyScopeGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN')
  create(
    @Body() dto: CreateCategoryDto,
    @CompanyContext() company: RequestCompanyContext,
  ) {
    return this.categoriesService.create(dto, company.companyId);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'OPERATOR')
  findAll(@CompanyContext() company: RequestCompanyContext) {
    return this.categoriesService.findAll(company.companyId);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'OPERATOR')
  findOne(
    @Param('id') id: string,
    @CompanyContext() company: RequestCompanyContext,
  ) {
    return this.categoriesService.findById(id, company.companyId);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @CompanyContext() company: RequestCompanyContext,
  ) {
    return this.categoriesService.update(id, dto, company.companyId);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN')
  remove(
    @Param('id') id: string,
    @CompanyContext() company: RequestCompanyContext,
  ) {
    return this.categoriesService.remove(id, company.companyId);
  }
}