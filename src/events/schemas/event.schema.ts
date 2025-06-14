import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EventDocument = Event & Document;

export enum EventType {
  MAINTENANCE = 'maintenance',
  SERVICE = 'service',
  TRAINING = 'training',
  MEETING = 'meeting',
  OTHER = 'other'
}

export enum EventStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: false })
  endDate?: Date;

  @Prop({ enum: EventType, default: EventType.OTHER })
  type: EventType;

  @Prop({ enum: EventStatus, default: EventStatus.SCHEDULED })
  status: EventStatus;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: false })
  location?: string;

  @Prop({ required: false })
  notes?: string;

  @Prop({ default: false })
  allDay: boolean;

  @Prop({ required: false })
  reminderMinutes?: number;

  @Prop({ type: [String], default: [] })
  attendees: string[];

  @Prop({ required: false })
  color?: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);

// Índices para mejorar el rendimiento
EventSchema.index({ date: 1 });
EventSchema.index({ userId: 1 });
EventSchema.index({ type: 1 });
EventSchema.index({ status: 1 });
EventSchema.index({ date: 1, userId: 1 });