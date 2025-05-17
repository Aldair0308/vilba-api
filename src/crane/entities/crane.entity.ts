import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CraneDocument = Crane & Document;

@Schema({ timestamps: true })
export class Crane {
  @Prop({ required: true })
  marca: string;

  @Prop({ required: true })
  modelo: string;

  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  capacidad: number;

  @Prop({ required: true })
  tipo: string;

  @Prop({ required: true, default: 'activo' })
  estado: string;

  @Prop({ required: true, type: [String] })
  tipoCotizacion: string[];
}

export const CraneSchema = SchemaFactory.createForClass(Crane);
