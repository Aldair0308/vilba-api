# Sistema de Notificaciones de Entrega

Este documento describe el sistema de notificaciones automáticas para recordatorios de entrega de equipos implementado en el API de Vilba.

## Características Implementadas

### 1. Monitoreo Automático
- ✅ Detecta cotizaciones en estado "aprobado" y "activo"
- ✅ Verifica la presencia del campo "fecha_entrega" en los equipos
- ✅ Ejecuta verificaciones diarias a las 10:00 AM

### 2. Lógica de Notificaciones
- ✅ **Primera notificación**: 1 día antes de la fecha de entrega
- ✅ **Segunda notificación**: El mismo día de la entrega
- ✅ Envío automático a las 10:00 AM todos los días

### 3. Configuración Técnica
- ✅ Implementación con modificaciones mínimas de código
- ✅ Integración con el sistema existente de Firebase
- ✅ Uso del scheduler existente de NestJS

## Archivos Modificados

### 1. QuoteService (`src/quote/quote.service.ts`)
```typescript
// Nuevo método agregado
async findQuotesWithDeliveryDates(): Promise<Quote[]> {
  return this.quoteModel
    .find({
      status: { $in: ['aproved', 'active'] },
      'cranes.fecha_entrega': { $exists: true, $ne: null }
    })
    .populate('cranes')
    .exec();
}
```

### 2. SchedulerService (`src/scheduler/scheduler.service.ts`)
```typescript
// Nuevo cron job agregado
@Cron('0 10 * * *', {
  name: 'deliveryNotificationChecker'
})
async checkDeliveryNotifications() {
  // Lógica de verificación y envío de notificaciones
}
```

### 3. Módulos Actualizados
- `QuoteModule`: Exporta QuoteService
- `SchedulerModule`: Importa QuoteModule

## Funcionamiento del Sistema

### Flujo de Ejecución Diario (10:00 AM)

1. **Consulta de Datos**
   - Busca cotizaciones con estado "aproved" o "active"
   - Filtra solo las que tienen equipos con fecha_entrega definida

2. **Análisis de Fechas**
   - Compara fecha_entrega con la fecha actual
   - Identifica entregas para "mañana" y "hoy"

3. **Envío de Notificaciones**
   - Obtiene tokens de dispositivos activos
   - Envía notificaciones push via Firebase
   - Registra resultados en logs

### Tipos de Notificaciones

#### Recordatorio (1 día antes)
- **Título**: "📅 Recordatorio: Entrega Mañana"
- **Mensaje**: "{Equipo} debe ser entregado mañana ({Fecha}) - Cotización: {Nombre}"

#### Notificación del día
- **Título**: "🚛 Entrega Hoy"
- **Mensaje**: "{Equipo} debe ser entregado hoy ({Fecha}) - Cotización: {Nombre}"

## Ejemplo de Uso

### Cotización con Fecha de Entrega
```json
{
  "name": "Proyecto ABC",
  "status": "aproved",
  "cranes": [
    {
      "crane": "507f1f77bcf86cd799439013",
      "dias": 5,
      "precio": 2500,
      "fecha_entrega": "2024-02-15T08:00:00.000Z"
    }
  ]
}
```

### Cronograma de Notificaciones
- **14 de febrero a las 10:00 AM**: Recordatorio de entrega para mañana
- **15 de febrero a las 10:00 AM**: Notificación de entrega hoy

## Logs del Sistema

El sistema genera logs detallados:

```
[SchedulerService] Checking delivery notifications...
[SchedulerService] Delivery reminder sent for Grúa ABC (tomorrow): Success: 5, Failures: 0
[SchedulerService] Delivery notifications check completed. Sent 3 notifications
```

## Configuración del Cron Job

- **Expresión**: `'0 10 * * *'`
- **Frecuencia**: Todos los días a las 10:00 AM
- **Nombre**: `deliveryNotificationChecker`

## Requisitos del Sistema

### Dependencias
- Firebase configurado y funcionando
- Dispositivos registrados con tokens activos
- Cotizaciones con campo fecha_entrega poblado

### Estados de Cotización Monitoreados
- `aproved`: Cotizaciones aprobadas
- `active`: Cotizaciones activas

## Manejo de Errores

- Logs detallados de errores
- Continuación del proceso aunque falle una notificación
- Validación de datos antes del envío

## Escalabilidad

- Sistema diseñado para manejar múltiples cotizaciones
- Envío eficiente a múltiples dispositivos
- Mínimo impacto en rendimiento del sistema

## Monitoreo

Para monitorear el sistema:

1. **Logs de aplicación**: Revisar logs del SchedulerService
2. **Firebase Console**: Verificar estadísticas de notificaciones
3. **Base de datos**: Consultar cotizaciones con fechas de entrega

## Mantenimiento

- El sistema es autónomo y no requiere intervención manual
- Las notificaciones se envían automáticamente según las fechas configuradas
- Los logs permiten auditar el funcionamiento del sistema