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

  @Prop({ nullable: true })
  category: string;

  @Prop({
    type: [
      {
        zona: { type: String, required: true },
        precio: { type: [Number], required: true }, // Cambiado a array de números
      },
    ],
    default: [],
  })
  precios: Array<{ zona: string; precio: number[] }>;
}

export const CraneSchema = SchemaFactory.createForClass(Crane);
