# Configuración de Notificaciones Push - Frontend

## Resumen

Este documento explica cómo configurar el frontend para consumir la API de producción y garantizar que las notificaciones push funcionen correctamente.

## 🚀 Configuración de Producción

### 1. URL de la API

Asegúrate de que tu frontend esté configurado para usar la URL de producción:

```javascript
// Configuración recomendada
const API_BASE_URL = 'https://vilba-api-production.up.railway.app/'; // Reemplaza con tu URL real

// En tu archivo de configuración (config.js, .env, etc.)
VUE_APP_API_URL=https://tu-api-produccion.com
// o
REACT_APP_API_URL=https://tu-api-produccion.com
// o
NEXT_PUBLIC_API_URL=https://tu-api-produccion.com
```

### 2. Configuración de Firebase en el Frontend

#### Instalación

```bash
npm install firebase
```

#### Configuración Firebase

```javascript
// firebase-config.js
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'tu-api-key',
  authDomain: 'tu-proyecto.firebaseapp.com',
  projectId: 'tu-proyecto-id',
  storageBucket: 'tu-proyecto.appspot.com',
  messagingSenderId: '123456789',
  appId: 'tu-app-id',
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging };
```

#### Service Worker (firebase-messaging-sw.js)

```javascript
// public/firebase-messaging-sw.js
importScripts(
  'https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js',
);
importScripts(
  'https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js',
);

firebase.initializeApp({
  apiKey: 'tu-api-key',
  authDomain: 'tu-proyecto.firebaseapp.com',
  projectId: 'tu-proyecto-id',
  storageBucket: 'tu-proyecto.appspot.com',
  messagingSenderId: '123456789',
  appId: 'tu-app-id',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
```

## 📱 Implementación en el Frontend

### 1. Solicitar Permisos y Obtener Token

```javascript
// notifications.js
import { messaging } from './firebase-config';
import { getToken, onMessage } from 'firebase/messaging';

class NotificationService {
  constructor() {
    this.token = null;
    this.apiUrl =
      process.env.VUE_APP_API_URL || 'https://tu-api-produccion.com';
  }

  async requestPermission() {
    try {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        console.log('✅ Notification permission granted');
        await this.getFirebaseToken();
        return true;
      } else {
        console.log('❌ Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  }

  async getFirebaseToken() {
    try {
      const token = await getToken(messaging, {
        vapidKey: 'tu-vapid-key', // Obtén esto de Firebase Console
      });

      if (token) {
        console.log('🔑 Firebase token obtained:', token);
        this.token = token;
        await this.registerDevice(token);
        return token;
      } else {
        console.log('❌ No registration token available');
        return null;
      }
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async registerDevice(token) {
    try {
      const userId = this.getCurrentUserId(); // Implementa según tu sistema de auth

      const response = await fetch(`${this.apiUrl}/devices/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getAuthToken()}`, // Tu token de auth
        },
        body: JSON.stringify({
          token: token,
          userId: userId,
          platform: this.getPlatform(),
          deviceInfo: this.getDeviceInfo(),
        }),
      });

      if (response.ok) {
        console.log('✅ Device registered successfully');
        return true;
      } else {
        console.error('❌ Failed to register device:', await response.text());
        return false;
      }
    } catch (error) {
      console.error('Error registering device:', error);
      return false;
    }
  }

  setupForegroundListener() {
    onMessage(messaging, (payload) => {
      console.log('📨 Foreground message received:', payload);

      // Mostrar notificación personalizada o toast
      this.showCustomNotification(payload);
    });
  }

  showCustomNotification(payload) {
    // Implementa tu lógica de notificación personalizada
    // Puede ser un toast, modal, etc.
    const { title, body } = payload.notification;

    // Ejemplo con toast (ajusta según tu librería de UI)
    this.showToast({
      title: title,
      message: body,
      type: 'info',
      duration: 5000,
    });
  }

  getPlatform() {
    const userAgent = navigator.userAgent;
    if (/android/i.test(userAgent)) return 'android';
    if (/iPad|iPhone|iPod/.test(userAgent)) return 'ios';
    return 'web';
  }

  getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
    };
  }

  getCurrentUserId() {
    // Implementa según tu sistema de autenticación
    // Ejemplo:
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.id || user?._id;
  }

  getAuthToken() {
    // Implementa según tu sistema de autenticación
    return (
      localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
    );
  }
}

export default new NotificationService();
```

### 2. Inicialización en tu App Principal

```javascript
// main.js (Vue) o App.js (React) o _app.js (Next.js)
import NotificationService from './services/notifications';

// Al inicializar tu app
async function initializeApp() {
  // ... otras inicializaciones

  // Configurar notificaciones
  const permissionGranted = await NotificationService.requestPermission();

  if (permissionGranted) {
    NotificationService.setupForegroundListener();
    console.log('🔔 Notifications initialized successfully');
  } else {
    console.log('⚠️ Notifications not available');
  }
}

initializeApp();
```

### 3. Manejo de Estados de Usuario

