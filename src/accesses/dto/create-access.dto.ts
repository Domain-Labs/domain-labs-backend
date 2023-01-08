export class CreateAccessDto {
  readonly wallet: string;
  readonly accessCount: number;
  readonly accessTime: Date;
  readonly accessYear?: string;
  readonly accessMonth?: string;
  readonly accessDate?: string;
  readonly accessHour?: string;
  readonly accessMinute?: string;
}
