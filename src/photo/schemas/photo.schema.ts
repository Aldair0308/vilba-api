import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Photo extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  base64: string;

  @Prop({ required: true })
  department: string;

  @Prop({ required: true })
  responsible_id: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const PhotoSchema = SchemaFactory.createForClass(Photo);
