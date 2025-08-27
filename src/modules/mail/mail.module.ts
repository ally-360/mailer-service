import { ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailService } from './mail.service';
import { join } from 'path';
import { MailListener } from './mail.listener';
import * as Events from './events';
import { MailController } from './mail.controller';
import { 
  EmailStrategyContext, 
  AuthEmailStrategy, 
  InventoryEmailStrategy, 
  ReportEmailStrategy 
} from './strategies';
import { MailTracking } from './entities';
import { MailTrackingRepository } from './repositories';
import { MailTrackingService } from './services';

@Module({
  imports: [
    TypeOrmModule.forFeature([MailTracking]),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const templatesDir = join(__dirname, 'templates');
        const partialsDir = join(templatesDir, 'partials');

        return {
          transport: {
            host: config.get('smtp').host,
            port: config.get('smtp').port,
            secure: config.get('smtp').secure,
            auth: {
              user: config.get('smtp').user,
              pass: config.get('smtp').password,
            },
          },
          defaults: {
            from: `"Ally 360" <${config.get('smtp').from}>`,
          },
          template: {
            dir: templatesDir,
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
          options: {
            partials: {
              dir: partialsDir,
            },
          },
        };
      },
    }),
  ],
  providers: [
    MailService, 
    MailListener, 
    ...Object.values(Events),
    EmailStrategyContext,
    {
      provide: AuthEmailStrategy,
      useFactory: (mailService: MailService) => new AuthEmailStrategy(mailService),
      inject: [MailService],
    },
    {
      provide: InventoryEmailStrategy,
      useFactory: (mailService: MailService) => new InventoryEmailStrategy(mailService),
      inject: [MailService],
    },
    {
      provide: ReportEmailStrategy,
      useFactory: (mailService: MailService) => new ReportEmailStrategy(mailService),
      inject: [MailService],
    },
    MailTrackingRepository,
    MailTrackingService,
  ],
  exports: [MailService, MailListener, EmailStrategyContext, MailTrackingService],
  controllers: [MailController],
})
export class MailModule implements OnModuleInit {
  constructor(
    private readonly emailStrategyContext: EmailStrategyContext,
    private readonly authEmailStrategy: AuthEmailStrategy,
    private readonly inventoryEmailStrategy: InventoryEmailStrategy,
    private readonly reportEmailStrategy: ReportEmailStrategy,
  ) {}

  onModuleInit() {
    // Registrar todas las estrategias en el contexto
    this.emailStrategyContext.registerStrategy(this.authEmailStrategy);
    this.emailStrategyContext.registerStrategy(this.inventoryEmailStrategy);
    this.emailStrategyContext.registerStrategy(this.reportEmailStrategy);
  }
}
