import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { DeviceService } from './device.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CompanyScopeGuard } from 'src/common/guards/company-scope.guard';
import { CompanyContext } from 'src/common/decorators/company-context.decorator';
import type { RequestCompanyContext } from 'src/common/interfaces/request-company-context.interface';

@UseGuards(JwtAuthGuard, CompanyScopeGuard)
@Controller('devices')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) { }

  @Get()
  async list(@CompanyContext() ctx: RequestCompanyContext) {
    return this.deviceService.listByCompany(ctx.companyId);
  }

  @Patch(':id/activate')
  async activate(
    @Param('id') id: string,
    @CompanyContext() ctx: RequestCompanyContext,
  ) {
    return this.deviceService.activate(id, ctx.companyId);
  }

  @Patch(':id/deactivate')
  async deactivate(
    @Param('id') id: string,
    @CompanyContext() ctx: RequestCompanyContext,
  ) {
    return this.deviceService.deactivate(id, ctx.companyId);
  }

  @Patch(':id/rename')
  async rename(
    @Param('id') id: string,
    @Body('name') name: string,
    @CompanyContext() ctx: RequestCompanyContext,
  ) {
    return this.deviceService.rename(id, name, ctx.companyId);
  }

  @Get('status')
  async status(@CompanyContext() ctx: RequestCompanyContext) {
    const devices = await this.deviceService.listByCompany(ctx.companyId);

    const now = Date.now();

    return devices.map((d) => ({
      ...d,
      isOnline:
        !!d.lastSeenAt &&
        now - new Date(d.lastSeenAt).getTime() < 120000, // 2 min
    }));
  }
}