import { EmailActionsEvent } from '../enums/email-events.enum';

export class SendEmailDto {
  email: string;
  event: EmailActionsEvent;
  data?: Record<string, any>;
}
