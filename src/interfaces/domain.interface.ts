export type DomainType = 'ETH' | 'SOL' | 'BNB';

export interface DomainStatus {
  name: string;
  type: DomainType;
  registered: boolean;
  owner?: string;
  expiration?: string;
}

export interface Purchase {
  domains: Array<DomainInputType>;
  address: string;
  solAddress: string;
  estimationAmount: number;
  amountReceived: number;
  paymentOption: DomainType;
  transaction: string;
  purchased: boolean;
  failed: Array<DomainInputType>;
  created: Date;
}

export interface Domain {
  label: string;
  type: DomainType;
  address: string;
  committed: boolean;
  commitSecret: string;
  duration: number;
  created: Date;
}

export interface DomainInputType {
  name: string;
  type: DomainType;
  duration?: number;
  reason?: string;
}

export enum EPaymentOptions {
  BNB = 'BNB',
  ETH = 'ETH',
  SOL = 'SOL',
}

export interface CNSEstimatedExchangeAmountResponseType {
  fromCurrency: string;
  fromNetwork: string;
  toCurrency: string;
  toNetwork: string;
  flow: 'standard' | 'fixed-rate';
  type: 'direct' | 'reverse';
  rateId: string | null;
  validUntil: string | null;
  transactionSpeedForecast: string | null;
  warningMessage: string | null;
  fromAmount: number;
  toAmount: number;
}

export interface CNSExchangeResponeType {
  fromCurrency: string;
  fromNetwork: string;
  toCurrency: string;
  toNetwork: string;
  fromAmount: number;
  toAmount: number;
  address: string;
  flow: 'standard' | 'fixed-rate';
  type: 'direct' | 'reverse';
  rateId: string | null;
}
