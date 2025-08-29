# Diagnóstico y Solución de Notificaciones de Cotizaciones

## Problema Reportado

Las notificaciones de cambio de estado de cotizaciones (de 'pending' a 'approved') no estaban llegando a los dispositivos, aunque:
- Las notificaciones múltiples manuales funcionan correctamente
- Las notificaciones de eventos funcionan perfectamente
- El endpoint de notificaciones múltiples responde correctamente

## Análisis Realizado

### Comparación con Sistema de Eventos

Se comparó la implementación de notificaciones de cotizaciones con el sistema de eventos que funciona correctamente:

**Sistema de Eventos (Funciona):**
- Usa `devicesService.getActiveTokens()` para obtener todos los tokens
- Usa `firebaseService.sendPushToMultiple()` para envío
- Tiene logging detallado con emojis
- Maneja errores específicamente

**Sistema de Cotizaciones (Problema):**
- Usa `devicesService.getActiveTokensByUserId()` para cada admin
- Usa `firebaseService.sendPushToMultiple()` para envío
- Tenía logging básico
- Manejo de errores limitado

## Mejoras Implementadas

### 1. Logging Detallado

Se agregó logging exhaustivo al método `sendApprovalNotification` para diagnosticar cada paso:

```typescript
// Ejemplos de logs agregados:
console.log(`🔔 Starting approval notification process for quote ID: ${quote._id}`);
console.log(`👥 Found ${admins.length} administrators`);
console.log(`📱 Found ${userTokens.length} active tokens for admin ${admin.email}`);
console.log(`📱 Total admin tokens collected: ${adminTokens.length}`);
console.log(`📊 Success: ${result.successCount}, Failures: ${result.failureCount}`);
```

### 2. Verificación de Inicialización

Se agregó logging al constructor del `QuoteService` para confirmar que Firebase y DevicesService están correctamente inyectados:

```typescript
constructor(...) {
  console.log('🔧 QuoteService initialized with FirebaseService and DevicesService');
}
```

### 3. Logging en switchStatus

Se agregó logging para confirmar cuándo se activa la notificación:

```typescript
if (currentQuote.status === 'pending' && status === 'aproved') {
  console.log(`🔄 Status changed from '${currentQuote.status}' to '${status}' - triggering approval notification`);
  await this.sendApprovalNotification(quote, userId);
} else {
  console.log(`ℹ️ Status change from '${currentQuote.status}' to '${status}' - no notification needed`);
}
```

### 4. Endpoint de Prueba

Se agregó un endpoint para probar las notificaciones manualmente:

```http
POST /quote/:id/test-notification?userId=optional
```

Este endpoint permite:
- Probar notificaciones sin cambiar el estado de la cotización
- Verificar el flujo completo de notificación
- Obtener logs detallados del proceso

### 5. Validaciones Adicionales

Se agregaron validaciones para:
- Verificar que existan administradores en el sistema
- Confirmar que se obtuvieron tokens de dispositivos
- Mostrar detalles de fallos en notificaciones

## Cómo Usar las Mejoras

### 1. Monitoreo en Tiempo Real

Al cambiar el estado de una cotización, ahora verás logs detallados como:

```
🔄 Status changed from 'pending' to 'aproved' - triggering approval notification
🔔 Starting approval notification process for quote ID: 507f1f77bcf86cd799439011
📋 Looking up user info for userId: 507f1f77bcf86cd799439012
✅ Found user: Juan Pérez
🏢 Client name: Empresa ABC
🏗️ Number of equipment: 3
👥 Fetching administrators...
👥 Found 2 administrators
📝 Notification message: Juan Pérez ha aprobado una cotización con 3 equipos para el cliente Empresa ABC
🔍 Getting tokens for admin: admin1@example.com (ID: 507f1f77bcf86cd799439013)
📱 Found 2 active tokens for admin admin1@example.com
🔍 Getting tokens for admin: admin2@example.com (ID: 507f1f77bcf86cd799439014)
📱 Found 1 active tokens for admin admin2@example.com
📱 Total admin tokens collected: 3
🚀 Sending notification to 3 devices...
✅ Notification sent successfully!
📊 Success: 3, Failures: 0
```

### 2. Prueba Manual

Para probar las notificaciones sin cambiar el estado:

```bash
POST /quote/507f1f77bcf86cd799439011/test-notification?userId=507f1f77bcf86cd799439012
```

### 3. Diagnóstico de Problemas

Si las notificaciones siguen sin funcionar, los logs te dirán exactamente dónde está el problema:

- **No hay administradores**: `⚠️ No administrators found in the system`
- **No hay tokens**: `⚠️ No device tokens found for administrators`
- **Error de Firebase**: `❌ Error sending multiple notifications: [detalles]`
- **Fallos parciales**: `⚠️ Some notifications failed: [detalles de fallos]`

## Próximos Pasos

1. **Ejecutar la aplicación** y monitorear los logs
2. **Probar el endpoint de prueba** con una cotización existente
3. **Cambiar el estado de una cotización** de 'pending' a 'aproved'
4. **Revisar los logs** para identificar cualquier problema restante

## Archivos Modificados

- `src/quote/quote.service.ts` - Logging detallado y validaciones
- `src/quote/quote.controller.ts` - Endpoint de prueba

## Comandos Útiles

```bash
# Compilar y verificar cambios
npm run build

# Ejecutar en modo desarrollo para ver logs
npm run start:dev

# Probar notificación manual
curl -X POST http://localhost:3000/quote/QUOTE_ID/test-notification?userId=USER_ID

# Cambiar estado de cotización
curl -X PUT http://localhost:3000/quote/switch/QUOTE_ID/aproved?userId=USER_ID
```

Con estas mejoras, ahora tendrás visibilidad completa del proceso de notificaciones y podrás identificar exactamente dónde está el problema si las notificaciones no llegan.