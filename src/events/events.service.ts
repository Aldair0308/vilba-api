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
    return createdEvent.save();
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
    return updatedEvent;
  }

  async remove(id: string): Promise<Event> {
    const deletedEvent = await this.eventModel.findByIdAndDelete(id).exec();
    if (!deletedEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`);
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
