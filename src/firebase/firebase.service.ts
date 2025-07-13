import * as admin from 'firebase-admin';
import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);
  private isInitialized = false;

  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      const serviceAccountPath = path.resolve('serviceAccountKey.json');
      
      if (!fs.existsSync(serviceAccountPath)) {
        this.logger.warn('serviceAccountKey.json not found. Firebase notifications will not work. Please add your Firebase service account key.');
        return;
      }

      const serviceAccount = require(serviceAccountPath);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      
      this.isInitialized = true;
      this.logger.log('Firebase initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase:', error.message);
    }
  }

  async sendPush(token: string, title: string, body: string, imageUrl?: string) {
    if (!this.isInitialized) {
      throw new Error('Firebase is not initialized. Please configure serviceAccountKey.json');
    }

    try {
      const message: any = {
        token,
        notification: { title, body },
      };

      // Add image if provided
      if (imageUrl) {
        message.notification.imageUrl = imageUrl;
        // For Android, also add to data payload for better compatibility
        message.data = {
          imageUrl: imageUrl
        };
        // For web notifications
        message.webpush = {
          notification: {
            icon: imageUrl,
            image: imageUrl
          }
        };
      }

      return await admin.messaging().send(message);
    } catch (error) {
      // Handle common Firebase messaging errors
      if (error.code === 'messaging/invalid-argument') {
        throw new Error('Invalid token or message format');
      }
      if (error.code === 'messaging/registration-token-not-registered') {
        throw new Error('Token is no longer valid');
      }
      throw error;
    }
  }

  async sendPushToMultiple(tokens: string[], title: string, body: string, imageUrl?: string) {
    if (!this.isInitialized) {
      throw new Error('Firebase is not initialized. Please configure serviceAccountKey.json');
    }

    try {
      const results = [];
      let successCount = 0;
      let failureCount = 0;

      for (const token of tokens) {
        try {
          const message: any = {
            token,
            notification: { title, body },
          };

          // Add image if provided
          if (imageUrl) {
            message.notification.imageUrl = imageUrl;
            // For Android, also add to data payload for better compatibility
            message.data = {
              imageUrl: imageUrl
            };
            // For web notifications
            message.webpush = {
              notification: {
                icon: imageUrl,
                image: imageUrl
              }
            };
          }

          const result = await admin.messaging().send(message);
          results.push({ success: true, messageId: result });
          successCount++;
        } catch (error) {
          results.push({ success: false, error: error.message });
          failureCount++;
        }
      }

      return {
        successCount,
        failureCount,
        responses: results
      };
    } catch (error) {
      throw error;
    }
  }
}