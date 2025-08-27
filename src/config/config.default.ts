export const CONFIG_DEFAULT = {
  app: {
    /**
     * @default 3000
     */
    port: 3000,
    /**
     * @default localhost
     */
    host: 'localhost',
    /**
     * @default development
     */
    environment: 'development',
    /**
     * @default false
     */
    enableSwagger: false,
  },

  microservice: {},

  database: {
    /**
     * @default 5432
     */
    port: 5432,
    /**
     * @default mailer_service
     */
    schema: 'mailer_service',
    /**
     * @default postgres
     */
    username: 'postgres',
    /**
     * @default postgres
     */
    password: 'postgres',
    /**
     * @default master
     */
    database: 'master',
    /**
     * @default false
     */
    ssl: false,
  },

  logging: {
    /**
     * @default info
     */
    level: 'info',
  },

  smtp: {
    /**
     * @default 587
     */
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,

    /**
     * @default no-reply@ally360.com
     */
    from: process.env.SMTP_FROM || 'no-reply@ally360.com',
  },
};
