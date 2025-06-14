import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CraneModule } from './crane/crane.module';
import { QuoteModule } from './quote/quote.module';
import { RentModule } from './rent/rent.module';
import { PhotoModule } from './photo/photo.module';
import { FileModule } from './file/file.module';
import { ClientModule } from './client/client.module';
import { LogsModule } from './logs/logs.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/vilba-db'), // Cambia "vilba-db" por el nombre de tu DB
    UsersModule,
    AuthModule,
    CraneModule,
    QuoteModule,
    RentModule,
    PhotoModule,
    FileModule,
    ClientModule,
    LogsModule,
    EventsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
