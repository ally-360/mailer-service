import { Injectable } from '@nestjs/common';
import { IEmailStrategy } from './email-strategy.interface';
import { MailService } from '../mail.service';
import { EmailActionsEvent } from '../enums/email-events.enum';

@Injectable()
export class ReportEmailStrategy implements IEmailStrategy {
  constructor(private readonly mailService: MailService) {}

  canHandle(event: string): boolean {
    return [
      EmailActionsEvent.ReportDailySummary,
      EmailActionsEvent.ReportMonthlySummary,
      EmailActionsEvent.ReportCustomGenerated,
    ].includes(event as EmailActionsEvent);
  }

  async send(email: string, data?: Record<string, any>): Promise<void> {
    const event = data?.event as EmailActionsEvent;
    
    switch (event) {
      case EmailActionsEvent.ReportDailySummary:
        if (!data?.name || !data?.date || !data?.summary) {
          throw new Error('Missing required data: name, date, and summary');
        }
        await this.mailService.reportDailySummary({
          email,
          name: data.name,
          date: new Date(data.date),
          summary: data.summary,
          sales: data.sales || 0,
          purchases: data.purchases || 0,
          newProducts: data.newProducts || 0,
          stockMovements: data.stockMovements || 0,
          lowStockCount: data.lowStockCount || [],
          outOfStockCount: data.outOfStockCount || [],
          transfers: data.transfers || 0,
        });
        break;
      
      case EmailActionsEvent.ReportMonthlySummary:
        if (!data?.name || !data?.month || !data?.year) {
          throw new Error('Missing required data: name, month, and year');
        }
        await this.mailService.reportMonthlySummary({
          email,
          name: data.name,
          month: data.month,
          year: data.year,
          totalSales: data.totalSales || 0,
          totalPurchases: data.totalPurchases || 0,
          newCustomers: data.newCustomers || 0,
          topProducts: data.topProducts || [],
          avgInventory: data.avgInventory || 0,
          profitability: data.profitability || 0,
          reportLink: data.reportLink || '',
        });
        break;
      
      case EmailActionsEvent.ReportCustomGenerated:
        // Para reportes personalizados, podríamos implementar una lógica específica
        // Por ahora, lanzamos un error indicando que no está implementado
        throw new Error('Custom report generation not implemented yet');
      
      default:
        throw new Error(`Unsupported report event: ${event}`);
    }
  }
}
