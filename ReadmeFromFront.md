# Backend - Sistema de Gestión de Grúas Vilba

## Descripción General

Este documento describe las funcionalidades del backend necesarias para soportar el sistema de gestión de equipos rentados y notificaciones del sistema de grúas Vilba.

## Nuevas Funcionalidades Implementadas

### 1. Sistema de Equipos Rentados

#### Modificaciones en las Interfaces

**ICrane Interface:**

```typescript
interface ICrane {
  // ... campos existentes
  fechaEntrega?: Date; // Fecha de entrega del equipo
  fechaInicioRenta?: Date; // Fecha de inicio de la renta
  tiempoRentaHoras?: number; // Duración de la renta en horas
  clienteRentaId?: string; // ID del cliente que renta el equipo
  cotizacionId?: string; // ID de la cotización asociada
}
```

**IQuote Interface:**

```typescript
interface IQuote {
  // ... campos existentes
  cranes: {
    crane: string;
    dias: number;
    precio: number;
    fechaEntrega?: Date; // Fecha de entrega específica por equipo
    horasRenta?: number; // Horas de renta por equipo
    fechaInicioRenta?: Date; // Fecha de inicio de renta por equipo
  }[];
}
```

#### Endpoints Requeridos

##### 1. Actualizar Fechas de Entrega de Cotización

```http
PUT /api/quote/delivery-dates/:quoteId
Content-Type: application/json

{
  "deliveryDates": [
    {
      "craneId": "string",
      "craneName": "string",
      "fechaEntrega": "2024-01-15T10:00:00.000Z",
      "horasRenta": 24,
      "fechaInicioRenta": "2024-01-15T08:00:00.000Z"
    }
  ]
}
```

**Respuesta:**

```json
{
  "success": true,
  "message": "Fechas de entrega actualizadas correctamente",
  "data": {
    "quoteId": "string",
    "updatedCranes": []
  }
}
```

##### 2. Obtener Equipos Rentados

```http
GET /api/crane/rented
```

**Respuesta:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "name": "string",
      "estado": "en_renta",
      "fechaEntrega": "2024-01-15T10:00:00.000Z",
      "fechaInicioRenta": "2024-01-15T08:00:00.000Z",
      "tiempoRentaHoras": 24,
      "clienteRentaId": "string",
      "cotizacionId": "string",
      "tiempoRestante": 18.5
    }
  ]
}
```

##### 3. Marcar Equipo como Entregado

```http
PUT /api/crane/delivered/:craneId
Content-Type: application/json

{
  "deliveredAt": "2024-01-15T16:00:00.000Z"
}
```

##### 4. Extender Tiempo de Renta

```http
PUT /api/crane/extend-rental/:craneId
Content-Type: application/json

{
  "additionalHours": 12
}
```

### 2. Sistema de Notificaciones

#### Tipos de Notificaciones

1. **Notificación de Vencimiento Próximo**

   - Se envía cuando quedan 2 horas para el vencimiento
   - Se envía cuando queda 1 hora para el vencimiento

2. **Notificación de Vencimiento**

   - Se envía cuando el tiempo de renta ha expirado

3. **Notificación de Sobrepaso**
   - Se envía cada hora después del vencimiento

#### Endpoint de Notificaciones

```http
POST /api/notifications/send
Content-Type: application/json

