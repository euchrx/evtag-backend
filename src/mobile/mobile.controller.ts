import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { MobileService } from './mobile.service';

@Controller('mobile')
export class MobileController {
  constructor(private readonly mobileService: MobileService) {}

  @Get('labels/lookup/:qrCode')
  async lookupLabel(
    @Param('qrCode') qrCode: string,
    @Headers('x-device-id') headerDeviceId?: string,
    @Query('deviceId') queryDeviceId?: string,
  ) {
    const deviceId = headerDeviceId || queryDeviceId;

    return this.mobileService.lookupLabelByQrCode(qrCode, deviceId);
  }

  @Patch('labels/:id/consume')
  async consumeLabel(
    @Param('id') id: string,
    @Headers('x-device-id') headerDeviceId?: string,
    @Query('deviceId') queryDeviceId?: string,
    @Body() body?: { responsible?: string },
  ) {
    const deviceId = headerDeviceId || queryDeviceId;

    return this.mobileService.consumeLabel(id, deviceId, body?.responsible);
  }
}
