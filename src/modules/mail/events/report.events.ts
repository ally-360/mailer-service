export class ReportDailySummaryEvent {
  constructor(
    public readonly name: string,
    public readonly sales: number,
    public readonly purchases: number,
    public readonly newProducts: number,
    public readonly stockMovements: number,
    public readonly lowStockCount: Array<string>,
    public readonly outOfStockCount: Array<string>,
    public readonly transfers: number,
    public readonly date: Date,
    public readonly summary: string,
    public readonly email: string,
  ) {}
}

export class ReportMonthlySummaryEvent {
  constructor(
    public readonly name: string,
    public readonly month: string,
    public readonly year: number,
    public readonly totalSales: number,
    public readonly totalPurchases: number,
    public readonly newCustomers: number,
    public readonly topProducts: Array<{ name: string; quantity: number }>,
    public readonly avgInventory: number,
    public readonly profitability: number,
    public readonly email: string,
    public readonly reportLink: string,
  ) {}
}
