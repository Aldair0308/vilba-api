import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Crane } from '../../crane/entities/crane.entity';

@Schema()
export class Quote extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  zone: string;

  @Prop({ required: true, type: Number })
  hourlyRate: number;

  @Prop({ type: Number })
  dailyRate: number;

  @Prop({ type: Number })
  projectRate: number;

  @Prop({ default: 'active', enum: ['active', 'inactive'] })
  status: string;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Crane' }],
    required: true,
  })
  cranes: Crane[];

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const QuoteSchema = SchemaFactory.createForClass(Quote);
