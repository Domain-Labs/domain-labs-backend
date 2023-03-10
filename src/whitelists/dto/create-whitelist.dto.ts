export class CreateWhitelistDto {
  readonly wallet: string;
  readonly country: string;
  readonly whitelistCount: number;
  readonly whitelistTime: Date;
  readonly whitelistYear?: string;
  readonly whitelistMonth?: string;
  readonly whitelistDate?: string;
  readonly whitelistHour?: string;
  readonly whitelistMinute?: string;
}
