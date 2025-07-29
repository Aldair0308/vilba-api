# Sistema de Notificaciones Automáticas para Eventos

## Descripción

El sistema de notificaciones automáticas envía notificaciones push a todos los dispositivos registrados cuando un evento está próximo a iniciar. El sistema verifica cada minuto si hay eventos que deben comenzar y envía las notificaciones correspondientes.

## Características

- ✅ **Verificación automática cada minuto** - El scheduler revisa eventos próximos
- ✅ **Notificaciones a todos los dispositivos** - Envía a todos los usuarios registrados
- ✅ **Notificaciones específicas por asistentes** - Opción para enviar solo a attendees
- ✅ **Logging detallado** - Registra todas las actividades de notificación
- ✅ **Endpoints manuales** - Permite envío manual de notificaciones

## Cómo Funciona

### 1. Scheduler Automático
El servicio `SchedulerService` ejecuta una tarea cada minuto que:
1. Busca eventos que deben iniciar en el próximo minuto
2. Filtra solo eventos con status `scheduled`
3. Obtiene todos los tokens de dispositivos activos
4. Envía notificaciones push a todos los dispositivos

### 2. Creación de Eventos
Cuando se crea un evento, el sistema:
1. Guarda el evento en la base de datos
2. Calcula cuándo se enviará la notificación automática
3. Registra información en los logs

### 3. Formato de Notificación
- **Título**: `🔔 Evento: [Título del evento]`
- **Mensaje**: `[Descripción] - [Ubicación]` (si tiene ubicación)

## Endpoints Disponibles

### Notificaciones Manuales

#### Enviar notificación a todos los dispositivos
```bash
POST /scheduler/send-event-notification/:eventId
```

#### Enviar notificación solo a asistentes del evento
```bash
POST /scheduler/send-event-notification-attendees/:eventId
```

#### Verificar estado del scheduler
```bash
GET /scheduler/test
```

### Consultas de Eventos

#### Eventos próximos (para testing)
```bash
GET /events/upcoming/:minutes
# Ejemplo: GET /events/upcoming/5 (eventos en los próximos 5 minutos)
```

#### Eventos de hoy
```bash
GET /events/today
```

#### Eventos de la próxima semana
```bash
GET /events/next-week
```

## Configuración

### Requisitos
- Firebase configurado correctamente
- Al menos un dispositivo registrado en `/devices`
- Eventos con status `scheduled`

### Variables de Entorno
Asegúrate de tener configurado:
```bash
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
```

## Ejemplos de Uso

### 1. Crear un evento que activará notificación automática
```bash
POST /events
Content-Type: application/json

{
  "title": "Reunión de equipo",
  "description": "Reunión semanal del equipo de desarrollo",
  "date": "2024-01-15T10:00:00.000Z",
  "userId": "user123",
  "userName": "Juan Pérez",
  "type": "meeting",
  "location": "Sala de conferencias A",
  "attendees": ["user123", "user456"]
}
```

### 2. Registrar un dispositivo para recibir notificaciones
```bash
POST /devices/register
Content-Type: application/json

{
  "token": "fcm-token-del-dispositivo",
  "deviceId": "device-unique-id",
  "userId": "user123",
  "platform": "android",
  "deviceName": "Samsung Galaxy S21"
}
```

### 3. Enviar notificación manual
```bash
POST /scheduler/send-event-notification/[EVENT_ID]
```

### 4. Verificar eventos próximos
```bash
GET /events/upcoming/1
# Retorna eventos que iniciarán en el próximo minuto
```

## Logs y Monitoreo

El sistema registra información detallada:

### Al crear eventos:
```
Event "Reunión de equipo" created successfully
📅 Event "Reunión de equipo" scheduled for 2024-01-15T10:00:00.000Z
⏰ Automatic notification will be sent in approximately 24 hours
```

### Al enviar notificaciones:
```
Found 1 events starting soon
Notification sent for event "Reunión de equipo" to 5 devices
Success: 5, Failures: 0
```

### En caso de errores:
```
No active devices found for notifications
Error sending notification for event "Reunión de equipo": [error details]
```

## Troubleshooting

### No se envían notificaciones automáticas
1. Verificar que hay dispositivos activos: `GET /devices`
2. Verificar que Firebase está inicializado correctamente
3. Verificar que el evento tiene status `scheduled`
4. Verificar logs del servidor

### Notificaciones no llegan a los dispositivos
1. Verificar que los tokens FCM son válidos
2. Verificar configuración de Firebase
3. Probar con notificación manual primero

### Eventos no aparecen en búsquedas
1. Verificar formato de fecha (ISO 8601)
2. Verificar que el evento no esté en el pasado
3. Verificar status del evento

## Próximas Mejoras

- [ ] Notificaciones con recordatorios personalizables (15 min, 1 hora antes)
- [ ] Notificaciones por tipo de evento
- [ ] Notificaciones solo a usuarios específicos por rol
- [ ] Integración con calendario
- [ ] Notificaciones de cancelación/cambio de eventos