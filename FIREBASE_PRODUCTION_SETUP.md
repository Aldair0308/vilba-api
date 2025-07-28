# Configuración de Firebase para Producción

## Problema Resuelto
El error "Firebase is not initialized. Please configure serviceAccountKey.json" ocurre porque en producción no tenemos acceso al archivo `serviceAccountKey.json`. La solución es usar variables de entorno.

## Opciones de Configuración

### Opción 1: Variable de entorno con JSON completo (Recomendado)
Configura la variable de entorno `FIREBASE_SERVICE_ACCOUNT` con el contenido completo del archivo serviceAccountKey.json:

```bash
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"tu-proyecto-id","private_key_id":"tu-private-key-id","private_key":"-----BEGIN PRIVATE KEY-----\nTU_PRIVATE_KEY_AQUI\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com","client_id":"tu-client-id","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40tu-proyecto.iam.gserviceaccount.com"}
```

### Opción 2: Variables individuales
Configura estas variables de entorno por separado:

```bash
FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_PRIVATE_KEY_ID=tu-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_PRIVATE_KEY_AQUI\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=tu-client-id
```

## Configuración en Railway

1. Ve a tu proyecto en Railway
2. Navega a la pestaña "Variables"
3. Agrega la variable `FIREBASE_SERVICE_ACCOUNT` con el JSON completo del serviceAccountKey
4. Redeploya tu aplicación

## Obtener las credenciales de Firebase

1. Ve a la [Consola de Firebase](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a "Configuración del proyecto" (ícono de engranaje)
4. Pestaña "Cuentas de servicio"
5. Haz clic en "Generar nueva clave privada"
6. Descarga el archivo JSON
7. Copia el contenido completo para la variable de entorno

## Verificación

Una vez configurado, deberías ver en los logs:
- "Using Firebase credentials from environment variable" o
- "Using Firebase credentials from individual environment variables"
- "Firebase initialized successfully"

## Ejemplo de uso del endpoint

```bash
curl -X POST https://vilba-api-production.up.railway.app/notifications/multiple \
  -H "Content-Type: application/json" \
  -d '{
    "tokens": ["tu-token-fcm"],
    "title": "Título de prueba",
    "message": "Mensaje de prueba",
    "imageUrl": "https://ejemplo.com/imagen.jpg"
  }'
```