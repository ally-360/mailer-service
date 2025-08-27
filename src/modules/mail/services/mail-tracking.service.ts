import { Injectable, Logger } from '@nestjs/common';
import { MailTrackingRepository } from '../repositories/mail-tracking.repository';
import { MailTracking, MailStatus, MailPriority } from '../entities/mail-tracking.entity';
import { EmailActionsEvent } from '../enums/email-events.enum';
import { MailTemplates } from '../enums/mailer.mapper';

export interface CreateTrackingData {
  email: string;
  event: EmailActionsEvent;
  priority?: MailPriority;
  subject?: string;
  template?: string;
  context?: Record<string, any>;
  metadata?: Record<string, any>;
  recipientName?: string;
  senderName?: string;
  senderEmail?: string;
  isTransactional?: boolean;
  isMarketing?: boolean;
  campaign?: string;
  segment?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  notes?: string;
}

@Injectable()
export class MailTrackingService {
  private readonly logger = new Logger(MailTrackingService.name);

  constructor(private readonly mailTrackingRepository: MailTrackingRepository) {}

  async createTracking(data: CreateTrackingData): Promise<MailTracking> {
    try {
      // Determinar si es transaccional o marketing basado en el evento
      const isTransactional = this.isTransactionalEvent(data.event);
      const isMarketing = !isTransactional;

      // Obtener información de la plantilla si no se proporciona
      const template = data.template || this.getTemplateForEvent(data.event);
      const subject = data.subject || this.getSubjectForEvent(data.event);

      const trackingData: Partial<MailTracking> = {
        email: data.email,
        event: data.event,
        priority: data.priority || MailPriority.NORMAL,
        subject,
        template,
        context: data.context || {},
        metadata: data.metadata || {},
        recipientName: data.recipientName,
        senderName: data.senderName || 'Ally 360',
        senderEmail: data.senderEmail || 'no-reply@ally360.com',
        isTransactional,
        isMarketing,
        campaign: data.campaign,
        segment: data.segment,
        tags: data.tags || [],
        customFields: data.customFields || {},
        notes: data.notes,
        status: MailStatus.PENDING,
        retryCount: 0,
        maxRetries: 3,
      };

      const tracking = await this.mailTrackingRepository.create(trackingData);
      
      this.logger.log(`Tracking created for email: ${data.email}, event: ${data.event}, ID: ${tracking.id}`);
      
      return tracking;
    } catch (error) {
      this.logger.error(`Error creating tracking: ${error.message}`);
      throw error;
    }
  }

  async markAsSent(trackingId: string, messageId?: string, provider?: string): Promise<void> {
    try {
      await this.mailTrackingRepository.updateStatus(trackingId, MailStatus.SENT);
      
      if (messageId) {
        await this.mailTrackingRepository.updateMessageId(trackingId, messageId, provider);
      }
      
      this.logger.log(`Email marked as sent: ${trackingId}`);
    } catch (error) {
      this.logger.error(`Error marking email as sent: ${error.message}`);
      throw error;
    }
  }

  async markAsDelivered(trackingId: string): Promise<void> {
    try {
      await this.mailTrackingRepository.updateStatus(trackingId, MailStatus.DELIVERED);
      this.logger.log(`Email marked as delivered: ${trackingId}`);
    } catch (error) {
      this.logger.error(`Error marking email as delivered: ${error.message}`);
      throw error;
    }
  }

  async markAsRead(trackingId: string): Promise<void> {
    try {
      await this.mailTrackingRepository.updateStatus(trackingId, MailStatus.READ);
      this.logger.log(`Email marked as read: ${trackingId}`);
    } catch (error) {
      this.logger.error(`Error marking email as read: ${error.message}`);
      throw error;
    }
  }

