# Sistema de Notificaciones Automáticas para Cotizaciones

## Descripción
Este sistema envía notificaciones automáticas a todos los administradores cuando una cotización cambia de estado "pending" a "approved".

## Funcionalidades

### 1. Detección Automática
- El sistema detecta automáticamente cuando una cotización cambia de "pending" a "approved"
- Se activa en el método `switchStatus` del `QuoteService`

### 2. Contenido del Mensaje
La notificación incluye:
- Nombre del usuario que aprobó la cotización
- Número de equipos en la cotización
- Nombre del cliente
- Ejemplo: "Juan Pérez ha aprobado una cotización con 3 equipos para el cliente ABC Corp"

### 3. Destinatarios
- Se envía a todos los usuarios con rol "admin"
- Utiliza los tokens de dispositivos registrados de cada administrador
- Soporta múltiples dispositivos por administrador

## Implementación Técnica

### Archivos Modificados

#### 1. `quote.service.ts`
- Agregado `DevicesService` como dependencia
- Modificado método `switchStatus` para detectar cambios de estado
- Implementado método `sendApprovalNotification` mejorado

#### 2. `quote.module.ts`
- Agregado `DevicesModule` a las importaciones

### Flujo de Funcionamiento

1. **Cambio de Estado**: Cuando se llama `switchStatus` con estado "approved"
2. **Verificación**: Se verifica que el estado anterior era "pending"
3. **Recopilación de Datos**:
   - Información del usuario que aprobó
   - Datos del cliente
   - Número de equipos
4. **Obtención de Administradores**: Se consultan todos los usuarios con rol "admin"
5. **Recopilación de Tokens**: Se obtienen todos los tokens de dispositivos activos de los administradores
6. **Envío de Notificaciones**: Se utiliza `FirebaseService.sendPushToMultiple` para enviar a todos los dispositivos

## Uso

### Endpoint
```
PATCH /quotes/:id/status
```

### Parámetros
- `id`: ID de la cotización
- `status`: Nuevo estado (debe ser "approved" para activar notificaciones)
- `userId` (opcional): ID del usuario que realiza el cambio

### Ejemplo de Uso
```bash
curl -X PATCH "https://vilba-api-production.up.railway.app/quotes/123/status" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved",
    "userId": "user123"
  }'
```

## Características Técnicas

### Manejo de Errores
- Errores individuales al obtener tokens no afectan el proceso general
- Errores en el envío de notificaciones se registran en logs
- El proceso principal de cambio de estado no se ve afectado por errores de notificación

### Logging
- Se registra el número de dispositivos a los que se envió la notificación
- Se registran errores específicos para debugging
- Se informa cuando no hay tokens disponibles

### Dependencias
- `UsersService`: Para obtener administradores
- `DevicesService`: Para obtener tokens de dispositivos
- `FirebaseService`: Para envío de notificaciones push
- `ClientService`: Para información del cliente (ya existía)

## Consideraciones Importantes

### Tokens de Dispositivo
- Los administradores deben tener dispositivos registrados con tokens válidos
- Solo se envían notificaciones a dispositivos activos (`isActive: true`)
- Un administrador puede tener múltiples dispositivos

### Rendimiento
- Las notificaciones se envían de forma asíncrona
- No bloquean el proceso principal de cambio de estado
- Utiliza `sendPushToMultiple` para eficiencia

### Escalabilidad
- El sistema maneja múltiples administradores y dispositivos
- Optimizado para envío masivo de notificaciones

## Monitoreo

### Logs a Revisar
- "Notificación enviada a X dispositivos de administradores"
- "No se encontraron tokens de dispositivos para administradores"
- "Error obteniendo tokens para admin [email]"
- "Error enviando notificaciones múltiples"

## Mejoras Futuras

1. **Plantillas de Mensajes**: Configurar plantillas personalizables
2. **Filtros de Notificación**: Permitir a administradores configurar qué notificaciones recibir
3. **Historial de Notificaciones**: Guardar registro de notificaciones enviadas
4. **Notificaciones por Email**: Agregar respaldo por email si no hay tokens
5. **Configuración por Cliente**: Notificaciones específicas según el cliente

## Testing

Para probar el sistema:

1. Asegúrate de tener usuarios con rol "admin"
2. Registra dispositivos para esos administradores
3. Crea una cotización con estado "pending"
4. Cambia el estado a "approved" usando el endpoint
5. Verifica que las notificaciones lleguen a los dispositivos

## Troubleshooting

### No se envían notificaciones
- Verificar que existan usuarios con rol "admin"
- Confirmar que los administradores tengan dispositivos registrados
- Revisar que los tokens de dispositivo sean válidos
- Verificar logs de errores en la consola

### Notificaciones parciales
- Algunos tokens pueden ser inválidos o expirados
- Revisar logs para identificar tokens problemáticos
- Los dispositivos inactivos no reciben notificaciones