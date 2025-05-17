import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Quote } from '../../quote/schemas/quote.schema';
import { Crane } from '../../crane/entities/crane.entity';

export enum RentStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

@Schema()
export class Rent extends Document {
  @Prop({ required: true })
  projectName: string;

  @Prop({ required: true })
  zone: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Quote', required: true })
  quote: Quote;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Crane', required: true })
  crane: Crane;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ 
    default: RentStatus.PENDING, 
    enum: Object.values(RentStatus) 
  })
  status: RentStatus;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const RentSchema = SchemaFactory.createForClass(Rent);
