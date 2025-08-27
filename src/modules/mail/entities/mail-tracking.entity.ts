import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { EmailActionsEvent } from '../enums/email-events.enum';

export enum MailStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  BOUNCED = 'bounced',
  SPAM = 'spam',
  UNSUBSCRIBED = 'unsubscribed',
}

export enum MailPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('mail_tracking')
@Index(['email', 'event'])
@Index(['status', 'createdAt'])
@Index(['event', 'createdAt'])
export class MailTracking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 100 })
  event: EmailActionsEvent;

  @Column({ type: 'enum', enum: MailStatus, default: MailStatus.PENDING })
  status: MailStatus;

  @Column({ type: 'enum', enum: MailPriority, default: MailPriority.NORMAL })
  priority: MailPriority;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subject: string;

  @Column({ type: 'text', nullable: true })
  template: string;

  @Column({ type: 'jsonb', nullable: true })
  context: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'varchar', length: 100, nullable: true })
  messageId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  externalId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  provider: string;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'int', default: 3 })
  maxRetries: number;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  failedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextRetryAt: Date;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  errorCode: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  recipientName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  senderName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  senderEmail: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent: string;

  @Column({ type: 'boolean', default: false })
  isTransactional: boolean;

  @Column({ type: 'boolean', default: false })
  isMarketing: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  campaign: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  segment: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  currency: string;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  // Métodos de utilidad
  isRetryable(): boolean {
    return (
      this.retryCount < this.maxRetries && this.status === MailStatus.FAILED
    );
  }

  canRetry(): boolean {
    if (!this.isRetryable()) return false;
    if (!this.nextRetryAt) return true;
    return new Date() >= this.nextRetryAt;
  }

  markAsSent(): void {
    this.status = MailStatus.SENT;
    this.sentAt = new Date();
    this.retryCount = 0;
    this.errorMessage = '';
    this.errorCode = '';
  }

  markAsFailed(errorMessage: string, errorCode?: string): void {
    this.status = MailStatus.FAILED;
    this.failedAt = new Date();
    this.errorMessage = errorMessage;
    this.errorCode = errorCode || '';
    this.retryCount++;

    if (this.isRetryable()) {
      // Calcular próximo intento con backoff exponencial
      const delay = Math.min(1000 * Math.pow(2, this.retryCount), 300000); // Max 5 minutos
      this.nextRetryAt = new Date(Date.now() + delay);
    }
  }

  setStatus(status: MailStatus): void {
    this.status = status;
    this.failedAt = new Date();
  }

  getStatusColor(): string {
    switch (this.status) {
      case MailStatus.SENT:
      case MailStatus.DELIVERED:
      case MailStatus.READ:
        return 'success';
      case MailStatus.PENDING:
        return 'warning';
      case MailStatus.FAILED:
      case MailStatus.BOUNCED:
      case MailStatus.SPAM:
        return 'danger';
      case MailStatus.UNSUBSCRIBED:
        return 'info';
      default:
        return 'secondary';
    }
  }

  getStatusLabel(): string {
    switch (this.status) {
      case MailStatus.PENDING:
        return 'Pendiente';
      case MailStatus.SENT:
        return 'Enviado';
      case MailStatus.DELIVERED:
        return 'Entregado';
      case MailStatus.READ:
        return 'Leído';
      case MailStatus.FAILED:
        return 'Fallido';
      case MailStatus.BOUNCED:
        return 'Rebotado';
      case MailStatus.SPAM:
        return 'Spam';
      case MailStatus.UNSUBSCRIBED:
        return 'Desuscrito';
      default:
        return 'Desconocido';
    }
  }

  getPriorityLabel(): string {
    switch (this.priority) {
      case MailPriority.LOW:
        return 'Baja';
      case MailPriority.NORMAL:
        return 'Normal';
      case MailPriority.HIGH:
        return 'Alta';
      case MailPriority.URGENT:
        return 'Urgente';
      default:
        return 'Normal';
    }
  }
}
