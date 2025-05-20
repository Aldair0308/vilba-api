import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Rent } from '../../rent/schemas/rent.schema';

export enum ClientStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Schema()
export class Client extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  rfc: string;

  @Prop({ required: true })
  address: string;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Rent' }],
    default: [],
  })
  rentHistory: Rent[];

  @Prop({
    default: ClientStatus.ACTIVE,
    enum: Object.values(ClientStatus),
  })
  status: ClientStatus;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const ClientSchema = SchemaFactory.createForClass(Client);
