import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SendEmailDto } from './dtos/send-email.dto';
import { EmailStrategyContext } from './strategies/email-strategy-context';

@Controller()
export class MailController {
  private readonly logger = new Logger(MailController.name);

  constructor(private readonly emailStrategyContext: EmailStrategyContext) {}

  @MessagePattern('mail.send')
  async sendEmail(@Payload() payload: SendEmailDto): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Received email request for event: ${payload.event} to: ${payload.email}`);
    
    try {
      await this.emailStrategyContext.executeStrategy(
        payload.event,
        payload.email,
        payload.data
      );

      return {
        success: true,
        message: `Email sent successfully for event: ${payload.event} to ${payload.email}`,
      };
    } catch (error) {
      this.logger.error(`Error sending email: ${error.message}`);
      
      return {
        success: false,
        message: `Failed to send email: ${error.message}`,
      };
    }
  }

  @MessagePattern('mail.health')
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }
}
