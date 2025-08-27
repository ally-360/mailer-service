export interface IEmailStrategy {
  canHandle(event: string): boolean;
  send(email: string, data?: Record<string, any>): Promise<void>;
}