{
  "type": "rental_expiring" | "rental_expired" | "rental_overdue",
  "craneId": "string",
  "clientId": "string",
  "message": "string",
  "scheduledFor": "2024-01-15T14:00:00.000Z"
}
```

### 3. Lógica de Estados de Equipos

#### Estados Posibles

- `disponible`: Equipo disponible para renta
- `en_renta`: Equipo actualmente rentado
- `mantenimiento`: Equipo en mantenimiento
- `fuera_servicio`: Equipo fuera de servicio

#### Transiciones de Estado

1. **Cotización Aprobada → Equipo en Renta**

   ```
   disponible → en_renta
   ```

   - Se actualiza el estado del equipo
   - Se configuran las fechas de entrega y renta
   - Se programa las notificaciones

2. **Equipo Entregado → Equipo Disponible**
   ```
   en_renta → disponible
   ```
   - Se limpia la información de renta
   - Se cancela las notificaciones pendientes

### 4. Cálculo de Tiempo Restante

#### Fórmula

```javascript
function calcularTiempoRestante(fechaInicioRenta, tiempoRentaHoras) {
  const ahora = new Date();
  const inicioRenta = new Date(fechaInicioRenta);
  const tiempoTranscurrido = (ahora - inicioRenta) / (1000 * 60 * 60); // en horas
  const tiempoRestante = tiempoRentaHoras - tiempoTranscurrido;

  return Math.max(0, tiempoRestante);
}
```

### 5. Programación de Notificaciones

#### Cron Jobs Recomendados

1. **Verificación cada 30 minutos**

   ```cron
   */30 * * * *
   ```

   - Verifica equipos próximos a vencer
   - Envía notificaciones de alerta

2. **Verificación cada hora**
   ```cron
   0 * * * *
   ```
   - Verifica equipos vencidos
   - Envía notificaciones de sobrepaso

#### Lógica de Notificaciones

```javascript
function programarNotificaciones(equipo) {
  const { fechaInicioRenta, tiempoRentaHoras } = equipo;
  const fechaVencimiento = new Date(fechaInicioRenta);
  fechaVencimiento.setHours(fechaVencimiento.getHours() + tiempoRentaHoras);

  // Notificación 2 horas antes
  const notificacion2h = new Date(fechaVencimiento);
  notificacion2h.setHours(notificacion2h.getHours() - 2);

  // Notificación 1 hora antes
  const notificacion1h = new Date(fechaVencimiento);
  notificacion1h.setHours(notificacion1h.getHours() - 1);

  // Notificación al vencimiento
  const notificacionVencimiento = fechaVencimiento;

  // Programar notificaciones
  scheduleNotification(notificacion2h, 'rental_expiring_2h', equipo);
  scheduleNotification(notificacion1h, 'rental_expiring_1h', equipo);
  scheduleNotification(notificacionVencimiento, 'rental_expired', equipo);
}
```

### 6. Manejo de Errores

#### Códigos de Error Estándar

- `400`: Datos de entrada inválidos
- `404`: Recurso no encontrado
- `409`: Conflicto (ej: equipo ya rentado)
- `500`: Error interno del servidor

#### Estructura de Respuesta de Error

```json
{
  "success": false,
  "error": {
    "code": "CRANE_NOT_AVAILABLE",
    "message": "El equipo no está disponible para renta",
    "details": {
      "craneId": "string",
      "currentStatus": "en_renta"
    }
  }
}
```

### 7. Logging y Auditoría

#### Eventos a Registrar

- Cambios de estado de equipos
- Configuración de fechas de entrega
- Extensiones de tiempo de renta
- Entregas de equipos
- Envío de notificaciones

#### Formato de Log

```json
{
  "timestamp": "2024-01-15T10:00:00.000Z",
  "level": "info",
  "event": "crane_status_changed",
  "data": {
    "craneId": "string",
    "previousStatus": "disponible",
    "newStatus": "en_renta",
    "userId": "string",
    "quoteId": "string"
  }
}
```

### 8. Consideraciones de Seguridad

- Validar permisos de usuario antes de cambiar estados
- Verificar que el usuario tenga acceso al equipo/cotización
- Registrar todas las acciones críticas
- Implementar rate limiting en endpoints de notificaciones

### 9. Configuración de Base de Datos

#### Índices Recomendados

```javascript
// Colección de grúas
db.cranes.createIndex({ estado: 1 });
db.cranes.createIndex({ fechaEntrega: 1 });
db.cranes.createIndex({ clienteRentaId: 1 });
db.cranes.createIndex({ cotizacionId: 1 });

// Colección de cotizaciones
db.quotes.createIndex({ status: 1 });
db.quotes.createIndex({ 'cranes.fechaEntrega': 1 });
```

### 10. Testing

#### Casos de Prueba Críticos

1. Cambio de estado de cotización a "aprobada"
2. Configuración de fechas de entrega
3. Cálculo de tiempo restante
4. Programación de notificaciones
5. Extensión de tiempo de renta
6. Marcado de equipo como entregado

#### Datos de Prueba

```javascript
const testData = {
  quote: {
    _id: 'test_quote_1',
    name: 'Cotización de Prueba',
    status: 'aproved',
    cranes: [
      {
        crane: 'test_crane_1',
        dias: 1,
        precio: 500,
        fechaEntrega: new Date(),
        horasRenta: 24,
        fechaInicioRenta: new Date(),
      },
    ],
  },
  crane: {
    _id: 'test_crane_1',
    name: 'Grúa de Prueba',
    estado: 'disponible',
    category: 'pesado',
  },
};
```

## Implementación Recomendada

1. **Fase 1**: Implementar endpoints básicos de gestión de equipos rentados
2. **Fase 2**: Agregar sistema de notificaciones
3. **Fase 3**: Implementar cron jobs para verificaciones automáticas
4. **Fase 4**: Agregar logging y auditoría completa
5. **Fase 5**: Optimización y testing exhaustivo

## Monitoreo y Métricas

### Métricas Importantes

- Número de equipos rentados actualmente
- Tiempo promedio de renta
- Frecuencia de extensiones de tiempo
- Tasa de notificaciones enviadas vs. leídas
- Equipos con sobrepaso de tiempo

### Alertas del Sistema

- Equipos con más de 24 horas de sobrepaso
- Fallos en envío de notificaciones
- Equipos sin fecha de entrega configurada
- Inconsistencias en estados de equipos

Este README proporciona una guía completa para la implementación del backend que soporta el sistema de gestión de equipos rentados y notificaciones.