```javascript
// auth.js - Cuando el usuario hace login/logout
class AuthService {
  async login(credentials) {
    try {
      const response = await this.apiLogin(credentials);

      if (response.success) {
        // Guardar datos de usuario
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('authToken', response.token);

        // Registrar dispositivo para notificaciones
        await NotificationService.getFirebaseToken();

        return response;
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      // Desregistrar dispositivo
      await this.unregisterDevice();

      // Limpiar datos locales
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async unregisterDevice() {
    try {
      const token = NotificationService.token;
      if (token) {
        await fetch(`${this.apiUrl}/devices/unregister`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.getAuthToken()}`,
          },
          body: JSON.stringify({ token }),
        });
      }
    } catch (error) {
      console.error('Error unregistering device:', error);
    }
  }
}
```

## 🔧 Endpoints de la API

### Registro de Dispositivo

```http
POST /devices/register
Content-Type: application/json
Authorization: Bearer {token}

{
  "token": "firebase-token",
  "userId": "user-id",
  "platform": "web|android|ios",
  "deviceInfo": {
    "userAgent": "...",
    "platform": "...",
    "language": "..."
  }
}
```

### Desregistro de Dispositivo

```http
POST /devices/unregister
Content-Type: application/json
Authorization: Bearer {token}

{
  "token": "firebase-token"
}
```

### Notificación Manual (Solo para pruebas)

```http
POST /notifications/send-multiple
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "Título de prueba",
  "body": "Mensaje de prueba",
  "tokens": ["token1", "token2"]
}
```

## 🧪 Testing y Debugging

### 1. Verificar Configuración

```javascript
// debug.js
class NotificationDebug {
  static async checkConfiguration() {
    console.log('🔍 Checking notification configuration...');

    // 1. Verificar permisos
    const permission = Notification.permission;
    console.log('📋 Notification permission:', permission);

    // 2. Verificar service worker
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      console.log('⚙️ Service Worker registered:', !!registration);
    }

    // 3. Verificar Firebase token
    const token = await NotificationService.getFirebaseToken();
    console.log('🔑 Firebase token available:', !!token);

    // 4. Verificar conectividad con API
    await this.testApiConnection();
  }

  static async testApiConnection() {
    try {
      const response = await fetch(`${NotificationService.apiUrl}/health`);
      console.log('🌐 API connection:', response.ok ? '✅ OK' : '❌ Failed');
    } catch (error) {
      console.log('🌐 API connection: ❌ Failed -', error.message);
    }
  }

  static async testNotification() {
    try {
      const response = await fetch(
        `${NotificationService.apiUrl}/notifications/test`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${NotificationService.getAuthToken()}`,
          },
          body: JSON.stringify({
            token: NotificationService.token,
          }),
        },
      );

      console.log(
        '🧪 Test notification:',
        response.ok ? '✅ Sent' : '❌ Failed',
      );
    } catch (error) {
      console.log('🧪 Test notification: ❌ Failed -', error.message);
    }
  }
}

// Usar en consola del navegador
// NotificationDebug.checkConfiguration();
// NotificationDebug.testNotification();
```

### 2. Console Commands para Testing

```javascript
// Agregar al window para debugging en producción
if (process.env.NODE_ENV === 'development') {
  window.NotificationDebug = NotificationDebug;
  window.NotificationService = NotificationService;
}
```

## ⚠️ Consideraciones Importantes

### 1. HTTPS Requerido

- Las notificaciones push **SOLO** funcionan en HTTPS
- Asegúrate de que tu dominio de producción use SSL

### 2. Permisos del Usuario

- Solicita permisos en el momento adecuado (no inmediatamente al cargar)
- Explica al usuario por qué necesitas los permisos
- Maneja graciosamente cuando los permisos son denegados

### 3. Tokens de Firebase

- Los tokens pueden cambiar, re-registra periódicamente
- Maneja tokens inválidos o expirados

### 4. Compatibilidad

- iOS Safari tiene limitaciones con PWAs
- Algunos navegadores no soportan notificaciones
- Siempre verifica la disponibilidad antes de usar

## 🚀 Checklist de Implementación

- [ ] ✅ Configurar Firebase en el proyecto
- [ ] ✅ Crear service worker para notificaciones
- [ ] ✅ Implementar solicitud de permisos
- [ ] ✅ Registrar dispositivo en la API
- [ ] ✅ Configurar listener para mensajes en primer plano
- [ ] ✅ Manejar registro/desregistro en login/logout
- [ ] ✅ Configurar URL de API de producción
- [ ] ✅ Probar en dispositivos reales
- [ ] ✅ Verificar funcionamiento en HTTPS
- [ ] ✅ Implementar debugging tools

## 📞 Soporte

Si tienes problemas con las notificaciones:

1. Verifica que estés usando HTTPS
2. Confirma que los permisos están otorgados
3. Revisa la consola del navegador para errores
4. Usa las herramientas de debugging incluidas
5. Verifica que el token se esté registrando correctamente en la API

---

**¡Con esta configuración, las notificaciones deberían funcionar perfectamente en producción!** 🎉
