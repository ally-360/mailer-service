import {
  AccountDeactivated,
  PasswordResetSuccessEvent,
  WelcomeEvent,
} from './events/auth.events';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ActivationLinkEvent,
  ReqResetPasswordEvent,
} from './events';
import { EmailActionsEvent } from './enums/email-events.enum';
import { MailService } from './mail.service';
import {
  InventoryOutEvent,
  InventoryTransferCompleteEvent,
  InvetoryLowEvent,
} from './events/inventory.events';

@Injectable()
export class MailListener {
  private _logger = new Logger(MailListener.name);
  constructor(private readonly _mailService: MailService) {}

  @OnEvent(EmailActionsEvent.ActivationLink)
  async handleSendActivationLink(event: ActivationLinkEvent) {
    this._logger.debug(`Enviando email de verificación a: ${event.email}`);
    try {
      await this._mailService.sendVerifyEmail({
        email: event.email,
        name: event.name,
        activationLink: event.activationLink,
      });
      this._logger.debug(`✅ Email enviado a: ${event.email}`);
    } catch (error) {
      this._logger.error(`❌ Error enviando email: ${error.message}`);
    }
  }

  @OnEvent(EmailActionsEvent.UserRegistered)
  async handleWelcome(event: WelcomeEvent) {
    this._logger.debug(`Enviando email de verificación a: ${event.email}`);
    try {
      await this._mailService.sendWelcomeEmail({
        email: event.email,
      });
      this._logger.debug(`✅ Email enviado a: ${event.email}`);
    } catch (error) {
      this._logger.error(`❌ Error enviando email: ${error.message}`);
    }
  }

  @OnEvent(EmailActionsEvent.ReqResetPassword)
  async handleReqResetPassword(event: ReqResetPasswordEvent) {
    this._logger.debug(`Enviando email de verificación a: ${event.email}`);
    try {
      await this._mailService.sendReqResetPasswordEmail({
        email: event.email,
        name: event.name,
        resetLink: event.resetLink,
      });
      this._logger.debug(`✅ Email enviado a: ${event.email}`);
    } catch (error) {
      this._logger.error(`❌ Error enviando email: ${error.message}`);
    }
  }

  @OnEvent(EmailActionsEvent.PasswordResetSuccess)
  async handlePasswordResetSuccess(event: PasswordResetSuccessEvent) {
    this._logger.debug(
      `Enviando email de éxito de restablecimiento a: ${event.email}`,
    );
    try {
      await this._mailService.passwordResetSuccess({
        name: event.name,
        email: event.email,
      });
      this._logger.debug(`✅ Email enviado a: ${event.email}`);
    } catch (error) {
      this._logger.error(`❌ Error enviando email: ${error.message}`);
    }
  }

  @OnEvent(EmailActionsEvent.AccountDeactivated)
  async handleAccountDeactivated(event: AccountDeactivated) {
    this._logger.debug(
      `Enviando email de cuenta desactivada a: ${event.email}`,
    );
    try {
      await this._mailService.accountDeactivated({
        name: event.name,
        email: event.email,
      });
      this._logger.debug(`✅ Email enviado a: ${event.email}`);
    } catch (error) {
      this._logger.error(`❌ Error enviando email: ${error.message}`);
    }
  }

  @OnEvent(EmailActionsEvent.InventoryLow)
  async handleInventoryLow(event: InvetoryLowEvent) {
    this._logger.debug(`Enviando email de inventario bajo a: ${event.email}`);
    try {
      await this._mailService.inventoryLow({
        product: event.product,
        quantity: event.quantity,
        location: event.location,
        email: event.email,
      });
      this._logger.debug(`✅ Email enviado a: ${event.email}`);
    } catch (error) {
      this._logger.error(`❌ Error enviando email: ${error.message}`);
    }
  }

  @OnEvent(EmailActionsEvent.InventoryOut)
  async handleInventoryOut(event: InventoryOutEvent) {
    this._logger.debug(
      `Enviando email de inventario agotado a: ${event.email}`,
    );
    try {
      await this._mailService.inventoryOut({
        product: event.product,
        location: event.location,
        lastUpdate: event.lastUpdate,
        email: event.email,
      });
      this._logger.debug(`✅ Email enviado a: ${event.email}`);
    } catch (error) {
      this._logger.error(`❌ Error enviando email: ${error.message}`);
    }
  }

  @OnEvent(EmailActionsEvent.InventoryTransferComplete)
  async handleInventoryTransferComplete(event: InventoryTransferCompleteEvent) {
    this._logger.debug(
      `Enviando email de transferencia de inventario a: ${event.email}`,
    );
    try {
      await this._mailService.inventoryTransferComplete({
        product: event.product,
        quantity: event.quantity,
        fromLocation: event.fromLocation,
        toLocation: event.toLocation,
        date: event.date,
        email: event.email,
      });
      this._logger.debug(`✅ Email enviado a: ${event.email}`);
    } catch (error) {
      this._logger.error(`❌ Error enviando email: ${error.message}`);
    }
  }
}
