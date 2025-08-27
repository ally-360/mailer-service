export const MailTemplates = {
  /** Correo enviado tras el registro exitoso del usuario. */
  REGISTER_SUCCESS: {
    key: 'auth.register.success',
    subject: '🎉 ¡Bienvenido a Ally360!',
    template: 'auth/register-success',
    description: 'Correo enviado tras el registro exitoso del usuario.',
  },

  /** Correo enviado al usuario para verificar su cuenta. Después de registrarse, el usuario recibe un enlace de activación. */
  ACTIVATION_LINK: {
    key: 'auth.activation.link',
    subject: '🔐 Activa tu cuenta.',
    template: 'auth/activation-account',
    description: 'Correo enviado al usuario para verificar su cuenta.',
  },

  /** Correo enviado al usuario para solicitar el restablecimiento de su contraseña. */
  REQ_RESET_PASSWORD: {
    key: 'auth.req.reset.password',
    subject: '🔒 Reestablece tu contraseña.',
    template: 'auth/req-reset-password',
    description:
      'Correo enviado al usuario para solicitar el restablecimiento de su contraseña.',
  },

  /** Correo enviado al usuario para notificarle que su contraseña ha sido cambiada. */
  PASSWORD_RESET_SUCCESS: {
    key: 'auth.password.reset.success',
    subject: '🔑 Tu contraseña ha sido cambiada.',
    template: 'auth/password-reset-success',
    description:
      'Correo enviado al usuario para notificarle que su contraseña ha sido cambiada.',
  },

  /** Correo enviado al usuario para notificarle que su cuenta ha sido desactivada. */
  ACCOUNT_DEACTIVATED: {
    key: 'auth.account.deactivated',
    subject: '⚠️ Tu cuenta ha sido desactivada.',
    template: 'auth/account-deactivated',
    description:
      'Correo enviado al usuario para notificarle que su cuenta ha sido desactivada.',
  },

  /** Correo enviado al administrador cuando el inventario de un producto está bajo. */
  INVENTORY_LOW: {
    key: 'inventory.low',
    subject: '🚨 Alerta de inventario bajo',
    template: 'inventory/stock-low',
    description:
      'Correo enviado al administrador cuando el inventario de un producto está bajo.',
  },

  /** Correo enviado al administrador cuando un producto está agotado. */
  INVENTORY_OUT: {
    key: 'inventory.out',
    subject: '🚫 Producto agotado',
    template: 'inventory/stock-out',
    description:
      'Correo enviado al administrador cuando un producto está agotado.',
  },

  /** Correo enviado al administrador cuando una transferencia de inventario es realizada. */
  INVENTORY_TRANSFER_COMPLETE: {
    key: 'inventory.transfer.complete',
    subject: '✅ Transferencia de inventario completada',
    template: 'inventory/transfer-completed',
    description:
      'Correo enviado al administrador cuando una transferencia de inventario se ha completado exitosamente.',
  },

  /** Correo enviado al administrador cuando se genera un informe de ventas diario. */
  REPORT_DAILY_SUMMARY: {
    key: 'report.daily.summary',
    subject: '📊 Resumen diario de ventas',
    template: 'reports/daily-summary',
    description:
      'Correo enviado al administrador con el resumen diario de ventas.',
  },

  /** Correo enviado al administrador cuando se genera un informe de ventas mensual. */
  REPORT_MONTHLY_SUMMARY: {
    key: 'report.monthly.summary',
    subject: '📈 Resumen mensual de ventas',
    template: 'reports/monthly-performance',
    description:
      'Correo enviado al administrador con el resumen mensual de ventas.',
  },

  /** Correo enviado al administrador cuando se genera un informe de ventas anual. */
  REPORT_CUSTOM_GENERATED: {
    key: 'report.custom.generated',
    subject: '📑 Informe personalizado generado',
    template: 'report/custom-generated',
    description:
      'Correo enviado al administrador cuando se genera un informe personalizado.',
  },
};
