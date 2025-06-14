import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IsNotEmpty, IsEmail } from 'class-validator';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  @IsNotEmpty()
  name: string;

  @Prop({ required: true, unique: true })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Prop({ required: true })
  @IsNotEmpty()
  password: string;

  @Prop({ default: 'photo_user.jpg' })
  photo: string;

  @Prop({ default: 'user' })
  rol: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
