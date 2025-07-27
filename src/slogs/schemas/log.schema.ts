import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export enum LogAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  APPROVE = 'approve',
  REJECT = 'reject',
  COMPLETE = 'complete',
  CANCEL = 'cancel'
}

export enum LogModule {
  USER = 'user',
  CLIENT = 'client',
  CRANE = 'crane',
  QUOTE = 'quote',
  RENT = 'rent',
  FILE = 'file',
  PHOTO = 'photo',
  AUTH = 'auth',
  EVENTS = 'events'
}

export type LogDocument = Log & Document;

@Schema({ timestamps: true })
export class Log {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: true, enum: Object.values(LogAction) })
  action: LogAction;

  @Prop({ required: true, enum: Object.values(LogModule) })
  module: LogModule;

  @Prop({ required: true })
  entityId: string;

  @Prop({ required: false })
  entityName?: string;

  @Prop({ type: Object, required: false })
  previousData?: any;

  @Prop({ type: Object, required: false })
  newData?: any;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: true })
  ipAddress: string;

  @Prop({ required: false })
  userAgent?: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const LogSchema = SchemaFactory.createForClass(Log);