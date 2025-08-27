export class InvetoryLowEvent {
  constructor(
    public readonly product: string,
    public readonly quantity: number,
    public readonly location: string,
    public readonly email: string,
  ) {}
}

export class InventoryOutEvent {
  constructor(
    public readonly product: string,
    public readonly location: string,
    public readonly lastUpdate: Date,
    public readonly email: string,
  ) {}
}

export class InventoryTransferCompleteEvent {
  constructor(
    public readonly product: string,
    public readonly quantity: number,
    public readonly fromLocation: string,
    public readonly toLocation: string,
    public readonly date: Date,
    public readonly email: string,
  ) {}
}
