import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

type FileType = 'pdf' | 'excel';

export type FileDocument = File & Document;

@Schema({ timestamps: true })
export class File {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  base64: string;

  @Prop({ required: true, enum: ['pdf', 'excel'] })
  type: FileType;

  @Prop({ required: true })
  department: string;

  @Prop({ required: true })
  responsible_id: string;
}

export const FileSchema = SchemaFactory.createForClass(File);
