import { Controller, Post, Param, Get } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';

@Controller('scheduler')
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Post('send-event-notification/:eventId')
  async sendEventNotification(@Param('eventId') eventId: string) {
    return this.schedulerService.sendEventNotificationManual(eventId);
  }

  @Post('send-event-notification-attendees/:eventId')
  async sendEventNotificationToAttendees(@Param('eventId') eventId: string) {
    return this.schedulerService.sendEventNotificationToAttendees(eventId);
  }

  @Post('test-quote-activation')
  async testQuoteActivation() {
    await this.schedulerService.checkQuoteActivation();
    return {
      success: true,
      message: 'Quote activation check executed manually'
    };
  }

  @Get('test')
  async testScheduler() {
    return {
      message: 'Scheduler service is running',
      timestamp: new Date().toISOString(),
      status: 'active'
    };
  }

  @Post('check-notifications')
  async forceCheckNotifications() {
    await this.schedulerService.checkEventNotifications();
    return {
      message: 'Notification check completed',
      timestamp: new Date().toISOString()
    };
  }
}