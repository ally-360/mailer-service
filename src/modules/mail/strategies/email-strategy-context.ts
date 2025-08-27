import { Injectable, Logger } from '@nestjs/common';
import { IEmailStrategy } from './email-strategy.interface';

@Injectable()
export class EmailStrategyContext {
  private readonly logger = new Logger(EmailStrategyContext.name);
  private strategies: IEmailStrategy[] = [];

  registerStrategy(strategy: IEmailStrategy): void {
    this.strategies.push(strategy);
  }

  async executeStrategy(event: string, email: string, data?: Record<string, any>): Promise<void> {
    const strategy = this.strategies.find(s => s.canHandle(event));
    
    if (!strategy) {
      this.logger.error(`No strategy found for event: ${event}`);
      throw new Error(`No strategy found for event: ${event}`);
    }

    this.logger.log(`Executing strategy for event: ${event} to email: ${email}`);
    
    try {
      await strategy.send(email, { ...data, event });
      this.logger.log(`Email sent successfully for event: ${event} to ${email}`);
    } catch (error) {
      this.logger.error(`Error sending email for event: ${event} to ${email}: ${error.message}`);
      throw error;
    }
  }
}
