# Ejemplo de Uso del Campo fecha_entrega

Este documento muestra cómo utilizar el nuevo campo `fecha_entrega` en las cotizaciones.

## Estructura del Campo

El campo `fecha_entrega` se ha agregado al objeto `QuoteCraneDto` dentro de las cotizaciones:

```typescript
class QuoteCraneDto {
  crane: string;           // ID del equipo (obligatorio)
  dias: number;           // Días de renta
  precio: number;         // Precio
  fecha_entrega?: string; // Fecha de entrega (opcional, formato ISO)
}
```

## Ejemplos de Uso

### 1. Crear Cotización con Fecha de Entrega

```json
{
  "name": "Cotización Proyecto ABC",
  "zone": "Norte",
  "clientId": "507f1f77bcf86cd799439011",
  "fileId": "507f1f77bcf86cd799439012",
  "status": "pending",
  "cranes": [
    {
      "crane": "507f1f77bcf86cd799439013",
      "dias": 5,
      "precio": 2500,
      "fecha_entrega": "2024-02-15T08:00:00.000Z"
    },
    {
      "crane": "507f1f77bcf86cd799439014",
      "dias": 3,
      "precio": 1800
      // fecha_entrega no especificada (null)
    }
  ],
  "responsibleId": "507f1f77bcf86cd799439015"
}
```

### 2. Actualizar Solo la Fecha de Entrega

```json
{
  "cranes": [
    {
      "crane": "507f1f77bcf86cd799439013",
      "dias": 5,
      "precio": 2500,
      "fecha_entrega": "2024-02-20T10:30:00.000Z"
    }
  ]
}
```

### 3. Remover Fecha de Entrega (establecer como null)

```json
{
  "cranes": [
    {
      "crane": "507f1f77bcf86cd799439013",
      "dias": 5,
      "precio": 2500,
      "fecha_entrega": null
    }
  ]
}
```

## Validaciones

- **Formato**: El campo acepta fechas en formato ISO 8601 (string)
- **Opcional**: El campo puede ser omitido o establecido como null
- **Independiente**: Se puede actualizar sin afectar otros campos del equipo

## Casos de Uso

1. **Planificación de Entregas**: Especificar cuándo se entregará cada equipo
2. **Seguimiento de Cronograma**: Monitorear fechas de entrega programadas
3. **Gestión Flexible**: Algunos equipos pueden tener fecha definida, otros no
4. **Actualizaciones Parciales**: Modificar solo las fechas sin tocar precios o días

## Endpoints Afectados

- `POST /quote` - Crear cotización con fechas de entrega
- `PUT /quote/:id` - Actualizar cotización incluyendo fechas de entrega
- `GET /quote/:id` - Obtener cotización con fechas de entrega incluidas

## Notas Importantes

- El campo es completamente opcional y no afecta la funcionalidad existente
- Las cotizaciones existentes seguirán funcionando sin modificaciones
- El campo se almacena como `Date` en MongoDB pero se valida como `string` en el DTO
- La conversión de string a Date se maneja automáticamente por Mongoose