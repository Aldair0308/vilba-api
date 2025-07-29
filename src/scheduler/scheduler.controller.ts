import { Controller, Post, Param, Get } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';

@Controller('scheduler')
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Post('send-event-notification/:eventId')
  async sendEventNotification(@Param('eventId') eventId: string) {
    return await this.schedulerService.sendEventNotificationManual(eventId);
  }

  @Post('send-event-notification-attendees/:eventId')
  async sendEventNotificationToAttendees(@Param('eventId') eventId: string) {
    return await this.schedulerService.sendEventNotificationToAttendees(eventId);
  }

  @Get('test')
  async testScheduler() {
    return {
      message: 'Scheduler service is running',
      timestamp: new Date().toISOString(),
      status: 'active'
    };
  }
}