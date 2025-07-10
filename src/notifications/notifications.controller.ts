import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { SendNotificationDto, SendMultipleNotificationDto } from './dto/send-notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Post()
  async send(@Body() body: SendNotificationDto) {
    try {
      const { token, title, message } = body;
      const result = await this.firebaseService.sendPush(token, title, message);
      return {
        success: true,
        messageId: result,
        message: 'Notification sent successfully'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to send notification',
          error: error.code || 'UNKNOWN_ERROR'
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('multiple')
  async sendToMultiple(@Body() body: SendMultipleNotificationDto) {
    try {
      const { tokens, title, message } = body;
      const result = await this.firebaseService.sendPushToMultiple(tokens, title, message);
      return {
        success: true,
        successCount: result.successCount,
        failureCount: result.failureCount,
        responses: result.responses,
        message: 'Notifications processed'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to send notifications',
          error: error.code || 'UNKNOWN_ERROR'
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }
}