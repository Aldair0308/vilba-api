import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Device extends Document {
  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ required: true })
  deviceId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, enum: ['ios', 'android', 'web'] })
  platform: string;

  @Prop({ required: false })
  deviceName?: string;

  @Prop({ required: false })
  appVersion?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: Date.now })
  lastSeen: Date;

  @Prop({ type: Object, required: false })
  metadata?: Record<string, any>;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

// Create indexes for better performance (removed duplicate token index since unique: true already creates one)
DeviceSchema.index({ userId: 1 });
DeviceSchema.index({ deviceId: 1 });
DeviceSchema.index({ isActive: 1 });