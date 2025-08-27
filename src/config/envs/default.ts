import { CONFIG_DEFAULT } from '../config.default';

export const config = {
  app: {
    /**
     * Puerto HTTP del Gateway
     * @type {number}
     * @default 3000
     * @example 3000
     * @description Puerto en el que se ejecutará la aplicación HTTP
     * @required true
     */
    port: process.env.PORT ? Number(process.env.PORT) : CONFIG_DEFAULT.app.port,
    /**
     * Host de la aplicación
     * @type {string}
     * @default localhost
     * @example localhost
     * @description Host en el que se ejecutará la aplicación HTTP
     * @required true
     */
    host: process.env.HOST || CONFIG_DEFAULT.app.host,
    /**
     * Entorno de ejecución de Node.js
     * @type {string}
     * @default development
     * @example development, production, local
     * @description Determina qué configuración de entorno cargar
     */
    environment: process.env.NODE_ENV || CONFIG_DEFAULT.app.environment,
    /**
     * Habilitar Swagger
     * @type {boolean}
     * @default false
     * @example true, false
     * @description Habilitar Swagger para la documentación de la API
     */
    enableSwagger:
      process.env.ENABLE_SWAGGER || CONFIG_DEFAULT.app.enableSwagger,
  },

  microservice: {},

  database: {
    /**
     * Host de la base de datos
     * @type {string}
     * @example localhost, 127.0.0.1
     * @description Host de la base de datos
     * @required false
     */
    host: process.env.DB_HOST,
    /**
     * Puerto de la base de datos
     * @type {number}
     * @example 5432, 3306
     * @description Puerto de la base de datos
     * @required false
     */
    port: process.env.DB_PORT
      ? Number(process.env.DB_PORT)
      : CONFIG_DEFAULT.database.port,
    /**
     * Nombre de la base de datos
     * @type {string}
     * @example gateway_db, ally360_gateway
     * @description Nombre de la base de datos
     * @required false
     */
    database: process.env.DB_DATABASE,
    /**
     * Usuario de la base de datos
     * @type {string}
     * @example postgres, mysql_user
     * @description Usuario para autenticarse en la base de datos
     * @required false
     */
    username: process.env.DB_USERNAME,
    /**
     * Contraseña de la base de datos
     * @type {string}
     * @example mypassword, secret123
     * @description Contraseña para autenticarse en la base de datos
     * @required false
     */
    password: process.env.DB_PASSWORD,
  },

  logging: {
    /**
     * Nivel de logging de la aplicación
     * @type {string}
     * @default info
     * @example debug, info, warn, error
     * @description Nivel de detalle para los logs de la aplicación
     */
    level: process.env.LOG_LEVEL || CONFIG_DEFAULT.logging.level,
  },

  smtp: {
    /**
     * Host del servidor SMTP
     * @type {string}
     * @example smtp.gmail.com, smtp.mailtrap.io
     * @description Host del servidor SMTP
     * @required true
     */
    host: process.env.SMTP_HOST,

    /**
     * Puerto del servidor SMTP
     * @type {number}
     * @example 587, 465
     * @description Puerto del servidor SMTP
     * @required true
     */
    port: process.env.SMTP_PORT
      ? Number(process.env.SMTP_PORT)
      : CONFIG_DEFAULT.smtp.port,

    /**
     * Si el servidor SMTP es seguro
     * @type {boolean}
     * @example true, false
     * @description Si el servidor SMTP es seguro
     * @required true
     */
    secure: process.env.SMTP_SECURE === 'true',

    /**
     * Usuario del servidor SMTP
     * @type {string}
     * @example user@gmail.com, user@mailtrap.io
     * @description Usuario del servidor SMTP
     * @required true
     */
    user: process.env.SMTP_USER,

    /**
     * Contraseña del servidor SMTP
     * @type {string}
     * @example password123, secret123
     * @description Contraseña del servidor SMTP
     * @required true
     */
    password: process.env.SMTP_PASSWORD,

    /**
     * Dirección de correo electrónico de remitente
     * @type {string}
     * @example no-reply@ally360.com, no-reply@mailtrap.io
     * @description Dirección de correo electrónico de remitente
     * @required true
     */
    from: process.env.SMTP_FROM || CONFIG_DEFAULT.smtp.from,
  },
};
