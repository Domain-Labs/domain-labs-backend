export class CreateBuyDto {
  readonly wallet: string;
  readonly buyCount: number;
  readonly buyMoney: number;
  readonly buyTime?: Date;
  readonly buyYear?: string;
  readonly buyMonth?: string;
  readonly buyDate?: string;
  readonly buyHour?: string;
  readonly buyMinute?: string;
}
