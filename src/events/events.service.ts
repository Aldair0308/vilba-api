import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event, EventDocument } from './schemas/event.schema';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    private readonly logsService: LogsService,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const createdEvent = new this.eventModel(createEventDto);
    const savedEvent = await createdEvent.save();
    
    // Crear registro en logs
    try {
      await this.logsService.createLog(
        createEventDto.userId,
        createEventDto.userName,
        'create',
        'events',
        savedEvent._id.toString(),
        {
          newData: savedEvent,
          description: `Event "${savedEvent.title}" created successfully`,
        },
      );
    } catch (error) {
      console.error('Error creating log for event creation:', error);
      // No lanzamos el error para no afectar la creación del evento
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
    // Obtener el evento original para el log
    const originalEvent = await this.eventModel.findById(id).exec();
    if (!originalEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    
    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(id, updateEventDto, { new: true })
      .exec();
    
    // Crear registro en logs
    try {
      await this.logsService.createLog(
        updateEventDto.userId || originalEvent.userId,
        updateEventDto.userName || originalEvent.userName,
        'update',
        'events',
        id,
        {
          entityName: 'Event',
          previousData: {
            title: originalEvent.title,
            description: originalEvent.description,
            date: originalEvent.date,
            type: originalEvent.type,
            status: originalEvent.status,
          },
          newData: {
            title: updatedEvent.title,
            description: updatedEvent.description,
            date: updatedEvent.date,
            type: updatedEvent.type,
            status: updatedEvent.status,
          },
          description: `Event "${updatedEvent.title}" updated successfully`,
        }
      );
    } catch (error) {
      console.error('Error creating log for event update:', error);
    }
    
    return updatedEvent;
  }

  async remove(id: string): Promise<Event> {
    const deletedEvent = await this.eventModel.findByIdAndDelete(id).exec();
    if (!deletedEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    
    // Crear registro en logs
    try {
      await this.logsService.createLog(
        deletedEvent.userId,
        deletedEvent.userName,
        'delete',
        'events',
        id,
        {
          previousData: deletedEvent,
          description: `Event "${deletedEvent.title}" deleted successfully`,
        },
      );
    } catch (error) {
      console.error('Error creating log for event deletion:', error);
    }
    
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
}
