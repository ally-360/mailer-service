import {
  ReportDailySummaryEvent,
  ReportMonthlySummaryEvent,
} from './events/report.events';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { MailTemplates } from './enums/mailer.mapper';
import {
  AccountDeactivated,
  ActivationLinkEvent,
  PasswordResetSuccessEvent,
  ReqResetPasswordEvent,
  WelcomeEvent,
} from './events';
import {
  InventoryOutEvent,
  InventoryTransferCompleteEvent,
  InvetoryLowEvent,
} from './events/inventory.events';
import { MailTrackingService } from './services';
import { EmailActionsEvent } from './enums/email-events.enum';

@Injectable()
export class MailService {
  private readonly _logger = new Logger(MailService.name);
  
  constructor(
    private readonly mailerService: MailerService,
    private readonly mailTrackingService: MailTrackingService,
  ) {}

  private async sendMailWithTracking(
    to: string,
    subject: string,
    template: string,
    context: Record<string, any>,
    event: EmailActionsEvent,
    recipientName?: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      // Crear tracking antes de enviar
      const tracking = await this.mailTrackingService.createTracking({
        email: to,
        event,
        subject,
        template,
        context,
        metadata,
        recipientName,
      });

      this._logger.log(`Sending email for event: ${event} to: ${to}, tracking ID: ${tracking.id}`);

      // Enviar el email
      const result = await this.mailerService.sendMail({
        to,
        subject,
        template,
        context,
      });

      // Marcar como enviado exitosamente
      await this.mailTrackingService.markAsSent(
        tracking.id,
        result.messageId,
        'smtp'
      );

      this._logger.log(`Email sent successfully for event: ${event} to: ${to}`);
    } catch (error) {
      this._logger.error(`Error sending email for event: ${event} to: ${to}: ${error.message}`);
      
      // Si hay un tracking creado, marcarlo como fallido
      if (error.trackingId) {
        await this.mailTrackingService.markAsFailed(
          error.trackingId,
          error.message,
          error.code
        );
      }
      
      throw error;
    }
  }

  async sendVerifyEmail(activationLinkParams: ActivationLinkEvent) {
    await this.sendMailWithTracking(
      activationLinkParams.email,
      MailTemplates.ACTIVATION_LINK.subject,
      MailTemplates.ACTIVATION_LINK.template,
      {
        name: activationLinkParams.name,
        activationLink: activationLinkParams.activationLink,
      },
      EmailActionsEvent.ActivationLink,
      activationLinkParams.name,
    );
  }

  async sendWelcomeEmail(sendWelcomeParams: WelcomeEvent): Promise<void> {
    await this.sendMailWithTracking(
      sendWelcomeParams.email,
      MailTemplates.REGISTER_SUCCESS.subject,
      MailTemplates.REGISTER_SUCCESS.template,
      {
        email: sendWelcomeParams.email,
      },
      EmailActionsEvent.UserRegistered,
    );
  }

  async sendReqResetPasswordEmail(reqResetEmailParams: ReqResetPasswordEvent) {
    await this.sendMailWithTracking(
      reqResetEmailParams.email,
      MailTemplates.REQ_RESET_PASSWORD.subject,
      MailTemplates.REQ_RESET_PASSWORD.template,
      {
        name: reqResetEmailParams.name,
        resetLink: reqResetEmailParams.resetLink,
      },
      EmailActionsEvent.ReqResetPassword,
      reqResetEmailParams.name,
    );
  }

  async passwordResetSuccess(
    passwordResetSuccessParams: PasswordResetSuccessEvent,
  ): Promise<void> {
    await this.sendMailWithTracking(
      passwordResetSuccessParams.email,
      MailTemplates.PASSWORD_RESET_SUCCESS.subject,
      MailTemplates.PASSWORD_RESET_SUCCESS.template,
      {
        name: passwordResetSuccessParams.name,
      },
      EmailActionsEvent.PasswordResetSuccess,
      passwordResetSuccessParams.name,
    );
  }

  async accountDeactivated(
    accountDeactivatedParams: AccountDeactivated,
  ): Promise<void> {
    await this.sendMailWithTracking(
      accountDeactivatedParams.email,
      MailTemplates.ACCOUNT_DEACTIVATED.subject,
      MailTemplates.ACCOUNT_DEACTIVATED.template,
      {
        name: accountDeactivatedParams.name,
      },
      EmailActionsEvent.AccountDeactivated,
      accountDeactivatedParams.name,
    );
  }

  async inventoryLow(inventoryLowParams: InvetoryLowEvent): Promise<void> {
    await this.sendMailWithTracking(
      inventoryLowParams.email,
      MailTemplates.INVENTORY_LOW.subject,
      MailTemplates.INVENTORY_LOW.template,
      {
        product: inventoryLowParams.product,
        quantity: inventoryLowParams.quantity,
        location: inventoryLowParams.location,
      },
      EmailActionsEvent.InventoryLow,
      undefined,
      {
        product: inventoryLowParams.product,
        quantity: inventoryLowParams.quantity,
        location: inventoryLowParams.location,
      },
    );
  }

  async inventoryOut(inventoryOutParams: InventoryOutEvent): Promise<void> {
    await this.sendMailWithTracking(
      inventoryOutParams.email,
      MailTemplates.INVENTORY_OUT.subject,
      MailTemplates.INVENTORY_OUT.template,
      {
        product: inventoryOutParams.product,
        location: inventoryOutParams.location,
        lastUpdate: inventoryOutParams.lastUpdate.toISOString(),
      },
      EmailActionsEvent.InventoryOut,
      undefined,
      {
        product: inventoryOutParams.product,
        location: inventoryOutParams.location,
        lastUpdate: inventoryOutParams.lastUpdate,
      },
    );
  }

  async inventoryTransferComplete(
    inventoryTransferCompleteParams: InventoryTransferCompleteEvent,
  ): Promise<void> {
    await this.sendMailWithTracking(
      inventoryTransferCompleteParams.email,
      MailTemplates.INVENTORY_TRANSFER_COMPLETE.subject,
      MailTemplates.INVENTORY_TRANSFER_COMPLETE.template,
      {
        product: inventoryTransferCompleteParams.product,
        fromLocation: inventoryTransferCompleteParams.fromLocation,
        toLocation: inventoryTransferCompleteParams.toLocation,
        quantity: inventoryTransferCompleteParams.quantity,
        date: inventoryTransferCompleteParams.date.toISOString(),
      },
      EmailActionsEvent.InventoryTransferComplete,
      undefined,
      {
        product: inventoryTransferCompleteParams.product,
        quantity: inventoryTransferCompleteParams.quantity,
        fromLocation: inventoryTransferCompleteParams.fromLocation,
        toLocation: inventoryTransferCompleteParams.toLocation,
        date: inventoryTransferCompleteParams.date,
      },
    );
  }

  async reportDailySummary(reportDailySummaryEvent: ReportDailySummaryEvent) {
    await this.sendMailWithTracking(
      reportDailySummaryEvent.email,
      MailTemplates.REPORT_DAILY_SUMMARY.subject,
      MailTemplates.REPORT_DAILY_SUMMARY.template,
      {
        date: reportDailySummaryEvent.date,
        summary: reportDailySummaryEvent.summary,
        sales: reportDailySummaryEvent.sales,
        purchases: reportDailySummaryEvent.purchases,
        newProducts: reportDailySummaryEvent.newProducts,
        stockMovements: reportDailySummaryEvent.stockMovements,
        lowStockCount: reportDailySummaryEvent.lowStockCount,
        outOfStockCount: reportDailySummaryEvent.outOfStockCount,
        transfers: reportDailySummaryEvent.transfers,
        name: reportDailySummaryEvent.name,
      },
      EmailActionsEvent.ReportDailySummary,
      reportDailySummaryEvent.name,
      {
        sales: reportDailySummaryEvent.sales,
        purchases: reportDailySummaryEvent.purchases,
        newProducts: reportDailySummaryEvent.newProducts,
        stockMovements: reportDailySummaryEvent.stockMovements,
        transfers: reportDailySummaryEvent.transfers,
      },
    );
  }

  async reportMonthlySummary(
    reportMonthlySummaryEvent: ReportMonthlySummaryEvent,
  ) {
    await this.sendMailWithTracking(
      reportMonthlySummaryEvent.email,
      MailTemplates.REPORT_MONTHLY_SUMMARY.subject,
      MailTemplates.REPORT_MONTHLY_SUMMARY.template,
      {
        month: reportMonthlySummaryEvent.month,
        year: reportMonthlySummaryEvent.year,
        totalSales: reportMonthlySummaryEvent.totalSales,
        totalPurchases: reportMonthlySummaryEvent.totalPurchases,
        newCustomers: reportMonthlySummaryEvent.newCustomers,
        topProducts: reportMonthlySummaryEvent.topProducts,
        avgInventory: reportMonthlySummaryEvent.avgInventory,
        profitability: reportMonthlySummaryEvent.profitability,
        name: reportMonthlySummaryEvent.name,
        reportLink: reportMonthlySummaryEvent.reportLink,
      },
      EmailActionsEvent.ReportMonthlySummary,
      reportMonthlySummaryEvent.name,
      {
        totalSales: reportMonthlySummaryEvent.totalSales,
        totalPurchases: reportMonthlySummaryEvent.totalPurchases,
        newCustomers: reportMonthlySummaryEvent.newCustomers,
        avgInventory: reportMonthlySummaryEvent.avgInventory,
        profitability: reportMonthlySummaryEvent.profitability,
      },
    );
  }
}
