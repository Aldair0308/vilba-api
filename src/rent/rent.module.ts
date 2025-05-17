import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Rent, RentSchema } from './schemas/rent.schema';
import { RentService } from './rent.service';
import { RentController } from './rent.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Rent.name, schema: RentSchema }]),
  ],
  controllers: [RentController],
  providers: [RentService],
})
export class RentModule {}
