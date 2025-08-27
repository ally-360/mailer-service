# Sistema de Tracking de Emails

Este documento describe el sistema de tracking implementado para monitorear el envío, entrega y estado de todos los emails enviados por el servicio.

## 🏗️ Arquitectura

### Entidad Principal: `MailTracking`

La entidad `MailTracking` almacena información completa sobre cada email enviado:

#### Campos Principales
- **Identificación**: `id` (UUID), `messageId`, `externalId`
- **Destinatario**: `email`, `recipientName`
- **Evento**: `event` (tipo de evento que activó el email)
- **Estado**: `status` (pending, sent, delivered, read, failed, bounced, spam, unsubscribed)
- **Prioridad**: `priority` (low, normal, high, urgent)
- **Contenido**: `subject`, `template`, `context`, `metadata`
- **Timestamps**: `createdAt`, `sentAt`, `deliveredAt`, `readAt`, `failedAt`
- **Reintentos**: `retryCount`, `maxRetries`, `nextRetryAt`
- **Errores**: `errorMessage`, `errorCode`
- **Metadatos**: `provider`, `campaign`, `segment`, `tags`, `customFields`

#### Estados del Email

```typescript
enum MailStatus {
  PENDING = 'pending',        // Pendiente de envío
  SENT = 'sent',             // Enviado exitosamente
  DELIVERED = 'delivered',    // Entregado al destinatario
  READ = 'read',             // Leído por el destinatario
  FAILED = 'failed',          // Falló el envío
  BOUNCED = 'bounced',        // Rebotado por el servidor
  SPAM = 'spam',             // Marcado como spam
  UNSUBSCRIBED = 'unsubscribed' // Usuario se desuscribió
}
```

#### Prioridades

```typescript
enum MailPriority {
  LOW = 'low',           // Baja prioridad
  NORMAL = 'normal',     // Prioridad normal
  HIGH = 'high',         // Alta prioridad
  URGENT = 'urgent'      // Urgente
}
```

## 🔧 Servicios

### `MailTrackingService`

Servicio principal que maneja todas las operaciones de tracking:

#### Métodos Principales
- `createTracking()` - Crear nuevo registro de tracking
- `markAsSent()` - Marcar email como enviado
- `markAsDelivered()` - Marcar email como entregado
- `markAsRead()` - Marcar email como leído
- `markAsFailed()` - Marcar email como fallido
- `retryFailedEmail()` - Reintentar email fallido
- `getStats()` - Obtener estadísticas generales
- `cleanupOldRecords()` - Limpiar registros antiguos

### `MailTrackingRepository`

Repositorio que maneja las operaciones de base de datos:

#### Funcionalidades
- Consultas con filtros avanzados
- Estadísticas agregadas
- Búsquedas por múltiples criterios
- Paginación y ordenamiento
- Limpieza automática de registros

## 📊 Estadísticas y Reportes

### Estadísticas Generales
- Total de emails enviados
- Distribución por estado
- Tasa de entrega y lectura
- Emails fallidos y reintentos

### Estadísticas por Evento
- Conteo por tipo de evento
- Rendimiento por categoría
- Análisis temporal

### Estadísticas Diarias/Mensuales
- Volumen de envío por período
- Tendencias y patrones
- Comparativas temporales

## 🔄 Sistema de Reintentos

### Lógica de Reintentos
- **Máximo de reintentos**: 3 por defecto
- **Backoff exponencial**: Incremento progresivo del tiempo entre intentos
- **Tiempo máximo**: 5 minutos entre reintentos
- **Criterios**: Solo emails fallidos, no rebotados o spam

### Flujo de Reintento
1. Email falla → `status = 'failed'`
2. Se incrementa `retryCount`
3. Se calcula `nextRetryAt` con backoff exponencial
4. Proceso de limpieza identifica emails reenviables
5. Se resetea a `status = 'pending'` para reintento

## 🗄️ Base de Datos

### Tabla: `mail_tracking`

```sql
CREATE TABLE mail_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  event VARCHAR(100) NOT NULL,
  status mail_status NOT NULL DEFAULT 'pending',
  priority mail_priority NOT NULL DEFAULT 'normal',
  -- ... otros campos
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);
```

### Índices Optimizados
- **Búsqueda**: `email`, `event`, `status`, `priority`
- **Temporal**: `created_at`, `sent_at`, `failed_at`
- **JSONB**: `context`, `metadata`, `tags`, `custom_fields`
- **Combinados**: `email_event`, `status_created_at`

### Vistas Útiles
- `mail_tracking_stats` - Estadísticas agregadas
- `failed_emails` - Emails fallidos
- `retryable_emails` - Emails reenviables

## 🚀 Uso del Sistema

### Integración Automática

El tracking se integra automáticamente en el `MailService`:

```typescript
// Antes del envío
const tracking = await this.mailTrackingService.createTracking({
  email: 'usuario@ejemplo.com',
  event: EmailActionsEvent.UserRegistered,
  recipientName: 'Juan Pérez'
});

// Después del envío exitoso
await this.mailTrackingService.markAsSent(tracking.id, result.messageId);

// En caso de error
await this.mailTrackingService.markAsFailed(tracking.id, error.message);
```

### Consultas de Tracking

```typescript
// Obtener tracking por email
const tracking = await this.mailTrackingService.getTrackingByEmail('usuario@ejemplo.com');

// Obtener estadísticas
const stats = await this.mailTrackingService.getStats();

// Obtener emails fallidos
const failedEmails = await this.mailTrackingService.getFailedEmails();

// Obtener emails reenviables
const retryableEmails = await this.mailTrackingService.getRetryableEmails();
```

## 🔍 Monitoreo y Alertas

### Métricas Clave
- **Tasa de entrega**: `delivered / sent`
- **Tasa de lectura**: `read / delivered`
- **Tasa de fallos**: `failed / total`
- **Tiempo promedio de entrega**: `deliveredAt - sentAt`

### Alertas Recomendadas
- Tasa de fallos > 5%
- Tiempo de entrega > 5 minutos
- Acumulación de emails fallidos
- Errores de autenticación SMTP

## 🧹 Mantenimiento

### Limpieza Automática
- **Registros exitosos**: Eliminados después de 90 días
- **Registros fallidos**: Conservados para análisis
- **Función SQL**: `cleanup_old_mail_tracking(days_to_keep)`

### Optimización
- Índices en campos de búsqueda frecuente
- Particionamiento por fecha (para volúmenes altos)
- Archivo de logs antiguos

## 📈 Escalabilidad

### Consideraciones
- **Volumen alto**: Particionamiento por fecha
- **Consultas complejas**: Materialización de vistas
- **Retención**: Archivo automático de datos antiguos
- **Backup**: Inclusión en estrategia de backup

### Mejoras Futuras
- Webhooks para actualizaciones de estado
- Integración con servicios de tracking externos
- Dashboard de métricas en tiempo real
- Alertas automáticas por email/Slack
