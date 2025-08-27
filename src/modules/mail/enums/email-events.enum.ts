export enum EmailActionsEvent {
  UserRegistered = 'user.registered',
  ActivationLink = 'user.verify',
  ReqResetPassword = 'user.req.reset',
  PasswordResetSuccess = 'user.reset.password.success',
  AccountDeactivated = 'user.account.deactivated',
  InventoryLow = 'inventory.low',
  InventoryOut = 'inventory.out',
  InventoryTransferComplete = 'inventory.transfer.complete',
  ReportDailySummary = 'report.daily.summary',
  ReportMonthlySummary = 'report.monthly.summary',
  ReportCustomGenerated = 'report.custom.generated',
}
