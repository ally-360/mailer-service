# Servicio de Correo Electrónico

Este módulo proporciona funcionalidades para el envío de correos electrónicos utilizando plantillas Handlebars y un sistema de estrategias para manejar diferentes tipos de eventos.

## Características

- Envío de correos electrónicos mediante plantillas Handlebars
- Sistema de estrategias para diferentes tipos de eventos
- Soporte para microservicios mediante MessagePattern
- Plantillas predefinidas para eventos de autenticación, inventario y reportes

## Controlador de MessagePattern

El controlador principal (`MailController`) escucha mediante `MessagePattern` para recibir solicitudes de envío de correos electrónicos.

### Patrón de Entrada Principal

```typescript
@MessagePattern('mail.send')
async sendEmail(@Payload() payload: SendEmailDto)
```

### Estructura del Payload

```typescript
interface SendEmailDto {
  email: string;                    // Email del destinatario
  event: EmailActionsEvent;         // Tipo de evento a activar
  data?: Record<string, any>;       // Datos adicionales según el evento
}
```

### Tipos de Eventos Soportados

#### Eventos de Autenticación
- `user.registered` - Correo de bienvenida
- `user.verify` - Verificación de cuenta
- `user.req.reset` - Solicitud de restablecimiento de contraseña
- `user.reset.password.success` - Confirmación de restablecimiento
- `user.account.deactivated` - Cuenta desactivada

#### Eventos de Inventario
- `inventory.low` - Stock bajo
- `inventory.out` - Stock agotado
- `inventory.transfer.complete` - Transferencia completada

#### Eventos de Reportes
- `report.daily.summary` - Resumen diario
- `report.monthly.summary` - Resumen mensual
- `report.custom.generated` - Reporte personalizado

### Ejemplos de Uso

#### Envío de Correo de Bienvenida
```typescript
// Payload para correo de bienvenida
{
  "email": "usuario@ejemplo.com",
  "event": "user.registered"
}
```

#### Envío de Correo de Verificación
```typescript
// Payload para correo de verificación
{
  "email": "usuario@ejemplo.com",
  "event": "user.verify",
  "data": {
    "name": "Juan Pérez",
    "activationLink": "https://ejemplo.com/activate?token=abc123"
  }
}
```

#### Envío de Notificación de Stock Bajo
```typescript
// Payload para notificación de stock bajo
{
  "email": "admin@ejemplo.com",
  "event": "inventory.low",
  "data": {
    "product": "Producto A",
    "quantity": 5,
    "location": "Almacén Principal"
  }
}
```

### Patrón de Salud

```typescript
@MessagePattern('mail.health')
async healthCheck()
```

Retorna el estado de salud del servicio.

## Sistema de Estrategias

El módulo utiliza el patrón Strategy para manejar diferentes tipos de eventos:

- `AuthEmailStrategy` - Maneja eventos de autenticación
- `InventoryEmailStrategy` - Maneja eventos de inventario
- `ReportEmailStrategy` - Maneja eventos de reportes

Cada estrategia implementa la interfaz `IEmailStrategy` y se registra en el `EmailStrategyContext`.

## Configuración

El módulo se configura automáticamente con:

- Configuración SMTP desde variables de entorno
- Directorio de plantillas Handlebars
- Directorio de parciales para reutilización de componentes
- Adaptador Handlebars para renderizado de plantillas

## Dependencias

- `@nestjs-modules/mailer` - Para el envío de correos
- `@nestjs/microservices` - Para el patrón MessagePattern
- `handlebars` - Para el motor de plantillas