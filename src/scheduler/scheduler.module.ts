import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { SchedulerController } from './scheduler.controller';
import { EventsModule } from '../events/events.module';
import { DevicesModule } from '../devices/devices.module';
import { FirebaseModule } from '../firebase/firebase.module';
import { QuoteModule } from '../quote/quote.module';
import { CraneModule } from '../crane/crane.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    EventsModule,
    DevicesModule,
    FirebaseModule,
    QuoteModule,
    CraneModule,
  ],
  controllers: [SchedulerController],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}