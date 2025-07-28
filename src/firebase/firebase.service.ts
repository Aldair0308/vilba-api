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
      let serviceAccount: any;

      // Try to get credentials from environment variables first (for production)
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
          serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
          this.logger.log('Using Firebase credentials from environment variable');
        } catch (parseError) {
          this.logger.error('Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable:', parseError.message);
        }
      }

      // If no environment variable, try to load from file (for development)
      if (!serviceAccount) {
        const serviceAccountPath = path.resolve('serviceAccountKey.json');
        
        if (fs.existsSync(serviceAccountPath)) {
          serviceAccount = require(serviceAccountPath);
          this.logger.log('Using Firebase credentials from serviceAccountKey.json file');
        }
      }

      // If still no credentials found, try individual environment variables
      if (!serviceAccount && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
        serviceAccount = {
          type: 'service_account',
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID,
          auth_uri: 'https://accounts.google.com/o/oauth2/auth',
          token_uri: 'https://oauth2.googleapis.com/token',
          auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
          client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`
        };
        this.logger.log('Using Firebase credentials from individual environment variables');
      }

      if (!serviceAccount) {
        this.logger.warn('No Firebase credentials found. Please configure either:');
        this.logger.warn('1. FIREBASE_SERVICE_ACCOUNT environment variable with full JSON');
        this.logger.warn('2. serviceAccountKey.json file');
        this.logger.warn('3. Individual environment variables (FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL)');
        return;
      }

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