  async markAsFailed(trackingId: string, errorMessage: string, errorCode?: string): Promise<void> {
    try {
      await this.mailTrackingRepository.updateStatus(trackingId, MailStatus.FAILED, {
        errorMessage,
        errorCode,
      });
      this.logger.error(`Email marked as failed: ${trackingId}, Error: ${errorMessage}`);
    } catch (error) {
      this.logger.error(`Error marking email as failed: ${error.message}`);
      throw error;
    }
  }

  async markAsBounced(trackingId: string): Promise<void> {
    try {
      await this.mailTrackingRepository.updateStatus(trackingId, MailStatus.BOUNCED);
      this.logger.log(`Email marked as bounced: ${trackingId}`);
    } catch (error) {
      this.logger.error(`Error marking email as bounced: ${error.message}`);
      throw error;
    }
  }

  async markAsSpam(trackingId: string): Promise<void> {
    try {
      await this.mailTrackingRepository.updateStatus(trackingId, MailStatus.SPAM);
      this.logger.log(`Email marked as spam: ${trackingId}`);
    } catch (error) {
      this.logger.error(`Error marking email as spam: ${error.message}`);
      throw error;
    }
  }

  async markAsUnsubscribed(trackingId: string): Promise<void> {
    try {
      await this.mailTrackingRepository.updateStatus(trackingId, MailStatus.UNSUBSCRIBED);
      this.logger.log(`Email marked as unsubscribed: ${trackingId}`);
    } catch (error) {
      this.logger.error(`Error marking email as unsubscribed: ${error.message}`);
      throw error;
    }
  }

  async getTrackingById(id: string): Promise<MailTracking | null> {
    return await this.mailTrackingRepository.findById(id);
  }

  async getTrackingByMessageId(messageId: string): Promise<MailTracking | null> {
    return await this.mailTrackingRepository.findByMessageId(messageId);
  }

  async getTrackingByEmail(email: string, limit = 50, offset = 0): Promise<MailTracking[]> {
    return await this.mailTrackingRepository.findByEmail(email, limit, offset);
  }

  async getTrackingByEvent(event: EmailActionsEvent, limit = 50, offset = 0): Promise<MailTracking[]> {
    return await this.mailTrackingRepository.findByEvent(event, limit, offset);
  }

  async getTrackingByStatus(status: MailStatus, limit = 50, offset = 0): Promise<MailTracking[]> {
    return await this.mailTrackingRepository.findByStatus(status, limit, offset);
  }

  async getFailedEmails(limit = 50, offset = 0): Promise<MailTracking[]> {
    return await this.mailTrackingRepository.findFailedEmails(limit, offset);
  }

  async getRetryableEmails(): Promise<MailTracking[]> {
    return await this.mailTrackingRepository.findRetryableEmails();
  }

  async getStats(filters?: any): Promise<any> {
    return await this.mailTrackingRepository.getStats(filters);
  }

  async getEventStats(startDate?: Date, endDate?: Date): Promise<Array<{ event: string; count: number }>> {
    return await this.mailTrackingRepository.getEventStats(startDate, endDate);
  }

  async getDailyStats(days: number = 30): Promise<Array<{ date: string; count: number }>> {
    return await this.mailTrackingRepository.getDailyStats(days);
  }

  async retryFailedEmail(trackingId: string): Promise<void> {
    try {
      const tracking = await this.mailTrackingRepository.findById(trackingId);
      if (!tracking) {
        throw new Error('Tracking not found');
      }

      if (!tracking.canRetry()) {
        throw new Error('Email cannot be retried');
      }

      // Reset status to pending for retry
      await this.mailTrackingRepository.updateStatus(trackingId, MailStatus.PENDING, {
        errorMessage: null,
        errorCode: null,
        nextRetryAt: null,
      });

      this.logger.log(`Email queued for retry: ${trackingId}`);
    } catch (error) {
      this.logger.error(`Error retrying email: ${error.message}`);
      throw error;
    }
  }

