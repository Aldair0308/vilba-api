import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [FirebaseModule],
  controllers: [NotificationsController],
})
export class NotificationsModule {}