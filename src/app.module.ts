import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/vilba-db'), // Cambia "vilba-db" por el nombre de tu DB
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
