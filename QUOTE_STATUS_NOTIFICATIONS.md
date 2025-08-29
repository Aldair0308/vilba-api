# Sistema de Notificaciones de Cambio de Estado de Cotizaciones

## Resumen

Este documento describe la implementación del sistema de notificaciones automáticas que se envían a los administradores cuando cambia el estado de una cotización.

## 🚀 Funcionalidad Implementada

### Notificaciones Automáticas

Cuando se cambia el estado de una cotización (mediante el endpoint `PUT /quote/:id/switch-status`), el sistema ahora:

1. **Identifica el cambio de estado**: Compara el estado anterior con el nuevo estado
2. **Busca administradores**: Obtiene todos los usuarios con rol de administrador
3. **Obtiene tokens de dispositivos**: Busca los dispositivos registrados de cada administrador
4. **Envía notificaciones push**: Utiliza Firebase para enviar notificaciones a todos los dispositivos de los administradores

### Estados Soportados

El sistema mapea los estados técnicos a texto legible:

- `pending` → "Pendiente"
- `aproved` → "Aprobada"
- `rejected` → "Rechazada"
- `active` → "Activa"
- `completed` → "Completada"

## 📋 Archivos Modificados

### 1. `src/quote/quote.service.ts`

#### Método `switchStatus` (Modificado)
- Agregado logging para cambios de estado
- Agregada llamada al nuevo método de notificación a administradores

#### Nuevo Método `sendStatusChangeNotificationToAdmins`
- Obtiene información del usuario que realizó el cambio
- Obtiene información del cliente de la cotización
- Busca todos los administradores del sistema
- Obtiene tokens de dispositivos de los administradores
- Envía notificaciones push con información detallada
- Incluye logging detallado para debugging

### 2. `src/quote/quote.controller.ts`

#### Nuevo Endpoint de Prueba
```http
POST /quote/:id/test-status-notification
```

**Parámetros de Query:**
- `previousStatus` (opcional): Estado anterior (default: "pending")
- `newStatus` (opcional): Nuevo estado (default: "aproved")
- `userId` (opcional): ID del usuario que realiza el cambio

## 📱 Formato de Notificación

### Título
```
📋 Estado de Cotización Actualizado
```

### Cuerpo del Mensaje
```
La cotización "[NOMBRE_COTIZACIÓN]" del cliente [NOMBRE_CLIENTE] cambió de [ESTADO_ANTERIOR] a [NUEVO_ESTADO]. Actualizado por: [NOMBRE_USUARIO]
```

### Ejemplo
```
Título: 📋 Estado de Cotización Actualizado
Cuerpo: La cotización "Proyecto Torre Central" del cliente Constructora ABC cambió de Pendiente a Aprobada. Actualizado por: Juan Pérez
```

## 🔧 Configuración y Uso

### Uso Normal

Las notificaciones se envían automáticamente cuando se cambia el estado de una cotización:

```http
PUT /quote/[ID_COTIZACIÓN]/switch-status
Content-Type: application/json

{
  "status": "aproved",
  "userId": "[ID_USUARIO_OPCIONAL]"
}
```

### Pruebas Manuales

Para probar las notificaciones sin cambiar realmente el estado:

```http
POST /quote/[ID_COTIZACIÓN]/test-status-notification?previousStatus=pending&newStatus=aproved&userId=[ID_USUARIO]
```

## 📊 Logging y Monitoreo

El sistema incluye logging detallado con emojis para facilitar el debugging:

- 🔔 Inicio del proceso de notificación
- 📋 Búsqueda de información del usuario
- 🏢 Información del cliente
- 👥 Búsqueda de administradores
- 📱 Obtención de tokens de dispositivos
- 📤 Envío de notificaciones
- ✅ Éxito en el envío
- ⚠️ Advertencias (fallos parciales)
- ❌ Errores

### Ejemplo de Logs
```
🔔 Starting status change notification process for quote ID: 507f1f77bcf86cd799439011
📋 Looking up user info for userId: 507f1f77bcf86cd799439012
✅ Found user: Juan Pérez
🏢 Client name: Constructora ABC
👥 Fetching administrators...
👥 Found 3 administrators
📱 Getting device tokens for admin IDs: 507f1f77bcf86cd799439013, 507f1f77bcf86cd799439014, 507f1f77bcf86cd799439015
📱 Found 5 device tokens for administrators
📤 Sending notification to 5 devices
✅ Status change notification sent successfully!
📊 Success: 5, Failures: 0
```

## 🔍 Troubleshooting

### Problemas Comunes

1. **No se envían notificaciones**
   - Verificar que existan administradores en el sistema
   - Verificar que los administradores tengan dispositivos registrados
   - Revisar los logs para identificar errores específicos

2. **Fallos parciales en el envío**
   - Algunos tokens pueden estar expirados o ser inválidos
   - Firebase puede rechazar algunos tokens
   - Los logs mostrarán qué notificaciones fallaron

3. **Error al obtener información del usuario**
   - Verificar que el `userId` proporcionado sea válido
   - El sistema continuará funcionando con "Usuario" como nombre por defecto

### Verificación de Funcionamiento

1. **Verificar administradores:**
   ```http
   GET /users?role=admin
   ```

2. **Verificar dispositivos de un administrador:**
   ```http
   GET /devices/user/[ID_ADMINISTRADOR]
   ```

3. **Probar notificación:**
   ```http
   POST /quote/[ID_COTIZACIÓN]/test-status-notification
   ```

## 🔄 Flujo Completo

1. **Usuario cambia estado de cotización** → `PUT /quote/:id/switch-status`
2. **Sistema detecta cambio** → Compara estado anterior vs nuevo
3. **Busca administradores** → `usersService.findAdmins()`
4. **Obtiene dispositivos** → `devicesService.findByUserId()` para cada admin
5. **Prepara mensaje** → Formatea título y cuerpo con información relevante
6. **Envía notificaciones** → `firebaseService.sendPushToMultiple()`
7. **Registra resultado** → Logs de éxito/fallo

## 📈 Beneficios

- **Notificación inmediata**: Los administradores reciben notificaciones en tiempo real
- **Información completa**: Incluye nombre de cotización, cliente, estados y usuario responsable
- **Logging detallado**: Facilita el debugging y monitoreo
- **Pruebas fáciles**: Endpoint dedicado para testing
- **Escalable**: Funciona con cualquier número de administradores y dispositivos

---

**¡El sistema de notificaciones de cambio de estado está listo para usar!** 🎉