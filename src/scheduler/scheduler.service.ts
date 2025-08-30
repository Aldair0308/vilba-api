import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventsService } from '../events/events.service';
import { DevicesService } from '../devices/devices.service';
import { FirebaseService } from '../firebase/firebase.service';
import { QuoteService } from '../quote/quote.service';
import { CraneService } from '../crane/crane.service';
import { EventStatus } from '../events/schemas/event.schema';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly eventsService: EventsService,
    private readonly devicesService: DevicesService,
    private readonly firebaseService: FirebaseService,
    private readonly quoteService: QuoteService,
    private readonly craneService: CraneService,
  ) {}

  // Ejecutar cada minuto para verificar eventos que deben iniciar
  @Cron(CronExpression.EVERY_MINUTE, {
    name: 'eventNotificationChecker',
    timeZone: 'America/Mexico_City'
  })
  async checkEventNotifications() {
    try {
      // Buscar eventos que necesitan notificación (próximos + eventos del día actual no notificados)
      const eventsNeedingNotification = await this.eventsService.findEventsNeedingNotification();

      if (eventsNeedingNotification.length === 0) {
        return;
      }

      this.logger.log(`Found ${eventsNeedingNotification.length} events needing notification`);

      // Obtener todos los tokens de dispositivos activos
      const activeTokens = await this.devicesService.getActiveTokens();

      if (activeTokens.length === 0) {
        this.logger.warn('No active devices found for notifications');
        return;
      }

      // Enviar notificaciones para cada evento
      for (const event of eventsNeedingNotification) {
        const now = new Date();
        const eventDate = new Date(event.date);
        const isPastEvent = eventDate < now;
        
        if (isPastEvent) {
          this.logger.log(`Sending notification for past event "${event.title}" (created today but already started)`);
        } else {
          this.logger.log(`Sending notification for upcoming event "${event.title}"`);
        }

        await this.sendEventNotification(event, activeTokens);
        
        // Marcar el evento como notificado
        await this.eventsService.markAsNotified(event._id.toString());
        this.logger.log(`Event "${event.title}" marked as notified`);
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

  // Ejecutar todos los días a las 10:00 AM hora de CDMX para verificar entregas
  @Cron('0 10 * * *', {
    name: 'deliveryNotificationChecker',
    timeZone: 'America/Mexico_City'
  })
  async checkDeliveryNotifications() {
    try {
      this.logger.log('Checking delivery notifications...');
      
      // Obtener cotizaciones aprobadas/activas con fechas de entrega
      const quotesWithDeliveries = await this.quoteService.findQuotesWithDeliveryDates();
      
      if (quotesWithDeliveries.length === 0) {
        this.logger.log('No quotes with delivery dates found');
        return;
      }

      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Normalizar fechas para comparación (solo día, mes, año)
      const todayStr = today.toDateString();
      const tomorrowStr = tomorrow.toDateString();
      
      // Obtener tokens de dispositivos activos
      const activeTokens = await this.devicesService.getActiveTokens();
      
      if (activeTokens.length === 0) {
        this.logger.warn('No active devices found for delivery notifications');
        return;
      }

      let notificationsSent = 0;

      // Revisar cada cotización
      for (const quote of quotesWithDeliveries) {
        for (const crane of quote.cranes) {
          if (crane.fecha_entrega) {
            const deliveryDate = new Date(crane.fecha_entrega);
            const deliveryDateStr = deliveryDate.toDateString();
            
            // Notificación 1 día antes
            if (deliveryDateStr === tomorrowStr) {
              await this.sendDeliveryReminder(quote, crane, 'tomorrow', activeTokens);
              notificationsSent++;
            }
            
            // Notificación el día de la entrega
            if (deliveryDateStr === todayStr) {
              await this.sendDeliveryReminder(quote, crane, 'today', activeTokens);
              notificationsSent++;
            }
          }
        }
      }
      
      this.logger.log(`Delivery notifications check completed. Sent ${notificationsSent} notifications`);
      
    } catch (error) {
      this.logger.error('Error checking delivery notifications:', error);
    }
  }

  private async sendDeliveryReminder(quote: any, crane: any, timing: 'today' | 'tomorrow', tokens: string[]) {
    try {
      // Obtener información del equipo
      const equipmentName = crane.crane?.nombre || crane.crane?.modelo || 'Equipo';
      
      // Obtener información del cliente
      const clientName = quote.clientId?.name || 'Cliente';
      
      // Formatear la fecha
      const deliveryDate = new Date(crane.fecha_entrega);
      const formattedDate = deliveryDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      let title: string;
      let body: string;
      
      if (timing === 'tomorrow') {
        title = '📅 Recordatorio: Entrega Mañana';
        body = `El equipo ${equipmentName} debe ser entregado al cliente ${clientName} mañana (${formattedDate})`;
      } else {
        title = '🚛 Entrega Hoy';
        body = `El equipo ${equipmentName} debe ser entregado al cliente ${clientName} hoy (${formattedDate})`;
      }
      
      const result = await this.firebaseService.sendPushToMultiple(
        tokens,
        title,
        body
      );
      
      this.logger.log(`Delivery reminder sent for ${equipmentName} to ${clientName} (${timing}): Success: ${result.successCount}, Failures: ${result.failureCount}`);
      
    } catch (error) {
      this.logger.error(`Error sending delivery reminder:`, error);
    }
  }

  // Ejecutar cada 20 minutos para verificar fechas de entrega y cambiar estados
  @Cron('0 */20 * * * *', {
    name: 'quoteActivationChecker',
    timeZone: 'America/Mexico_City'
  })
  async checkQuoteActivation() {
    try {
      this.logger.log('🔄 Checking quote activation based on delivery dates...');
      
      // Obtener cotizaciones aprobadas con fechas de entrega
      const approvedQuotes = await this.quoteService.findByStatus('aproved');
      
      if (approvedQuotes.length === 0) {
        this.logger.log('ℹ️ No approved quotes found');
        return;
      }

      const today = new Date();
      const todayStr = today.toDateString();
      let quotesActivated = 0;
      let cranesUpdated = 0;
      
      this.logger.log(`📋 Found ${approvedQuotes.length} approved quotes to check`);

      // Revisar cada cotización aprobada
      for (const quote of approvedQuotes) {
        if (!quote.cranes || quote.cranes.length === 0) {
          continue;
        }

        // Encontrar la fecha de entrega más temprana
        let earliestDeliveryDate = null;
        let earliestCrane = null;
        
        for (const crane of quote.cranes) {
          if (crane.fecha_entrega) {
            const deliveryDate = new Date(crane.fecha_entrega);
            if (!earliestDeliveryDate || deliveryDate < earliestDeliveryDate) {
              earliestDeliveryDate = deliveryDate;
              earliestCrane = crane;
            }
          }
        }

        // Si la fecha de entrega más temprana es hoy, activar la cotización
        if (earliestDeliveryDate && earliestDeliveryDate.toDateString() === todayStr) {
          try {
            this.logger.log(`🎯 Activating quote ${quote._id} - earliest delivery is today`);
            
            // Cambiar estado de cotización a 'active'
            await this.quoteService.switchStatus(quote._id.toString(), 'active');
            quotesActivated++;
            
            // Cambiar estado de todas las grúas de esta cotización a 'en_renta'
             for (const crane of quote.cranes) {
               if (crane.crane) {
                 try {
                   const craneId = crane.crane.toString();
                   await this.craneService.update(craneId, { estado: 'en_renta' });
                   cranesUpdated++;
                   this.logger.log(`🏗️ Updated crane ${craneId} status to 'en_renta'`);
                 } catch (craneError) {
                   this.logger.error(`❌ Error updating crane status:`, craneError);
                 }
               }
             }
            
            this.logger.log(`✅ Quote ${quote._id} activated successfully`);
            
          } catch (error) {
            this.logger.error(`❌ Error activating quote ${quote._id}:`, error);
          }
        }
      }
      
      this.logger.log(`🎉 Quote activation check completed. Activated ${quotesActivated} quotes, updated ${cranesUpdated} cranes`);
      
    } catch (error) {
      this.logger.error('❌ Error in quote activation checker:', error);
    }
  }
}