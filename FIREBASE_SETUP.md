# Firebase Push Notifications Setup

## 📋 Configuración Inicial

### 1. Configurar Firebase Project

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita **Cloud Messaging** en el proyecto
4. Ve a **Project Settings** > **Service Accounts**
5. Genera una nueva clave privada y descarga el archivo JSON
6. Renombra el archivo a `serviceAccountKey.json` y colócalo en la raíz del proyecto

### 2. Estructura de Archivos Creados

```
src/
├── firebase/
│   ├── firebase.service.ts     ✅ Servicio principal de Firebase
│   └── firebase.module.ts      ✅ Módulo de Firebase
├── notifications/
│   ├── notifications.controller.ts  ✅ Controlador de notificaciones
│   ├── notifications.module.ts      ✅ Módulo de notificaciones
│   └── dto/
│       └── send-notification.dto.ts ✅ DTOs de validación
└── devices/
    ├── devices.controller.ts    ✅ Controlador de dispositivos
    ├── devices.service.ts       ✅ Servicio de gestión de tokens
    ├── devices.module.ts        ✅ Módulo de dispositivos
    ├── dto/
    │   └── device.dto.ts        ✅ DTOs de dispositivos
    └── schemas/
        └── device.schema.ts     ✅ Schema de MongoDB
```

## 🚀 API Endpoints

### Notificaciones

#### Enviar notificación individual
```http
POST /notifications
Content-Type: application/json

{
  "token": "fcm-device-token",
  "title": "Título de la notificación",
  "message": "Mensaje de la notificación"
}
```

#### Enviar notificación múltiple
```http
POST /notifications/multiple
Content-Type: application/json

{
  "tokens": ["token1", "token2", "token3"],
  "title": "Título de la notificación",
  "message": "Mensaje de la notificación"
}
```

### Gestión de Dispositivos

#### Registrar dispositivo
```http
POST /devices/register
Content-Type: application/json

{
  "token": "fcm-device-token",
  "deviceId": "unique-device-id",
  "platform": "ios|android|web",
  "deviceName": "iPhone 13",
  "appVersion": "1.0.0"
}
```

#### Obtener tokens activos
```http
GET /devices/tokens/active
GET /devices/tokens/active?userId=user123
```

#### Obtener dispositivos por usuario
```http
GET /devices/user/:userId
```

#### Eliminar dispositivo por token
```http
DELETE /devices/token/:token
```

## 🔧 Características Implementadas

### ✅ Firebase Service
- Inicialización automática con service account
- Envío de notificaciones individuales
- Envío de notificaciones múltiples
- Manejo de errores específicos de Firebase:
  - `messaging/invalid-argument`
  - `messaging/registration-token-not-registered`

### ✅ Gestión de Dispositivos
- Registro automático de dispositivos
- Validación de tokens FCM
- Almacenamiento en MongoDB
- Índices optimizados para consultas
- Gestión de dispositivos activos/inactivos

### ✅ Validación y Seguridad
- DTOs con class-validator
- Validación de formato de tokens
- Manejo de errores HTTP apropiados
- Respuestas estructuradas

### ✅ Endpoints Seguros
- Validación de entrada
- Manejo de errores consistente
- Respuestas JSON estructuradas

## 🛠️ Configuración Adicional

### Variables de Entorno (Opcional)
Puedes configurar variables de entorno para mayor seguridad:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

### Middleware de Autenticación
Para endpoints seguros, puedes agregar guards de autenticación:

```typescript
@UseGuards(JwtAuthGuard)
@Post()
async send(@Body() body: SendNotificationDto) {
  // ...
}
```

## 📱 Integración con Clientes

### Mobile (Expo/React Native)
```javascript
// Obtener token FCM
const token = await Notifications.getExpoPushTokenAsync();

// Registrar dispositivo
fetch('/devices/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: token.data,
    deviceId: DeviceInfo.getUniqueId(),
    platform: Platform.OS,
    deviceName: DeviceInfo.getDeviceName()
  })
});
```

### Web (Laravel/JavaScript)
```javascript
// Solicitar permiso y obtener token
const messaging = getMessaging();
const token = await getToken(messaging, {
  vapidKey: 'your-vapid-key'
});

// Registrar en backend
fetch('/devices/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token,
    deviceId: 'web-' + Date.now(),
    platform: 'web'
  })
});
```

## 🚨 Consideraciones de Producción

1. **Seguridad del Service Account**: Nunca commitear `serviceAccountKey.json`
2. **Rate Limiting**: Implementar límites de velocidad para endpoints
3. **Logging**: Agregar logs para debugging y monitoreo
4. **Cleanup**: Implementar limpieza automática de tokens inválidos
5. **Batch Processing**: Para envíos masivos, considerar procesamiento en lotes

## 🔍 Testing

### Probar notificación individual
```bash
curl -X POST http://localhost:3000/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "token": "your-fcm-token",
    "title": "Test Notification",
    "message": "This is a test message"
  }'
```

### Probar registro de dispositivo
```bash
curl -X POST http://localhost:3000/devices/register \
  -H "Content-Type: application/json" \
  -d '{
    "token": "your-fcm-token",
    "deviceId": "test-device-123",
    "platform": "web"
  }'
```