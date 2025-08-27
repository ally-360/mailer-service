import { Injectable } from '@nestjs/common';
import { IEmailStrategy } from './email-strategy.interface';
import { MailService } from '../mail.service';
import { EmailActionsEvent } from '../enums/email-events.enum';

@Injectable()
export class AuthEmailStrategy implements IEmailStrategy {
  constructor(private readonly mailService: MailService) {}

  canHandle(event: string): boolean {
    return [
      EmailActionsEvent.UserRegistered,
      EmailActionsEvent.ActivationLink,
      EmailActionsEvent.ReqResetPassword,
      EmailActionsEvent.PasswordResetSuccess,
      EmailActionsEvent.AccountDeactivated,
    ].includes(event as EmailActionsEvent);
  }

  async send(email: string, data?: Record<string, any>): Promise<void> {
    const event = data?.event as EmailActionsEvent;
    
    switch (event) {
      case EmailActionsEvent.UserRegistered:
        await this.mailService.sendWelcomeEmail({ email });
        break;
      
      case EmailActionsEvent.ActivationLink:
        if (!data?.name || !data?.activationLink) {
          throw new Error('Missing required data: name and activationLink');
        }
        await this.mailService.sendVerifyEmail({
          email,
          name: data.name,
          activationLink: data.activationLink,
        });
        break;
      
      case EmailActionsEvent.ReqResetPassword:
        if (!data?.name || !data?.resetLink) {
          throw new Error('Missing required data: name and resetLink');
        }
        await this.mailService.sendReqResetPasswordEmail({
          email,
          name: data.name,
          resetLink: data.resetLink,
        });
        break;
      
      case EmailActionsEvent.PasswordResetSuccess:
        if (!data?.name) {
          throw new Error('Missing required data: name');
        }
        await this.mailService.passwordResetSuccess({
          email,
          name: data.name,
        });
        break;
      
      case EmailActionsEvent.AccountDeactivated:
        if (!data?.name) {
          throw new Error('Missing required data: name');
        }
        await this.mailService.accountDeactivated({
          email,
          name: data.name,
        });
        break;
      
      default:
        throw new Error(`Unsupported auth event: ${event}`);
    }
  }
}
