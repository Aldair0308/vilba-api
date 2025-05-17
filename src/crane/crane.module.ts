import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CraneService } from './crane.service';
import { CraneController } from './crane.controller';
import { Crane, CraneSchema } from './entities/crane.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Crane.name, schema: CraneSchema }]),
  ],
  controllers: [CraneController],
  providers: [CraneService],
})
export class CraneModule {}
