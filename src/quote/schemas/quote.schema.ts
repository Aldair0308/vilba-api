import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Crane } from '../../crane/entities/crane.entity';
import { Client } from '../../client/schemas/client.schema';
import { File } from '../../file/schemas/file.schema';

@Schema()
export class QuoteCrane {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Crane', required: true })
  crane: string;

  @Prop({ required: true })
  dias: number;

  @Prop({ required: true })
  precio: number;
}

export const QuoteCraneSchema = SchemaFactory.createForClass(QuoteCrane);

@Schema()
export class Quote extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  zone: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Client', required: true })
  clientId: Client;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'File', required: true })
  fileId: File;

  @Prop({
    default: 'pending',
    enum: ['pending', 'rejected', 'aproved', 'active', 'completed'],
  })
  status: string;

  @Prop({
    type: [QuoteCraneSchema],
    required: true,
  })
  cranes: QuoteCrane[];

  @Prop({ nullable: true })
  iva: number;

  @Prop({ nullable: true })
  total: string;

  @Prop({ required: true })
  responsibleId: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const QuoteSchema = SchemaFactory.createForClass(Quote);
