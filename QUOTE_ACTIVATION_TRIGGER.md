# Sistema de Activación Automática de Cotizaciones

## Resumen

Se ha implementado un trigger automático que se ejecuta cada 20 minutos para detectar cotizaciones que deben ser activadas basándose en las fechas de entrega de los equipos.

## 🚀 Funcionalidad Implementada

### Trigger Automático

El sistema ahora incluye un cron job que:

1. **Se ejecuta cada 20 minutos** (configurado con `@Cron('0 */20 * * * *')`)
2. **Busca cotizaciones con estado 'aproved'** que tengan fechas de entrega
3. **Identifica la fecha de entrega más temprana** de cada cotización
4. **Cambia el estado de 'aproved' a 'active'** cuando la fecha de entrega más temprana coincide con el día actual
5. **Actualiza el estado de todas las grúas** de la cotización a 'en_renta'

### Lógica del Proceso

```typescript
// El trigger se ejecuta cada 20 minutos
@Cron('0 */20 * * * *', {
  name: 'quoteActivationChecker',
  timeZone: 'America/Mexico_City'
})
```

#### Pasos del Proceso:

1. **Obtener cotizaciones aprobadas**: Busca todas las cotizaciones con estado 'aproved'
2. **Verificar fechas de entrega**: Para cada cotización, encuentra la fecha de entrega más temprana
3. **Comparar con fecha actual**: Si la fecha más temprana es hoy, procede con la activación
4. **Activar cotización**: Cambia el estado de 'aproved' a 'active'
5. **Actualizar grúas**: Cambia el estado de todas las grúas de la cotización a 'en_renta'

## 📋 Archivos Modificados

### 1. `src/scheduler/scheduler.module.ts`
- Agregado `CraneModule` a las importaciones para poder usar `CraneService`

### 2. `src/scheduler/scheduler.service.ts`
- Importado `CraneService` para actualizar estados de grúas
- Agregado método `checkQuoteActivation()` con el cron job
- Implementada lógica para encontrar la fecha de entrega más temprana
- Agregado logging detallado para monitoreo

### 3. `src/scheduler/scheduler.controller.ts`
- Agregado endpoint `POST /scheduler/test-quote-activation` para pruebas manuales

## 🔧 Endpoints Disponibles

### Prueba Manual del Trigger

```http
POST /scheduler/test-quote-activation
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Quote activation check executed manually"
}
```

## 📊 Logging y Monitoreo

El sistema incluye logging detallado para monitorear el proceso:

- `🔄 Checking quote activation based on delivery dates...` - Inicio del proceso
- `📋 Found X approved quotes to check` - Número de cotizaciones encontradas
- `🎯 Activating quote {id} - earliest delivery is today` - Cotización siendo activada
- `🏗️ Updated crane {id} status to 'en_renta'` - Grúa actualizada
- `✅ Quote {id} activated successfully` - Cotización activada exitosamente
- `🎉 Quote activation check completed. Activated X quotes, updated Y cranes` - Resumen final

## ⚙️ Configuración

### Frecuencia de Ejecución
- **Cada 20 minutos**: `0 */20 * * * *`
- **Zona horaria**: `America/Mexico_City`

### Estados Manejados
- **Cotización**: `aproved` → `active`
- **Grúa**: cualquier estado → `en_renta`

## 🧪 Pruebas

### Prueba Manual
1. Usar el endpoint `POST /scheduler/test-quote-activation`
2. Verificar los logs del servidor
3. Confirmar cambios en la base de datos

### Verificación de Funcionamiento
1. Crear una cotización con estado 'aproved'
2. Asignar una fecha de entrega para hoy
3. Esperar 20 minutos o ejecutar manualmente
4. Verificar que la cotización cambió a 'active'
5. Verificar que las grúas cambiaron a 'en_renta'

## 🔍 Consideraciones Importantes

1. **Fecha de comparación**: Se usa `toDateString()` para comparar solo día, mes y año (ignora hora)
2. **Fecha más temprana**: Si hay múltiples fechas de entrega, se usa la más temprana para determinar la activación
3. **Todas las grúas**: Cuando se activa una cotización, TODAS las grúas de esa cotización cambian a 'en_renta'
4. **Manejo de errores**: Errores individuales no detienen el proceso completo
5. **Logging**: Todos los eventos importantes se registran para auditoría

## 🚨 Manejo de Errores

El sistema incluye manejo robusto de errores:
- Errores al activar cotizaciones no afectan otras cotizaciones
- Errores al actualizar grúas individuales no detienen el proceso
- Todos los errores se registran en los logs para debugging

## 📈 Métricas

Cada ejecución reporta:
- Número de cotizaciones aprobadas encontradas
- Número de cotizaciones activadas
- Número de grúas actualizadas
- Tiempo de ejecución del proceso

Esto permite monitorear el rendimiento y efectividad del sistema.