import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUserDecorator } from 'src/common/decorators/current-user.decorator';
import type { CurrentUser } from 'src/common/interfaces/current-user.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @Roles('SUPER_ADMIN')
  create(
    @Body() dto: CreateCompanyDto,
    @CurrentUserDecorator() user: CurrentUser,
  ) {
    return this.companiesService.create(dto, user);
  }

  @Get()
  @Roles('SUPER_ADMIN')
  findAll(@CurrentUserDecorator() user: CurrentUser) {
    return this.companiesService.findAll(user);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN')
  findOne(
    @Param('id') id: string,
    @CurrentUserDecorator() user: CurrentUser,
  ) {
    return this.companiesService.findById(id, user);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCompanyDto,
    @CurrentUserDecorator() user: CurrentUser,
  ) {
    return this.companiesService.update(id, dto, user);
  }
}   