  async cleanupOldRecords(daysToKeep: number = 90): Promise<number> {
    try {
      const deletedCount = await this.mailTrackingRepository.cleanupOldRecords(daysToKeep);
      this.logger.log(`Cleaned up ${deletedCount} old tracking records`);
      return deletedCount;
    } catch (error) {
      this.logger.error(`Error cleaning up old records: ${error.message}`);
      throw error;
    }
  }

  private isTransactionalEvent(event: EmailActionsEvent): boolean {
    const transactionalEvents = [
      EmailActionsEvent.UserRegistered,
      EmailActionsEvent.ActivationLink,
      EmailActionsEvent.ReqResetPassword,
      EmailActionsEvent.PasswordResetSuccess,
      EmailActionsEvent.AccountDeactivated,
      EmailActionsEvent.InventoryLow,
      EmailActionsEvent.InventoryOut,
      EmailActionsEvent.InventoryTransferComplete,
    ];

    return transactionalEvents.includes(event);
  }

  private getTemplateForEvent(event: EmailActionsEvent): string {
    const templateMap: Record<EmailActionsEvent, string> = {
      [EmailActionsEvent.UserRegistered]: MailTemplates.REGISTER_SUCCESS.template,
      [EmailActionsEvent.ActivationLink]: MailTemplates.ACTIVATION_LINK.template,
      [EmailActionsEvent.ReqResetPassword]: MailTemplates.REQ_RESET_PASSWORD.template,
      [EmailActionsEvent.PasswordResetSuccess]: MailTemplates.PASSWORD_RESET_SUCCESS.template,
      [EmailActionsEvent.AccountDeactivated]: MailTemplates.ACCOUNT_DEACTIVATED.template,
      [EmailActionsEvent.InventoryLow]: MailTemplates.INVENTORY_LOW.template,
      [EmailActionsEvent.InventoryOut]: MailTemplates.INVENTORY_OUT.template,
      [EmailActionsEvent.InventoryTransferComplete]: MailTemplates.INVENTORY_TRANSFER_COMPLETE.template,
      [EmailActionsEvent.ReportDailySummary]: MailTemplates.REPORT_DAILY_SUMMARY.template,
      [EmailActionsEvent.ReportMonthlySummary]: MailTemplates.REPORT_MONTHLY_SUMMARY.template,
      [EmailActionsEvent.ReportCustomGenerated]: 'custom-report',
    };

    return templateMap[event] || 'unknown';
  }

  private getSubjectForEvent(event: EmailActionsEvent): string {
    const subjectMap: Record<EmailActionsEvent, string> = {
      [EmailActionsEvent.UserRegistered]: MailTemplates.REGISTER_SUCCESS.subject,
      [EmailActionsEvent.ActivationLink]: MailTemplates.ACTIVATION_LINK.subject,
      [EmailActionsEvent.ReqResetPassword]: MailTemplates.REQ_RESET_PASSWORD.subject,
      [EmailActionsEvent.PasswordResetSuccess]: MailTemplates.PASSWORD_RESET_SUCCESS.subject,
      [EmailActionsEvent.AccountDeactivated]: MailTemplates.ACCOUNT_DEACTIVATED.subject,
      [EmailActionsEvent.InventoryLow]: MailTemplates.INVENTORY_LOW.subject,
      [EmailActionsEvent.InventoryOut]: MailTemplates.INVENTORY_OUT.subject,
      [EmailActionsEvent.InventoryTransferComplete]: MailTemplates.INVENTORY_TRANSFER_COMPLETE.subject,
      [EmailActionsEvent.ReportDailySummary]: MailTemplates.REPORT_DAILY_SUMMARY.subject,
      [EmailActionsEvent.ReportMonthlySummary]: MailTemplates.REPORT_MONTHLY_SUMMARY.subject,
      [EmailActionsEvent.ReportCustomGenerated]: 'Reporte Personalizado',
    };

    return subjectMap[event] || 'Sin asunto';
  }
}
