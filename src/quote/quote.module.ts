import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuoteService } from './quote.service';
import { QuoteController } from './quote.controller';
import { Quote, QuoteSchema } from './schemas/quote.schema';
import { UsersModule } from '../users/users.module';
import { ClientModule } from '../client/client.module';
import { FirebaseModule } from '../firebase/firebase.module';
import { DevicesModule } from '../devices/devices.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Quote.name, schema: QuoteSchema }]),
    UsersModule,
    ClientModule,
    FirebaseModule,
    DevicesModule,
    EventsModule,
  ],
  controllers: [QuoteController],
  providers: [QuoteService],
  exports: [QuoteService],
})
export class QuoteModule {}
