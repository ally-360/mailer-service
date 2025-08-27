import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  MailTracking,
  MailStatus,
  MailPriority,
} from '../entities/mail-tracking.entity';
import { EmailActionsEvent } from '../enums/email-events.enum';

export interface MailTrackingFilters {
  email?: string;
  event?: EmailActionsEvent;
  status?: MailStatus;
  priority?: MailPriority;
  startDate?: Date;
  endDate?: Date;
  provider?: string;
  campaign?: string;
  segment?: string;
  tags?: string[];
}

export interface MailTrackingStats {
  total: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  bounced: number;
  spam: number;
  unsubscribed: number;
  pending: number;
}

@Injectable()
export class MailTrackingRepository {
  constructor(
    @InjectRepository(MailTracking)
    private readonly repository: Repository<MailTracking>,
  ) {}

  async create(trackingData: Partial<MailTracking>): Promise<MailTracking> {
    const tracking = this.repository.create(trackingData);
    return await this.repository.save(tracking);
  }

  async findById(id: string): Promise<MailTracking | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findByMessageId(messageId: string): Promise<MailTracking | null> {
    return await this.repository.findOne({ where: { messageId } });
  }

  async findByEmail(
    email: string,
    limit = 50,
    offset = 0,
  ): Promise<MailTracking[]> {
    return await this.repository.find({
      where: { email },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async findByEvent(
    event: EmailActionsEvent,
    limit = 50,
    offset = 0,
  ): Promise<MailTracking[]> {
    return await this.repository.find({
      where: { event },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async findByStatus(
    status: MailStatus,
    limit = 50,
    offset = 0,
  ): Promise<MailTracking[]> {
    return await this.repository.find({
      where: { status },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async findFailedEmails(limit = 50, offset = 0): Promise<MailTracking[]> {
    return await this.repository.find({
      where: [
        { status: MailStatus.FAILED },
        { status: MailStatus.BOUNCED },
        { status: MailStatus.SPAM },
      ],
      order: { failedAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async findRetryableEmails(): Promise<MailTracking[]> {
    return await this.repository
      .createQueryBuilder('tracking')
      .where('tracking.status = :status', { status: MailStatus.FAILED })
      .andWhere('tracking.retryCount < tracking.maxRetries')
      .andWhere(
        '(tracking.nextRetryAt IS NULL OR tracking.nextRetryAt <= :now)',
        {
          now: new Date(),
        },
      )
      .orderBy('tracking.failedAt', 'ASC')
      .getMany();
  }

  async findWithFilters(
    filters: MailTrackingFilters,
    limit = 50,
    offset = 0,
  ): Promise<MailTracking[]> {
    const queryBuilder = this.repository.createQueryBuilder('tracking');

    this.applyFilters(queryBuilder, filters);

    return await queryBuilder
      .orderBy('tracking.createdAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getMany();
  }

  async incrementRetryCount(id: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(MailTracking)
      .set({ retryCount: () => 'retryCount + 1' })
      .where('id = :id', { id })
      .execute();
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.update(id, { deletedAt: new Date() });
  }

  async hardDelete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<MailTracking>,
    filters: MailTrackingFilters,
  ): void {
    if (filters.email) {
      queryBuilder.andWhere('tracking.email ILIKE :email', {
        email: `%${filters.email}%`,
      });
    }

    if (filters.event) {
      queryBuilder.andWhere('tracking.event = :event', {
        event: filters.event,
      });
    }

    if (filters.status) {
      queryBuilder.andWhere('tracking.status = :status', {
        status: filters.status,
      });
    }

    if (filters.priority) {
      queryBuilder.andWhere('tracking.priority = :priority', {
        priority: filters.priority,
      });
    }

    if (filters.startDate) {
      queryBuilder.andWhere('tracking.createdAt >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      queryBuilder.andWhere('tracking.createdAt <= :endDate', {
        endDate: filters.endDate,
      });
    }

    if (filters.provider) {
      queryBuilder.andWhere('tracking.provider = :provider', {
        provider: filters.provider,
      });
    }

    if (filters.campaign) {
      queryBuilder.andWhere('tracking.campaign = :campaign', {
        campaign: filters.campaign,
      });
    }

    if (filters.segment) {
      queryBuilder.andWhere('tracking.segment = :segment', {
        segment: filters.segment,
      });
    }

    if (filters.tags && filters.tags.length > 0) {
      queryBuilder.andWhere('tracking.tags @> :tags', { tags: filters.tags });
    }

    // Excluir registros eliminados
    queryBuilder.andWhere('tracking.deletedAt IS NULL');
  }
}
