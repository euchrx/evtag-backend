import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { MobileService } from './mobile.service';

@Controller('mobile')
export class MobileController {
  constructor(private readonly mobileService: MobileService) {}

  @Post('devices/heartbeat')
  async heartbeatDevice(
    @Headers('x-device-id') headerDeviceId?: string,
    @Headers('x-company-id') companyId?: string,
    @Query('deviceId') queryDeviceId?: string,
    @Body() body?: { deviceId?: string; name?: string },
  ) {
    const deviceId = headerDeviceId || body?.deviceId || queryDeviceId;

    return this.mobileService.heartbeatDevice({
      deviceId,
      companyId,
      name: body?.name,
    });
  }

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