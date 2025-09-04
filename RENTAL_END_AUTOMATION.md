# Automatización de Finalización de Renta

## Descripción

Este documento describe el sistema automatizado que cambia el estado de los equipos rentados de 'en_renta' a 'activo' cuando termina su período de renta.

## Funcionamiento

### Cron Job: `rentalEndChecker`

- **Frecuencia**: Cada hora (0 0 * * * *)
- **Zona horaria**: America/Mexico_City
- **Ubicación**: `src/scheduler/scheduler.service.ts`

### Proceso Automatizado

1. **Verificación Horaria**: El cron job se ejecuta cada hora para verificar equipos que deben finalizar su renta

2. **Obtención de Equipos Rentados**: Utiliza el método `findRentedEquipment()` del QuoteService para obtener todos los equipos actualmente en renta

3. **Evaluación de Fechas**: Para cada equipo rentado:
   - Compara la fecha actual con `rentalEndDate`
   - Si `rentalEndDate <= now`, el equipo debe cambiar de estado

4. **Actualización de Estado**: Cambia automáticamente el estado del equipo de 'en_renta' a 'activo'

5. **Logging**: Registra todas las operaciones para auditoría y debugging

## Cálculo de Fechas

### Fecha de Inicio de Renta (`rentalStartDate`)
- Se establece a las 12:00 AM (medianoche) del día de entrega
- Formato: `fecha_entrega` a las 00:00:00 hora de México

### Fecha de Fin de Renta (`rentalEndDate`)
- Se calcula como: `rentalStartDate + dias_renta`
- Se establece a las 12:00 AM (medianoche) del día de finalización
- Formato: `rentalStartDate + dias_renta` a las 00:00:00 hora de México

### Ejemplo
```
Fecha de entrega: 2025-09-02 16:58:00
Días de renta: 2

rentalStartDate: 2025-09-02 06:00:00.000Z (12:00 AM México)
rentalEndDate: 2025-09-04 06:00:00.000Z (12:00 AM México)
```

## Endpoint de Prueba

### `POST /quote/test-rental-end`

Permite probar manualmente el proceso de finalización de renta.

**Respuesta de ejemplo:**
```json
{
  "success": true,
  "message": "Rental end test completed. Updated 0 equipment to 'activo'",
  "equipmentProcessed": 0,
  "totalEquipment": 2,
  "results": [
    {
      "craneId": "6886c1af56288af6046d24d1",
      "rentalEndDate": "2025-09-04T06:00:00.000Z",
      "hoursUntilEnd": 30.64,
      "shouldEnd": false,
      "processed": false
    }
  ]
}
```

## Logs del Sistema

El cron job genera logs detallados:

```
🔄 Checking for equipment that should end rental period...
📋 Found 2 rented equipment to check
🏗️ Ending rental for crane 6886c1af56288af6046d24d1 - rental period expired
✅ Crane 6886c1af56288af6046d24d1 status updated to 'activo' - rental ended
🎉 Rental end check completed. Updated 1 equipment to 'activo'
```

## Consideraciones Técnicas

1. **Zona Horaria**: Todas las operaciones se realizan en zona horaria de México (America/Mexico_City)

2. **Precisión**: El cron job se ejecuta cada hora, por lo que puede haber hasta 59 minutos de retraso en el cambio de estado

3. **Manejo de Errores**: Cada actualización de equipo se maneja individualmente, si una falla, las demás continúan

4. **Logging**: Todos los eventos se registran para auditoría y debugging

5. **Idempotencia**: El proceso es seguro para ejecutar múltiples veces sin efectos secundarios

## Monitoreo

Para monitorear el funcionamiento:

1. **Logs del Servidor**: Revisar los logs del SchedulerService
2. **Endpoint de Prueba**: Usar `POST /quote/test-rental-end` para verificar el estado
3. **Endpoint de Equipos Rentados**: Usar `GET /quote/rented-equipment` para ver equipos activos

## Mantenimiento

El sistema es completamente automatizado y no requiere intervención manual. Sin embargo, se recomienda:

1. Monitorear los logs regularmente
2. Verificar que las fechas de renta se calculen correctamente
3. Probar el endpoint de prueba periódicamente