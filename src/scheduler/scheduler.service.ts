import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventsService } from '../events/events.service';
import { DevicesService } from '../devices/devices.service';
import { FirebaseService } from '../firebase/firebase.service';
import { EventStatus } from '../events/schemas/event.schema';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly eventsService: EventsService,
    private readonly devicesService: DevicesService,
    private readonly firebaseService: FirebaseService,
  ) {}

  // Ejecutar cada minuto para verificar eventos que deben iniciar
  @Cron(CronExpression.EVERY_MINUTE)
  async checkEventNotifications() {
    try {
      // Buscar eventos que deben iniciar en el próximo minuto
      const upcomingEvents = await this.eventsService.findUpcomingEvents(1);

      if (upcomingEvents.length === 0) {
        return;
      }

      this.logger.log(`Found ${upcomingEvents.length} events starting soon`);

      // Obtener todos los tokens de dispositivos activos
      const activeTokens = await this.devicesService.getActiveTokens();

      if (activeTokens.length === 0) {
        this.logger.warn('No active devices found for notifications');
        return;
      }

      // Enviar notificaciones para cada evento
      for (const event of upcomingEvents) {
        await this.sendEventNotification(event, activeTokens);
        
        // Opcional: Marcar el evento como "en progreso" si quieres
        // await this.eventsService.update(event._id.toString(), { 
        //   status: EventStatus.IN_PROGRESS 
        // });
      }

    } catch (error) {
      this.logger.error('Error checking event notifications:', error);
    }
  }

  private async sendEventNotification(event: any, tokens: string[]) {
    try {
      const title = `🔔 Evento: ${event.title}`;
      const body = `${event.description}${event.location ? ` - ${event.location}` : ''}`;
      
      // Enviar notificación a todos los dispositivos
      const result = await this.firebaseService.sendPushToMultiple(
        tokens,
        title,
        body
      );

      this.logger.log(`Notification sent for event "${event.title}" to ${tokens.length} devices`);
      this.logger.log(`Success: ${result.successCount}, Failures: ${result.failureCount}`);

    } catch (error) {
      this.logger.error(`Error sending notification for event "${event.title}":`, error);
    }
  }

  // Método manual para enviar notificación de un evento específico
  async sendEventNotificationManual(eventId: string) {
    try {
      const event = await this.eventsService.findOne(eventId);
      const activeTokens = await this.devicesService.getActiveTokens();

      if (activeTokens.length === 0) {
        throw new Error('No active devices found for notifications');
      }

      await this.sendEventNotification(event, activeTokens);
      
      return {
        success: true,
        message: `Notification sent for event "${event.title}" to ${activeTokens.length} devices`,
        devicesNotified: activeTokens.length
      };

    } catch (error) {
      this.logger.error('Error sending manual event notification:', error);
      throw error;
    }
  }

  // Método para enviar notificación solo a usuarios específicos de un evento
  async sendEventNotificationToAttendees(eventId: string) {
    try {
      const event = await this.eventsService.findOne(eventId);
      
      // Si el evento tiene attendees, enviar solo a ellos
      if (event.attendees && event.attendees.length > 0) {
        let allTokens: string[] = [];
        
        for (const userId of event.attendees) {
          const userTokens = await this.devicesService.getActiveTokensByUserId(userId);
          allTokens = [...allTokens, ...userTokens];
        }

        if (allTokens.length === 0) {
          throw new Error('No active devices found for event attendees');
        }

        await this.sendEventNotification(event, allTokens);
        
        return {
          success: true,
          message: `Notification sent for event "${event.title}" to ${event.attendees.length} attendees (${allTokens.length} devices)`,
          attendeesNotified: event.attendees.length,
          devicesNotified: allTokens.length
        };
      } else {
        // Si no hay attendees específicos, enviar a todos
        return await this.sendEventNotificationManual(eventId);
      }

    } catch (error) {
      this.logger.error('Error sending event notification to attendees:', error);
      throw error;
    }
  }
}