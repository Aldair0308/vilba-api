import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event, EventDocument } from './schemas/event.schema';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const createdEvent = new this.eventModel(createEventDto);
    const savedEvent = await createdEvent.save();
    
    console.log(`Event "${savedEvent.title}" created successfully`);
    
    // Log información sobre notificaciones automáticas
    const now = new Date();
    const eventDate = new Date(savedEvent.date);
    const timeDiff = eventDate.getTime() - now.getTime();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const isToday = eventDate >= startOfDay && eventDate < new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    
    if (timeDiff > 0) {
      const hoursUntilEvent = Math.round(timeDiff / (1000 * 60 * 60));
      console.log(`📅 Event "${savedEvent.title}" scheduled for ${eventDate.toISOString()}`);
      console.log(`⏰ Automatic notification will be sent in approximately ${hoursUntilEvent} hours`);
    } else if (isToday) {
      console.log(`📅 Event "${savedEvent.title}" was scheduled for today at ${eventDate.toISOString()}`);
      console.log(`🔔 Automatic notification will be sent immediately (event already started but created today)`);
    } else {
      console.log(`⚠️ Event "${savedEvent.title}" is scheduled in the past - no automatic notification will be sent`);
    }
    
    return savedEvent;
  }

  async findAll(): Promise<Event[]> {
    return this.eventModel.find().sort({ date: 1 }).exec();
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventModel.findById(id).exec();
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  async findByUser(userId: string): Promise<Event[]> {
    return this.eventModel.find({ userId }).sort({ date: 1 }).exec();
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Event[]> {
    return this.eventModel
      .find({
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .sort({ date: 1 })
      .exec();
  }

  async findByUserAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Event[]> {
    return this.eventModel
      .find({
        userId,
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .sort({ date: 1 })
      .exec();
  }

  async findByType(type: string): Promise<Event[]> {
    return this.eventModel.find({ type }).sort({ date: 1 }).exec();
  }

  async findByStatus(status: string): Promise<Event[]> {
    return this.eventModel.find({ status }).sort({ date: 1 }).exec();
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(id, updateEventDto, { new: true })
      .exec();
    
    if (!updatedEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    
    console.log(`Event "${updatedEvent.title}" updated successfully`);
    
    return updatedEvent;
  }

  async remove(id: string): Promise<Event> {
    const deletedEvent = await this.eventModel.findByIdAndDelete(id).exec();
    if (!deletedEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    
    console.log(`Event "${deletedEvent.title}" deleted successfully`);
    
    return deletedEvent;
  }

  // Método auxiliar para crear eventos programáticamente
  async createEvent(
    title: string,
    description: string,
    date: Date,
    userId: string,
    userName: string,
    type?: string,
    additionalData?: Partial<CreateEventDto>,
  ): Promise<Event> {
    const eventData: CreateEventDto = {
      title,
      description,
      date,
      userId,
      userName,
      type: type as any,
      ...additionalData,
    };
    return this.create(eventData);
  }

  // Buscar eventos que están próximos a iniciar (para notificaciones)
  async findUpcomingEvents(minutesAhead: number = 1): Promise<Event[]> {
    const now = new Date();
    const futureTime = new Date(now.getTime() + (minutesAhead * 60000));
    
    return this.eventModel
      .find({
        date: {
          $gte: now,
          $lte: futureTime,
        },
        status: 'scheduled'
      })
      .sort({ date: 1 })
      .exec();
  }

  // Buscar eventos que necesitan notificación (próximos + eventos del día actual no notificados)
  async findEventsNeedingNotification(): Promise<EventDocument[]> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const futureTime = new Date(now.getTime() + (1 * 60000)); // 1 minuto hacia adelante
    
    return this.eventModel
      .find({
        $or: [
          // Eventos próximos a iniciar (en el próximo minuto)
          {
            date: {
              $gte: now,
              $lte: futureTime,
            },
            status: 'scheduled',
            notified: { $ne: true }
          },
          // Eventos del día actual que ya pasaron pero no han sido notificados
          {
            date: {
              $gte: startOfDay,
              $lt: now,
            },
            status: 'scheduled',
            notified: { $ne: true }
          }
        ]
      })
      .sort({ date: 1 })
      .exec();
  }

  // Marcar evento como notificado
  async markAsNotified(eventId: string): Promise<void> {
    await this.eventModel.findByIdAndUpdate(eventId, { notified: true }).exec();
  }

  // Buscar eventos de hoy
  async findTodayEvents(): Promise<Event[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    return this.eventModel
      .find({
        date: {
          $gte: startOfDay,
          $lt: endOfDay,
        },
      })
      .sort({ date: 1 })
      .exec();
  }

  // Buscar eventos de la próxima semana
  async findNextWeekEvents(): Promise<Event[]> {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
    
    return this.eventModel
      .find({
        date: {
          $gte: now,
          $lte: nextWeek,
        },
      })
      .sort({ date: 1 })
      .exec();
  }
}
