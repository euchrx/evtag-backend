import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { MobileService } from './mobile.service';

@Controller('mobile')
export class MobileController {
  constructor(private readonly mobileService: MobileService) {}

  @Get('labels/lookup/:qrCode')
  async lookupLabel(
    @Param('qrCode') qrCode: string,
    @Query('deviceId') deviceId: string,
  ) {
    return this.mobileService.lookupLabelByQrCode(qrCode, deviceId);
  }

  @Patch('labels/:id/consume')
  async consumeLabel(
    @Param('id') id: string,
    @Query('deviceId') deviceId: string,
    @Body() body?: { responsible?: string },
  ) {
    return this.mobileService.consumeLabel(id, deviceId, body?.responsible);
  }
}