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
import { LabelsService } from './labels.service';
import {
  CreateLabelItemDto,
  CreateLabelPrintDto,
  UpdateLabelItemDto,
} from './dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CompanyScopeGuard } from 'src/common/guards/company-scope.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CompanyContext } from 'src/common/decorators/company-context.decorator';
import type { RequestCompanyContext } from 'src/common/interfaces/request-company-context.interface';
import { LabelPrintStatus } from 'src/generated/prisma/enums';

@UseGuards(JwtAuthGuard, RolesGuard, CompanyScopeGuard)
@Controller('labels')
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  @Post('items')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN')
  createItem(
    @Body() dto: CreateLabelItemDto,
    @CompanyContext() company: RequestCompanyContext,
  ) {
    return this.labelsService.createItem(dto, company.companyId);
  }

  @Get('items')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'OPERATOR')
  findItems(@CompanyContext() company: RequestCompanyContext) {
    return this.labelsService.findItems(company.companyId);
  }

  @Get('items/:id')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'OPERATOR')
  findItemById(
    @Param('id') id: string,
    @CompanyContext() company: RequestCompanyContext,
  ) {
    return this.labelsService.findItemById(id, company.companyId);
  }

  @Patch('items/:id')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN')
  updateItem(
    @Param('id') id: string,
    @Body() dto: UpdateLabelItemDto,
    @CompanyContext() company: RequestCompanyContext,
  ) {
    return this.labelsService.updateItem(id, dto, company.companyId);
  }

  @Delete('items/:id')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN')
  deleteItem(
    @Param('id') id: string,
    @CompanyContext() company: RequestCompanyContext,
  ) {
    return this.labelsService.deleteItem(id, company.companyId);
  }

  @Post('prints')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'OPERATOR')
  createPrint(
    @Body() dto: CreateLabelPrintDto,
    @CompanyContext() company: RequestCompanyContext,
  ) {
    return this.labelsService.createPrint(dto, company.companyId);
  }

  @Get('prints')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'OPERATOR')
  findPrints(@CompanyContext() company: RequestCompanyContext) {
    return this.labelsService.findPrints(company.companyId);
  }

  @Get('prints/qr/:qrCode')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'OPERATOR')
  findPrintByQrCode(
    @Param('qrCode') qrCode: string,
    @CompanyContext() company: RequestCompanyContext,
  ) {
    return this.labelsService.findPrintByQrCode(qrCode, company.companyId);
  }

  @Get('prints/qr/:qrCode/mobile')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'OPERATOR')
  findPrintByQrCodeForMobile(
    @Param('qrCode') qrCode: string,
    @CompanyContext() company: RequestCompanyContext,
  ) {
    return this.labelsService.findPrintByQrCodeForMobile(
      qrCode,
      company.companyId,
    );
  }

  @Patch('prints/:id')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'OPERATOR')
  updatePrint(
    @Param('id') id: string,
    @Body()
    dto: {
      lot?: string | null;
      weight?: number | null;
      expiresAt?: Date;
    },
    @CompanyContext() company: RequestCompanyContext,
  ) {
    return this.labelsService.updatePrint(id, dto, company.companyId);
  }

  @Patch('prints/:id/status')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'OPERATOR')
  updatePrintStatus(
    @Param('id') id: string,
    @Body('status') status: LabelPrintStatus,
    @CompanyContext() company: RequestCompanyContext,
  ) {
    return this.labelsService.updatePrintStatus(
      id,
      status,
      company.companyId,
    );
  }

  @Patch('prints/:id/consume')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'OPERATOR')
  consumePrint(
    @Param('id') id: string,
    @CompanyContext() company: RequestCompanyContext,
  ) {
    return this.labelsService.consumePrint(id, company.companyId);
  }
}