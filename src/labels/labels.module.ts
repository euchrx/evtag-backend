import { Module } from '@nestjs/common';
import { LabelsController } from './labels.controller';
import { LabelsService } from './labels.service';
import { DeviceModule } from 'src/device/device.module';

@Module({
  imports: [DeviceModule],
  controllers: [LabelsController],
  providers: [LabelsService],
})
export class LabelsModule {}