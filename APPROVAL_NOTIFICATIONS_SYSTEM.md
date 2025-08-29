# Sistema de Notificaciones de Aprobación de Cotizaciones

## Descripción

Este sistema envía automáticamente notificaciones a todos los usuarios con rol "admin" cuando una cotización cambia de estado "pending" a "aproved".

## Funcionalidades

### Detección Automática de Aprobaciones
- Monitorea cambios de estado en las cotizaciones
- Detecta específicamente el cambio de "pending" a "aproved"
- Envía notificaciones solo cuando ocurre esta transición específica

### Mensaje de Notificación
El mensaje incluye la siguiente información:
```
{user_name} ha aprobado una cotización con {num_equipment} equipo(s) para el cliente {client_name}
```

### Destinatarios
- Todos los usuarios con rol "admin" en el sistema
- Las notificaciones se envían individualmente a cada administrador

## Implementación Técnica

### Archivos Modificados

#### 1. `src/users/users.service.ts`
- **Nuevo método**: `findAdmins()`
- **Función**: Obtiene todos los usuarios con rol "admin"

#### 2. `src/quote/quote.service.ts`
- **Método modificado**: `switchStatus(id, status, userId?)`
- **Nuevo método**: `sendApprovalNotification(quote, userId?)`
- **Funcionalidades**:
  - Detecta cambios de estado de "pending" a "aproved"
  - Obtiene información del usuario que aprobó
  - Obtiene información del cliente
  - Cuenta el número de equipos
  - Envía notificaciones a administradores

#### 3. `src/quote/quote.controller.ts`
- **Endpoint modificado**: `PUT /quote/switch/:id/:status?userId=xxx`
- **Parámetro nuevo**: `userId` (query parameter opcional)
- **Función**: Permite identificar quién aprobó la cotización

#### 4. `src/quote/quote.module.ts`
- **Importaciones agregadas**: `UsersModule`, `ClientModule`, `FirebaseModule`
- **Función**: Permite la inyección de dependencias necesarias

#### 5. `src/client/client.module.ts`
- **Exportación agregada**: `ClientService`
- **Función**: Hace disponible el servicio para otros módulos

## Uso del Sistema

### Endpoint para Cambio de Estado
```http
PUT /quote/switch/{quote_id}/aproved?userId={user_id}
```

### Ejemplo de Uso
```http
PUT /quote/switch/507f1f77bcf86cd799439011/aproved?userId=507f1f77bcf86cd799439012
```

### Respuesta del Sistema
1. Cambia el estado de la cotización a "aproved"
2. Detecta el cambio de "pending" a "aproved"
3. Obtiene información del usuario aprobador
4. Obtiene información del cliente
5. Cuenta los equipos en la cotización
6. Busca todos los administradores
7. Envía notificación a cada administrador

## Estructura del Mensaje

### Información Incluida
- **Título**: "Cotización Aprobada"
- **Usuario**: Nombre del usuario que aprobó (o "Usuario" si no se especifica)
- **Número de equipos**: Cantidad de equipos en la cotización
- **Cliente**: Nombre del cliente asociado a la cotización

### Ejemplo de Mensaje
```
Juan Pérez ha aprobado una cotización con 3 equipos para el cliente Constructora ABC
```

## Manejo de Errores

### Errores Controlados
- Usuario no encontrado: Se usa "Usuario" como nombre por defecto
- Cliente no encontrado: Se usa "Cliente desconocido" como nombre por defecto
- Error en envío de notificación: Se registra en logs pero no interrumpe el proceso
- Firebase no inicializado: Se registra el error en logs

### Logs de Sistema
- Errores de envío de notificaciones individuales
- Errores generales del sistema de notificaciones
- Información de depuración para troubleshooting

## Consideraciones Importantes

### Tokens de Dispositivo
- Actualmente se usa el email como token temporal
- En producción, se debe implementar un sistema de tokens reales
- Los administradores deben tener tokens de dispositivo válidos

### Rendimiento
- Las notificaciones se envían de forma asíncrona
- No bloquean el proceso de cambio de estado
- Errores en notificaciones no afectan la funcionalidad principal

### Escalabilidad
- El sistema maneja múltiples administradores eficientemente
- Cada notificación se envía individualmente
- Manejo robusto de errores para evitar fallos en cascada

## Monitoreo y Mantenimiento

### Logs a Revisar
- Errores de envío de notificaciones
- Problemas de inicialización de Firebase
- Errores de obtención de datos de usuarios/clientes

### Métricas Recomendadas
- Número de notificaciones enviadas exitosamente
- Tasa de errores en envío de notificaciones
- Tiempo de respuesta del sistema de notificaciones

## Próximas Mejoras

1. **Sistema de Tokens Real**: Implementar gestión de tokens de dispositivo
2. **Plantillas de Mensajes**: Sistema configurable de plantillas
3. **Notificaciones por Email**: Respaldo vía email para administradores
4. **Dashboard de Notificaciones**: Panel de control para monitoreo
5. **Configuración de Roles**: Permitir configurar qué roles reciben notificaciones