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
      // Check if Firebase is already initialized
      if (admin.apps.length > 0) {
        console.log('Firebase already initialized');
        return;
      }

      console.log('Initializing Firebase...');
      
      // Option 1: Try environment variable with full JSON
      const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
      if (serviceAccountEnv) {
        console.log('Using FIREBASE_SERVICE_ACCOUNT environment variable');
        try {
          const serviceAccount = JSON.parse(serviceAccountEnv);
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
          console.log('Firebase initialized successfully with environment variable');
          this.isInitialized = true;
          return;
        } catch (error) {
          console.error('Error parsing FIREBASE_SERVICE_ACCOUNT:', error.message);
        }
      }

      // Option 2: Try serviceAccountKey.json file
      const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');
      console.log('Checking for serviceAccountKey.json at:', serviceAccountPath);
      
      if (fs.existsSync(serviceAccountPath)) {
        console.log('Found serviceAccountKey.json file');
        try {
          const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
          console.log('Firebase initialized successfully with serviceAccountKey.json');
          this.isInitialized = true;
          return;
        } catch (error) {
          console.error('Error reading serviceAccountKey.json:', error.message);
        }
      } else {
        console.log('serviceAccountKey.json not found at:', serviceAccountPath);
      }

      // Option 3: Try individual environment variables
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

      if (projectId && privateKey && clientEmail) {
        console.log('Using individual Firebase environment variables');
        try {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId,
              privateKey: privateKey.replace(/\\n/g, '\n'),
              clientEmail,
            }),
          });
          console.log('Firebase initialized successfully with individual environment variables');
          this.isInitialized = true;
          return;
        } catch (error) {
          console.error('Error with individual environment variables:', error.message);
        }
      }

      // If all options fail
      console.error('Firebase initialization failed: No valid credentials found');
      console.log('Available environment variables:', {
        FIREBASE_SERVICE_ACCOUNT: !!process.env.FIREBASE_SERVICE_ACCOUNT,
        FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
        FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
        FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
      });
      
    } catch (error) {
      console.error('Firebase initialization error:', error);
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