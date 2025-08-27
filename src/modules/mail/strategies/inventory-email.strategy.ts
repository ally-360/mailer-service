import { Injectable } from '@nestjs/common';
import { IEmailStrategy } from './email-strategy.interface';
import { MailService } from '../mail.service';
import { EmailActionsEvent } from '../enums/email-events.enum';

@Injectable()
export class InventoryEmailStrategy implements IEmailStrategy {
  constructor(private readonly mailService: MailService) {}

  canHandle(event: string): boolean {
    return [
      EmailActionsEvent.InventoryLow,
      EmailActionsEvent.InventoryOut,
      EmailActionsEvent.InventoryTransferComplete,
    ].includes(event as EmailActionsEvent);
  }

  async send(email: string, data?: Record<string, any>): Promise<void> {
    const event = data?.event as EmailActionsEvent;
    
    switch (event) {
      case EmailActionsEvent.InventoryLow:
        if (!data?.product || !data?.quantity || !data?.location) {
          throw new Error('Missing required data: product, quantity, and location');
        }
        await this.mailService.inventoryLow({
          email,
          product: data.product,
          quantity: data.quantity,
          location: data.location,
        });
        break;
      
      case EmailActionsEvent.InventoryOut:
        if (!data?.product || !data?.location || !data?.lastUpdate) {
          throw new Error('Missing required data: product, location, and lastUpdate');
        }
        await this.mailService.inventoryOut({
          email,
          product: data.product,
          location: data.location,
          lastUpdate: new Date(data.lastUpdate),
        });
        break;
      
      case EmailActionsEvent.InventoryTransferComplete:
        if (!data?.product || !data?.quantity || !data?.fromLocation || !data?.toLocation || !data?.date) {
          throw new Error('Missing required data: product, quantity, fromLocation, toLocation, and date');
        }
        await this.mailService.inventoryTransferComplete({
          email,
          product: data.product,
          quantity: data.quantity,
          fromLocation: data.fromLocation,
          toLocation: data.toLocation,
          date: new Date(data.date),
        });
        break;
      
      default:
        throw new Error(`Unsupported inventory event: ${event}`);
    }
  }
}
