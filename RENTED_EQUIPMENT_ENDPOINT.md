# Endpoint de Equipos Rentados

## Descripción
Este endpoint retorna información detallada de todos los equipos que están actualmente rentados, incluyendo el cálculo de horas restantes hasta el final del período de renta.

## Endpoint
```
GET /quote/rented-equipment
```

## Funcionalidad
- Filtra cotizaciones con estado `active`
- Solo incluye equipos que tienen `entregado: true`
- Calcula las horas restantes basándose en:
  - Fecha de entrega del equipo
  - Días de renta contratados
  - Hora actual en zona horaria de CDMX

## Estructura de Respuesta

```json
[
  {
    "quoteId": "68b127e158cd432f90b1c669",
    "quoteName": "COT-20250828-854",
    "clientName": "Nombre del Cliente",
    "equipmentId": "68a4ec6208c68f7c3b13e1aa",
    "equipmentName": "Grúa Torre",
    "equipmentBrand": "Liebherr",
    "equipmentModel": "280 EC-H",
    "deliveryDate": "2025-08-31T16:18:00.000Z",
    "rentalDays": 7,
    "rentalEndDate": "2025-09-07T16:18:00.000Z",
    "hoursRemaining": 168,
    "price": 7500,
    "delivered": true,
    "status": "active"
  }
]
```

## Campos de Respuesta

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `quoteId` | string | ID de la cotización |
| `quoteName` | string | Nombre de la cotización |
| `clientName` | string | Nombre del cliente |
| `equipmentId` | string | ID del equipo |
| `equipmentName` | string | Nombre del equipo |
| `equipmentBrand` | string | Marca del equipo |
| `equipmentModel` | string | Modelo del equipo |
| `deliveryDate` | Date | Fecha de entrega del equipo |
| `rentalDays` | number | Días contratados de renta |
| `rentalEndDate` | Date | Fecha calculada de fin de renta |
| `hoursRemaining` | number | Horas restantes hasta el fin de la renta |
| `price` | number | Precio de la renta |
| `delivered` | boolean | Estado de entrega (siempre true en este endpoint) |
| `status` | string | Estado del equipo: 'active' o 'expired' |

## Lógica de Cálculo

### Fecha de Finalización
```
fecha_fin_renta = fecha_entrega + dias_renta
```

### Horas Restantes
```
horas_restantes = (fecha_fin_renta - hora_actual_cdmx) / 3600000
```

- Si el resultado es negativo, se retorna 0
- El resultado se redondea al entero más cercano

## Ordenamiento
Los resultados se ordenan por horas restantes de menor a mayor, priorizando los equipos que están próximos a vencer.

## Estados
- **active**: El equipo aún tiene tiempo de renta restante
- **expired**: El período de renta ha terminado (hoursRemaining = 0)

## Zona Horaria
Todos los cálculos se realizan usando la zona horaria de Ciudad de México (America/Mexico_City).

## Filtros Aplicados
1. Solo cotizaciones con estado `active`
2. Solo equipos con `entregado: true`
3. Solo equipos con fecha de entrega válida

## Casos de Uso
- Monitoreo de equipos rentados
- Alertas de vencimiento próximo
- Gestión de devoluciones
- Reportes de utilización de equipos