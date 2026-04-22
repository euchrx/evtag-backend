import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CompanyScopeGuard } from '../common/guards/company-scope.guard';

import { CompanyContext } from '../common/decorators/company-context.decorator';
import type { RequestCompanyContext } from '../common/interfaces/request-company-context.interface';

@UseGuards(JwtAuthGuard, RolesGuard, CompanyScopeGuard)
@Controller('labels')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('dashboard')
  getDashboard(@CompanyContext() company: RequestCompanyContext) {
    return this.dashboardService.getDashboard(company.companyId);
  }
}