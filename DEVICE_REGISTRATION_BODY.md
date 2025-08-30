# Device Registration API Body

## Endpoint
```
POST /devices/register
```

## Body Structure

### Registro Normal de Dispositivo
```json
{
  "token": "firebase_device_token_here",
  "userId": "user_id_here",
  "platform": "android",
  "deviceInfo": {
    "brand": "Samsung",
    "modelName": "Galaxy S21",
    "osName": "Android",
    "osVersion": "12"
  },
  "deviceName": "Mi Samsung Galaxy",
  "appVersion": "1.0.0",
  "metadata": {
    "customField": "customValue"
  }
}
```

### Registro de Dispositivo por Administrador
```json
{
  "token": "firebase_device_token_here",
  "userId": "user_id_here",
  "platform": "ios",
  "deviceInfo": {
    "brand": "Apple",
    "modelName": "iPhone 14",
    "osName": "iOS",
    "osVersion": "16.0"
  },
  "deviceName": "iPhone de Juan",
  "appVersion": "1.0.0",
  "adminId": "admin_user_id_here",
  "adminName": "María González",
  "adminEmail": "maria.gonzalez@empresa.com",
  "adminRole": "admin",
  "registeredByAdmin": true,
  "metadata": {
    "registrationReason": "Dispositivo corporativo asignado",
    "department": "IT"
  }
}
```

## Campos Requeridos
- `token`: Token de Firebase del dispositivo (string, requerido)
- `userId`: ID del usuario propietario del dispositivo (string, requerido)
- `platform`: Plataforma del dispositivo (enum: 'ios', 'android', 'web', requerido)

## Campos Opcionales
- `deviceInfo`: Información del dispositivo (objeto)
  - `brand`: Marca del dispositivo
  - `modelName`: Modelo del dispositivo
  - `osName`: Nombre del sistema operativo
  - `osVersion`: Versión del sistema operativo
- `deviceName`: Nombre personalizado del dispositivo
- `appVersion`: Versión de la aplicación
- `metadata`: Metadatos adicionales (objeto)

## Campos de Administrador (Opcionales)
- `adminId`: ID del administrador que registra el dispositivo
- `adminName`: Nombre del administrador
- `adminEmail`: Email del administrador
- `adminRole`: Rol del administrador
- `registeredByAdmin`: Indica si fue registrado por un administrador (boolean)

## Respuesta Exitosa
```json
{
  "success": true,
  "message": "Device registered successfully",
  "device": {
    "id": "device_mongodb_id",
    "deviceId": "generated_device_id",
    "platform": "android",
    "deviceName": "Mi Samsung Galaxy",
    "isActive": true
  }
}
```

## Respuesta de Error
```json
{
  "success": false,
  "message": "Error message here"
}
```

## Notas
- El `deviceId` se genera automáticamente basado en el `userId`, `platform` y `deviceInfo`
- Si no se proporciona `deviceName`, se genera automáticamente desde `deviceInfo` o se usa un nombre por defecto
- Los campos de administrador solo se deben incluir cuando un administrador está registrando el dispositivo en nombre de otro usuario
- El token debe ser un token válido de Firebase Cloud Messaging (FCM)