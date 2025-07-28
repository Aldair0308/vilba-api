# Vilba API

API backend para la aplicación Vilba, construida con NestJS y Firebase.

## Características

- 🔥 **Firebase Push Notifications** - Notificaciones push con soporte para imágenes
- 📱 **Device Management** - Registro y gestión de dispositivos móviles
- 🔐 **Authentication** - Sistema de autenticación integrado
- 📊 **Multiple Modules** - Gestión de usuarios, eventos, archivos, fotos, cotizaciones y más

## Configuración del Proyecto

### Instalación
```bash
npm install
```

### Configuración de Firebase

#### Para Desarrollo
1. Copia `serviceAccountKey.json.example` a `serviceAccountKey.json`
2. Reemplaza los valores con tus credenciales de Firebase

#### Para Producción
Configura las variables de entorno. Ver [FIREBASE_PRODUCTION_SETUP.md](./FIREBASE_PRODUCTION_SETUP.md) para detalles completos.

**Opción recomendada:** Variable de entorno con JSON completo:
```bash
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"..."}
```

### Ejecutar el proyecto

```bash
# desarrollo
npm run start

# modo watch
npm run start:dev

# producción
npm run start:prod
```

## API Endpoints

### Notificaciones Push

#### Enviar notificación individual
```bash
POST /notifications
Content-Type: application/json

{
  "token": "device-fcm-token",
  "title": "Título",
  "message": "Mensaje",
  "imageUrl": "https://ejemplo.com/imagen.jpg" // opcional
}
```

#### Enviar notificaciones múltiples
```bash
POST /notifications/multiple
Content-Type: application/json

{
  "tokens": ["token1", "token2"],
  "title": "Título",
  "message": "Mensaje",
  "imageUrl": "https://ejemplo.com/imagen.jpg" // opcional
}
```

### Gestión de Dispositivos

#### Registrar dispositivo
```bash
POST /devices/register
Content-Type: application/json

{
  "token": "fcm-token",
  "userId": "user-id",
  "platform": "ios|android|web",
  "deviceInfo": {
    "brand": "Samsung",
    "modelName": "Galaxy S21",
    "osName": "Android",
    "osVersion": "12"
  }
}
```

## Estructura del Proyecto

```
src/
├── auth/           # Autenticación
├── client/         # Gestión de clientes
├── crane/          # Gestión de grúas
├── devices/        # Gestión de dispositivos
├── events/         # Gestión de eventos
├── file/           # Gestión de archivos
├── firebase/       # Servicio de Firebase
├── notifications/  # Notificaciones push
├── photo/          # Gestión de fotos
├── quote/          # Cotizaciones
├── rent/           # Alquileres
├── users/          # Gestión de usuarios
└── main.ts         # Punto de entrada
```

## Solución de Problemas

### Error: "Firebase is not initialized"
Este error indica que las credenciales de Firebase no están configuradas correctamente. 

**Solución:**
1. Verifica que tienes configurada la variable `FIREBASE_SERVICE_ACCOUNT` en producción
2. O que el archivo `serviceAccountKey.json` existe en desarrollo
3. Consulta [FIREBASE_PRODUCTION_SETUP.md](./FIREBASE_PRODUCTION_SETUP.md) para más detalles

### Error: "Invalid token format"
La validación de tokens ha sido deshabilitada para permitir cualquier formato durante las pruebas.

## Deployment

La aplicación está configurada para desplegarse en Railway. Asegúrate de configurar las variables de entorno necesarias:

- `FIREBASE_SERVICE_ACCOUNT` - Credenciales completas de Firebase
- `DATABASE_URL` - URL de la base de datos MongoDB
- Otras variables específicas del entorno

## Pruebas

```bash
# tests unitarios
npm run test

# tests e2e
npm run test:e2e

# cobertura de tests
npm run test:cov
```
